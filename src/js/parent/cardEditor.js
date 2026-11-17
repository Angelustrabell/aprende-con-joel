// Editor de una tarjeta: emoji, imagen, color, texto y voz (sintética o grabada).
import { h } from '../core/dom.js';
import { renderCard, normalizeCard, emptyCard } from '../core/card.js';
import { openModal, toast } from '../core/modal.js';
import { saveImage, pickFile } from '../core/media.js';
import { sayThing } from '../core/speech.js';
import { clone } from '../core/util.js';
import { NAMED_COLORS } from '../data/emoji.js';
import { emojiGrid, recorderWidget, sayInput } from './widgets.js';

export function editCard(initial, { title = 'Editar tarjeta' } = {}) {
  return new Promise((resolve) => {
    const c = normalizeCard(clone(initial || emptyCard()));
    let result = null;
    let tab = c.image ? 'image' : c.emoji ? 'emoji' : c.color ? 'color' : (c.text ? 'text' : 'emoji');
    let rec = null;

    const preview = h('div', { class: 'ce-preview' });
    const tabsEl = h('div', { class: 'seg' });
    const panel = h('div', { class: 'ce-panel' });
    const textInput = h('input', { class: 'input', value: c.text, placeholder: 'Letra, número o palabra (opcional)' });
    const sayBox = h('div');
    const audioBox = h('div');

    const updatePreview = () => {
      preview.replaceChildren(renderCard(c, { cls: 'ce-card' }),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => sayThing(c) }, '🔊 Escuchar'));
    };

    const drawSay = () => {
      sayBox.replaceChildren(sayInput(c.say, (v) => { c.say = v; }, 'Ej.: el perro'));
    };

    const drawTabs = () => tabsEl.replaceChildren(...[
      ['emoji', '😀 Emoji'], ['image', '🖼️ Imagen'], ['color', '🎨 Color'], ['text', '🔤 Solo texto'],
    ].map(([id, label]) => {
      const b = h('button', { class: `seg-btn ${tab === id ? 'on' : ''}`, type: 'button' }, label);
      b.addEventListener('click', () => { tab = id; drawTabs(); drawPanel(); });
      return b;
    }));

    const drawPanel = () => {
      panel.replaceChildren();
      if (tab === 'emoji') {
        panel.append(
          emojiGrid((e, n) => {
            c.emoji = e;
            c.image = '';
            if (!c.say || c.say === c._autoSay) { c.say = n; c._autoSay = n; drawSay(); }
            updatePreview();
          }),
          h('div', { class: 'row' },
            h('small', { class: 'muted' }, 'También puedes escribir o pegar cualquier emoji:'),
            (() => {
              const i = h('input', { class: 'input emoji-free', value: c.emoji, placeholder: '🙂' });
              i.addEventListener('input', () => { c.emoji = i.value.trim(); if (c.emoji) c.image = ''; updatePreview(); });
              return i;
            })(),
            c.emoji ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { c.emoji = ''; updatePreview(); drawPanel(); } }, 'Quitar emoji') : null,
          ),
        );
      } else if (tab === 'image') {
        const up = h('button', { class: 'btn btn-primary', type: 'button' }, '📂 Subir imagen');
        up.addEventListener('click', async () => {
          const f = await pickFile('image/*');
          if (f) await setImage(f);
        });
        panel.append(h('div', { class: 'ce-image' },
          up,
          h('p', { class: 'muted' }, 'Fotos de la familia, de sus juguetes, dibujos… También puedes copiar una imagen y pegarla aquí con Ctrl+V.'),
          c.image ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { c.image = ''; updatePreview(); drawPanel(); } }, 'Quitar imagen') : null,
        ));
      } else if (tab === 'color') {
        const custom = h('input', { type: 'color', class: 'color-input', value: c.color || '#e53935' });
        custom.addEventListener('input', () => { c.color = custom.value; updatePreview(); });
        panel.append(
          h('div', { class: 'named-colors' }, ...NAMED_COLORS.map(([n, hex]) => {
            const b = h('button', { class: `named-color ${c.color === hex ? 'on' : ''}`, type: 'button', style: { '--c': hex } }, h('span', n));
            b.addEventListener('click', () => {
              c.color = hex;
              if (!c.say || c.say === c._autoSay) { c.say = n; c._autoSay = n; drawSay(); }
              updatePreview();
              drawPanel();
            });
            return b;
          })),
          h('div', { class: 'row' }, h('span', 'Otro color:'), custom,
            c.color ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { c.color = ''; updatePreview(); drawPanel(); } }, 'Quitar color') : null),
          h('p', { class: 'muted' }, 'El color rellena la tarjeta. Si además hay un emoji, queda como fondo.'),
        );
      } else {
        panel.append(h('p', { class: 'muted' }, 'Escribe abajo, en "Texto visible", la letra, número o palabra. Se mostrará en grande. (Quita el emoji o la imagen si quieres solo texto.)'),
          (c.emoji || c.image) ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { c.emoji = ''; c.image = ''; updatePreview(); drawPanel(); } }, 'Quitar emoji/imagen') : null);
      }
    };

    async function setImage(file) {
      try {
        c.image = await saveImage(file);
        c.emoji = '';
        tab = 'image';
        drawTabs();
        drawPanel();
        updatePreview();
      } catch (e) {
        toast(`No se pudo guardar la imagen: ${e.message}`, 'error');
      }
    }

    const onPaste = (e) => {
      const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
      if (item) {
        e.preventDefault();
        setImage(item.getAsFile());
      }
    };
    document.addEventListener('paste', onPaste);

    textInput.addEventListener('input', () => {
      const prevAuto = !c.say || c.say === c.text;
      c.text = textInput.value;
      if (prevAuto) { c.say = c.text; drawSay(); }
      updatePreview();
    });

    rec = recorderWidget(c.audio, (name) => { c.audio = name; }, { label: 'Grabar mi voz' });
    audioBox.append(rec);

    drawTabs();
    drawPanel();
    drawSay();
    updatePreview();

    openModal({
      title,
      wide: true,
      content: h('div', { class: 'card-editor' },
        h('div', { class: 'ce-left' }, preview),
        h('div', { class: 'ce-right' },
          h('div', { class: 'ce-section' }, h('div', { class: 'ce-h' }, '1. Dibujo'), tabsEl, panel),
          h('div', { class: 'ce-section' }, h('div', { class: 'ce-h' }, '2. Texto visible'), textInput,
            h('small', { class: 'muted' }, 'Con dibujo aparece debajo como pie. Déjalo vacío si Joel aún no lee.')),
          h('div', { class: 'ce-section' }, h('div', { class: 'ce-h' }, '3. Voz (lo que se oye al tocarla)'), sayBox, audioBox,
            h('small', { class: 'muted' }, 'Si grabas tu voz, se usa la grabación en vez de la voz automática.')),
        ),
      ),
      actions: [
        { label: 'Vaciar', class: 'btn-ghost', onClick: () => { Object.assign(c, emptyCard()); textInput.value = ''; drawSay(); drawPanel(); updatePreview(); rec.replaceWith(rec = recorderWidget('', (n) => { c.audio = n; })); return false; } },
        { label: 'Cancelar', class: 'btn-ghost' },
        { label: 'Guardar', class: 'btn-primary', onClick: () => { delete c._autoSay; result = c; } },
      ],
      onClose: () => {
        document.removeEventListener('paste', onPaste);
        rec?.cancel?.();
        resolve(result);
      },
    });
  });
}
