// Formularios de edición para cada tipo de actividad.
import { h } from '../core/dom.js';
import { renderCard, emptyCard, card } from '../core/card.js';
import { pickFile, saveBlob, saveImage } from '../core/media.js';
import { emojiName } from '../data/emoji.js';
import { COLORING_PAGES, coloringUrl } from '../data/activityTypes.js';
import { editCard } from './cardEditor.js';
import { field, stepper, sayInput, recorderWidget, mediaPreview } from './widgets.js';

// changed(rebuild): rebuild=true vuelve a dibujar el formulario (cambios de estructura).

function section(title, hint, ...children) {
  return h('section', { class: 'form-section' }, h('h3', title), hint ? h('p', { class: 'muted' }, hint) : null, ...children);
}

function slot(c, onSet, opts = {}) {
  const { label = '', removable = false, onRemove, correct = null, onToggleCorrect, onLeft, onRight, cls = '' } = opts;
  const el = h('div', { class: `slot ${cls}` });
  const btn = h('button', { class: 'slot-card', type: 'button', title: 'Editar tarjeta' }, renderCard(c || emptyCard(), { cls: 'slot-cardv' }));
  btn.addEventListener('click', async () => {
    const r = await editCard(c);
    if (r) onSet(r);
  });
  el.append(btn);
  if (label) el.append(h('small', { class: 'slot-label' }, label));
  if (correct !== null) {
    el.append(h('button', { class: `slot-ok ${correct ? 'on' : ''}`, type: 'button', title: correct ? 'Correcta' : 'Marcar como correcta', onclick: onToggleCorrect }, '✓'));
  }
  if (removable) el.append(h('button', { class: 'slot-x', type: 'button', title: 'Quitar', onclick: onRemove }, '×'));
  if (onLeft || onRight) {
    el.append(h('div', { class: 'slot-move' },
      h('button', { class: 'mini-btn', type: 'button', disabled: !onLeft, onclick: onLeft, title: 'Mover a la izquierda' }, '◀'),
      h('button', { class: 'mini-btn', type: 'button', disabled: !onRight, onclick: onRight, title: 'Mover a la derecha' }, '▶')));
  }
  return el;
}

function addTile(onAdd, label = 'Añadir') {
  const b = h('button', { class: 'slot add-slot', type: 'button' }, h('span', '＋'), h('small', label));
  b.addEventListener('click', async () => {
    const r = await editCard(emptyCard(), { title: 'Nueva tarjeta' });
    if (r) onAdd(r);
  });
  return b;
}

const move = (arr, i, d) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
};

function cardList(list, changed, { min = 1, max = 8, labelFor = null, cls = '', movable = false } = {}) {
  const grid = h('div', { class: `slot-grid ${cls}` });
  list.forEach((c, i) => grid.append(slot(c, (r) => { list[i] = r; changed(true); }, {
    label: labelFor ? labelFor(i) : '',
    removable: list.length > min,
    onRemove: () => { list.splice(i, 1); changed(true); },
    onLeft: movable && i > 0 ? () => { move(list, i, -1); changed(true); } : null,
    onRight: movable && i < list.length - 1 ? () => { move(list, i, 1); changed(true); } : null,
  })));
  if (list.length < max) grid.append(addTile((r) => { list.push(r); changed(true); }));
  return grid;
}

function promptSection(act, changed) {
  act.prompt = act.prompt || { say: '', audio: '' };
  return section('🗣️ Instrucción', 'Lo que dice la mascota al empezar. Escríbela (voz automática) o grábala con tu voz.',
    sayInput(act.prompt.say, (v) => { act.prompt.say = v; changed(false); }, 'Ej.: ¿Dónde está el perro?'),
    recorderWidget(act.prompt.audio, (n) => { act.prompt.audio = n; changed(false); }, { label: 'Grabar la instrucción' }));
}

const BUILDERS = {
  choose(act, changed) {
    act.correct = act.correct || [];
    const grid = h('div', { class: 'slot-grid' });
    act.options.forEach((c, i) => grid.append(slot(c, (r) => { act.options[i] = r; changed(true); }, {
      correct: act.correct.includes(i),
      onToggleCorrect: () => {
        act.correct = act.correct.includes(i) ? act.correct.filter((x) => x !== i) : [...act.correct, i];
        changed(true);
      },
      removable: act.options.length > 2,
      onRemove: () => {
        act.options.splice(i, 1);
        act.correct = act.correct.filter((x) => x !== i).map((x) => (x > i ? x - 1 : x));
        changed(true);
      },
    })));
    if (act.options.length < 6) grid.append(addTile((r) => { act.options.push(r); changed(true); }));
    const target = act.target
      ? slot(act.target, (r) => { act.target = r; changed(true); }, { removable: true, onRemove: () => { act.target = null; changed(true); }, label: 'Pregunta' })
      : h('button', {
        class: 'btn btn-ghost', type: 'button',
        onclick: async () => { const r = await editCard(emptyCard(), { title: 'Tarjeta de pregunta' }); if (r) { act.target = r; changed(true); } },
      }, '＋ Añadir tarjeta de pregunta');
    return [
      section('🃏 Opciones', 'Toca una tarjeta para editarla. Marca con ✓ la correcta (puede haber varias: "toca todos los animales").', grid),
      section('❓ Tarjeta de pregunta (opcional)', 'Se muestra arriba en grande. Ej.: la letra A para "¿Qué empieza con A?".', target),
    ];
  },

  listen(act, changed) {
    act.sound = act.sound || { say: '', audio: '' };
    const grid = h('div', { class: 'slot-grid' });
    act.options.forEach((c, i) => grid.append(slot(c, (r) => { act.options[i] = r; changed(true); }, {
      correct: act.correct === i,
      onToggleCorrect: () => { act.correct = i; changed(true); },
      removable: act.options.length > 2,
      onRemove: () => {
        act.options.splice(i, 1);
        if (act.correct === i) act.correct = 0;
        else if (act.correct > i) act.correct--;
        changed(true);
      },
    })));
    if (act.options.length < 6) grid.append(addTile((r) => { act.options.push(r); changed(true); }));
    const custom = !!(act.sound.say || act.sound.audio);
    const mode = h('select', { class: 'input' },
      h('option', { value: 'card', selected: !custom }, 'Lo que dice la tarjeta correcta'),
      h('option', { value: 'custom', selected: custom }, 'Otro sonido (ej.: "muuu" o un sonido grabado)'));
    mode.addEventListener('change', () => {
      if (mode.value === 'card') act.sound = { say: '', audio: '' };
      else act.sound = { say: '...', audio: '' };
      changed(true);
    });
    return [
      section('🃏 Opciones', 'Marca con ✓ la que suena.', grid),
      section('🔊 Sonido que se escucha', null, mode,
        custom ? sayInput(act.sound.say, (v) => { act.sound.say = v; changed(false); }, 'Ej.: muuu') : null,
        custom ? recorderWidget(act.sound.audio, (n) => { act.sound.audio = n; changed(false); }, { label: 'Grabar el sonido' }) : null),
    ];
  },

  match(act, changed) {
    const rows = h('div', { class: 'pair-rows' });
    act.pairs.forEach((p, i) => rows.append(h('div', { class: 'pair-row' },
      slot(p.a, (r) => { p.a = r; changed(true); }, { label: 'Ficha (arriba)' }),
      h('span', { class: 'pair-link' }, '⟷'),
      slot(p.b, (r) => { p.b = r; changed(true); }, { label: 'Pareja (abajo)' }),
      act.pairs.length > 2 ? h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Quitar pareja', onclick: () => { act.pairs.splice(i, 1); changed(true); } }, '🗑') : null,
    )));
    const add = act.pairs.length < 5 ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { act.pairs.push({ a: emptyCard(), b: emptyCard() }); changed(true); } }, '＋ Añadir pareja') : null;
    return [section('🔗 Parejas', 'De 2 a 5 parejas. Ej.: animal y su comida, letra y dibujo, número y cantidad.', rows, add)];
  },

  count(act, changed) {
    const op = h('select', { class: 'input' },
      h('option', { value: 'none', selected: act.op === 'none' }, 'Solo contar'),
      h('option', { value: 'add', selected: act.op === 'add' }, 'Sumar (dos grupos)'),
      h('option', { value: 'sub', selected: act.op === 'sub' }, 'Restar (se van algunos)'));
    op.addEventListener('change', () => { act.op = op.value; changed(true); });
    return [
      section('🍎 Qué se cuenta', null, slot(act.item, (r) => { act.item = r; changed(true); })),
      section('🔢 Números', 'Las opciones de respuesta se crean solas.',
        field('Tipo', op),
        field(act.op === 'add' ? 'Primer grupo' : act.op === 'sub' ? 'Cuántos hay' : 'Cuántos hay', stepper(act.number, { min: 1, max: 20, onChange: (v) => { act.number = v; changed(false); } })),
        act.op !== 'none' ? field(act.op === 'add' ? 'Segundo grupo' : 'Cuántos se van', stepper(act.second, { min: 1, max: 20, onChange: (v) => { act.second = v; changed(false); } })) : null),
    ];
  },

  order(act, changed) {
    return [section('🪜 Tarjetas en el orden correcto', 'Ponlas aquí en el orden bueno (usa ◀ ▶ para moverlas). Joel las verá mezcladas.',
      cardList(act.items, changed, { min: 2, max: 6, movable: true, labelFor: (i) => `${i + 1}º` }))];
  },

  trace(act, changed) {
    const input = h('input', { class: 'input input-xl', value: act.char, maxlength: 3, placeholder: 'A' });
    input.addEventListener('input', () => { act.char = input.value; changed(false); });
    return [section('✍️ Qué se traza', 'Una letra (mayúscula o minúscula), un número o una sílaba corta (máx. 3 caracteres).', input)];
  },

  memory(act, changed) {
    const rows = h('div', { class: 'pair-rows' });
    act.pairs.forEach((p, i) => rows.append(h('div', { class: 'pair-row' },
      slot(p.a, (r) => { p.a = r; changed(true); }, { label: 'Carta' }),
      h('span', { class: 'pair-link' }, '＝'),
      p.b
        ? slot(p.b, (r) => { p.b = r; changed(true); }, { label: 'Su pareja', removable: true, onRemove: () => { p.b = null; changed(true); } })
        : h('button', {
          class: 'slot add-slot', type: 'button', title: 'Usar una pareja distinta',
          onclick: async () => { const r = await editCard(emptyCard(), { title: 'Pareja distinta' }); if (r) { p.b = r; changed(true); } },
        }, h('span', '＝'), h('small', 'Igual (toca para distinta)')),
      act.pairs.length > 2 ? h('button', { class: 'btn btn-ghost btn-icon', type: 'button', onclick: () => { act.pairs.splice(i, 1); changed(true); } }, '🗑') : null,
    )));
    const add = act.pairs.length < 8 ? h('button', {
      class: 'btn btn-ghost', type: 'button',
      onclick: async () => { const r = await editCard(emptyCard(), { title: 'Nueva carta' }); if (r) { act.pairs.push({ a: r, b: null }); changed(true); } },
    }, '＋ Añadir pareja') : null;
    return [section('🃏 Parejas', 'De 2 a 8 parejas. Por defecto las dos cartas son iguales; puedes hacer parejas distintas (letra y dibujo).', rows, add)];
  },

  pattern(act, changed) {
    act.extra = act.extra || [];
    const emojis = h('input', { class: 'input', placeholder: 'Emojis, ej.: 🔴🔵🟡' });
    const kind = h('select', { class: 'input' }, ...['AB', 'AAB', 'ABB', 'ABC', 'AABB'].map((k) => h('option', { value: k }, k)));
    const gen = h('button', { class: 'btn btn-ghost', type: 'button' }, 'Generar serie');
    gen.addEventListener('click', () => {
      const seg = new Intl.Segmenter('es', { granularity: 'grapheme' });
      const list = [...seg.segment(emojis.value)].map((s) => s.segment).filter((s) => s.trim());
      const need = new Set(kind.value).size;
      if (list.length < need) { emojis.focus(); return; }
      const map = {};
      [...new Set(kind.value)].forEach((letter, i) => { map[letter] = list[i]; });
      const unit = [...kind.value].map((l) => map[l]);
      const len = Math.max(6, unit.length * 2 + 1);
      act.sequence = Array.from({ length: len }, (_, i) => card(unit[i % unit.length], '', emojiName(unit[i % unit.length])));
      const unused = list.filter((e) => !unit.includes(e));
      act.extra = unused.slice(0, 2).map((e) => card(e, '', emojiName(e)));
      changed(true);
    });
    return [
      section('🔁 Serie', 'La última tarjeta es la respuesta (Joel verá un "?" en su lugar).',
        cardList(act.sequence, changed, { min: 3, max: 10, movable: true, labelFor: (i) => (i === act.sequence.length - 1 ? 'Respuesta' : '') , cls: 'seq-grid' })),
      section('⚡ Generar rápido', null, h('div', { class: 'row' }, emojis, kind, gen)),
      section('➕ Opciones extra (distractores)', 'Además de las que aparecen en la serie. Opcional.', cardList(act.extra, changed, { min: 0, max: 3 })),
    ];
  },

  sort(act, changed) {
    const boxes = act.groups.map((g, gi) => h('div', { class: 'group-box' },
      h('div', { class: 'group-head' },
        slot(g.label, (r) => { g.label = r; changed(true); }, { label: `Cesta ${gi + 1}` }),
        act.groups.length > 2 ? h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Quitar cesta', onclick: () => { act.groups.splice(gi, 1); changed(true); } }, '🗑') : null),
      h('div', { class: 'group-items' }, h('small', { class: 'muted' }, 'Van en esta cesta:'), cardList(g.items, changed, { min: 1, max: 6 })),
    ));
    const add = act.groups.length < 3 ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { act.groups.push({ label: card('🧺', 'cesta', 'cesta'), items: [] }); changed(true); } }, '＋ Añadir cesta') : null;
    return [section('🧺 Cestas', 'De 2 a 3 cestas, cada una con las cosas que van dentro.', h('div', { class: 'groups' }, ...boxes), add)];
  },

  view(act, changed) {
    const videoBox = h('div', { class: 'video-field' });
    const drawVideo = () => {
      videoBox.replaceChildren(
        act.video ? mediaPreview(act.video, 'video') : null,
        h('div', { class: 'row' },
          h('button', {
            class: 'btn btn-ghost', type: 'button',
            onclick: async () => {
              const f = await pickFile('video/mp4,video/webm');
              if (!f) return;
              act.video = await saveBlob(f);
              changed(true);
            },
          }, act.video ? '📂 Cambiar video' : '📂 Subir video (mp4 o webm)'),
          act.video ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { act.video = ''; changed(true); } }, 'Quitar video') : null),
      );
    };
    drawVideo();
    return [
      section('🖼️ Imagen grande', 'La explicación es la instrucción de arriba (puedes grabarla con tu voz).', slot(act.card, (r) => { act.card = r; changed(true); })),
      section('🎬 Video (opcional)', 'Si pones un video, se muestra en lugar de la imagen.', videoBox),
    ];
  },

  paint(act, changed) {
    const modeNow = act.mode || (act.image ? 'image' : act.builtin ? 'builtin' : 'free');
    const seg = h('div', { class: 'seg' }, ...[['free', '✏️ Dibujo libre'], ['builtin', '📄 Lámina incluida'], ['image', '🖼️ Mi propia lámina']].map(([id, label]) => {
      const b = h('button', { class: `seg-btn ${modeNow === id ? 'on' : ''}`, type: 'button' }, label);
      b.addEventListener('click', () => {
        act.mode = id;
        if (id === 'free') { act.builtin = ''; act.image = ''; }
        if (id === 'builtin') { act.image = ''; act.builtin = act.builtin || 'sol'; }
        if (id === 'image') { act.builtin = ''; }
        changed(true);
      });
      return b;
    }));
    let body = null;
    if (modeNow === 'builtin') {
      body = h('div', { class: 'coloring-grid' }, ...COLORING_PAGES.map((p) => {
        const b = h('button', { class: `coloring-thumb ${act.builtin === p.id ? 'on' : ''}`, type: 'button' }, h('img', { src: coloringUrl(p.id), alt: '' }), h('small', p.name));
        b.addEventListener('click', () => { act.builtin = p.id; changed(true); });
        return b;
      }));
    } else if (modeNow === 'image') {
      body = h('div', { class: 'video-field' },
        act.image ? mediaPreview(act.image) : null,
        h('button', {
          class: 'btn btn-ghost', type: 'button',
          onclick: async () => {
            const f = await pickFile('image/*');
            if (!f) return;
            act.image = await saveImage(f, 1600);
            act.builtin = '';
            changed(true);
          },
        }, act.image ? '📂 Cambiar imagen' : '📂 Subir lámina (dibujo con líneas negras sobre fondo blanco)'));
    }
    return [section('🖍️ Tipo de dibujo', 'Con lámina, Joel puede usar la cubeta 🪣 para rellenar zonas.', seg, body)];
  },
};

export function buildForm(act, changed) {
  const parts = BUILDERS[act.type](act, changed);
  return h('div', { class: 'act-form' }, promptSection(act, changed), ...parts);
}
