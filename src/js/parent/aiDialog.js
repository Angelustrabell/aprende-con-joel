// Crear una sesión con IA (opcional, necesita clave de API de Anthropic).
import { h } from '../core/dom.js';
import { save, settings } from '../core/store.js';
import { openModal, toast } from '../core/modal.js';
import { uid } from '../core/util.js';
import { card, cardThumb } from '../core/card.js';
import { emojiName } from '../data/emoji.js';
import { ACTIVITY_TYPES, validateActivity, activitySummary, activityCards } from '../data/activityTypes.js';
import { unitOf } from '../data/templates.js';
import { stepper } from './widgets.js';

const AI_TYPES = ['view', 'choose', 'listen', 'match', 'count', 'order', 'trace', 'memory', 'pattern', 'sort'];

const C = (c) => card(c?.emoji || '', c?.text || '', c?.say || c?.text || emojiName(c?.emoji) || '', /^#[0-9a-f]{6}$/i.test(c?.color || '') ? { color: c.color } : {});
const clampInt = (v, a, b) => Math.max(a, Math.min(b, Math.round(Number(v) || a)));

export function aiToSession(result) {
  const acts = [];
  for (const g of result.activities || []) {
    const prompt = { say: String(g.instruction || '').slice(0, 200), audio: '' };
    const cards = (g.cards || []).map(C);
    let a = null;
    const valid = (g.correct || []).filter((i) => i >= 0 && i < cards.length);
    switch (g.type) {
      case 'choose':
        a = { type: 'choose', prompt, target: null, options: cards.slice(0, 6), correct: valid.length ? valid.filter((i) => i < 6) : [0] };
        break;
      case 'listen':
        a = { type: 'listen', prompt, options: cards.slice(0, 6), correct: Math.min(valid[0] ?? 0, 5), sound: { say: '', audio: '' } };
        break;
      case 'match':
      case 'memory': {
        const pairs = [];
        for (let i = 0; i + 1 < cards.length && pairs.length < (g.type === 'match' ? 5 : 8); i += 2) {
          const same = cards[i].emoji === cards[i + 1].emoji && cards[i].text === cards[i + 1].text;
          pairs.push({ a: cards[i], b: g.type === 'memory' && same ? null : cards[i + 1] });
        }
        a = { type: g.type, prompt, pairs };
        break;
      }
      case 'count': {
        const op = ['none', 'add', 'sub'].includes(g.operation) ? g.operation : 'none';
        const number = clampInt(g.number, 1, 20);
        let second = clampInt(g.second || 1, 1, 20);
        if (op === 'sub') second = Math.min(second, number);
        if (op === 'add') second = Math.min(second, 20 - number) || 1;
        a = { type: 'count', prompt, item: cards[0] || card('⭐', '', 'estrella'), number, op, second };
        break;
      }
      case 'order':
        a = { type: 'order', prompt, items: cards.slice(0, 6) };
        break;
      case 'trace':
        a = { type: 'trace', prompt, char: [...String(g.text || cards[0]?.text || 'A').trim()].slice(0, 3).join('') };
        break;
      case 'pattern':
        a = { type: 'pattern', prompt, sequence: cards.slice(0, 10), extra: [] };
        break;
      case 'sort':
        a = { type: 'sort', prompt, groups: (g.groups || []).slice(0, 3).map((x) => ({ label: C(x.label), items: (x.items || []).map(C).slice(0, 6) })) };
        break;
      case 'view':
        a = { type: 'view', prompt, card: cards[0] || card('✨'), video: '' };
        break;
      default:
        break;
    }
    if (a) {
      a.id = uid();
      if (!validateActivity(a)) acts.push(a);
    }
  }
  return { id: uid(), title: String(result.title || 'Sesión IA').slice(0, 60), icon: [...String(result.icon || '✨')].slice(0, 2).join('') || '✨', activities: acts };
}

export async function aiDialog(course, unit, onDone) {
  const hasKey = await window.api.aiHasKey();
  const body = h('div', { class: 'ai-dialog' });
  let generated = null;
  const m = openModal({ title: '✨ Crear una sesión con IA', wide: true, content: body });

  function keyView() {
    const input = h('input', { class: 'input', type: 'password', placeholder: 'sk-ant-…', autocomplete: 'off' });
    body.replaceChildren(
      h('p', 'Esta función usa Claude (de Anthropic) para inventar actividades sobre el tema que le pidas. Necesitas una clave de API propia.'),
      h('ol', { class: 'muted' },
        h('li', 'Crea una cuenta en console.anthropic.com y añade saldo (cada sesión generada cuesta unos céntimos).'),
        h('li', 'Crea una clave de API y pégala aquí. Se guarda cifrada en este equipo.'),
        h('li', 'Solo se envía el tema que escribas; nunca datos de Joel.')),
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Clave de API'), input),
    );
    m.setActions([
      { label: 'Cancelar', class: 'btn-ghost' },
      {
        label: 'Guardar clave', class: 'btn-primary',
        onClick: async () => {
          const k = input.value.trim();
          if (!k) return false;
          await window.api.aiSetKey(k);
          formView();
          return false;
        },
      },
    ]);
  }

  function formView(prev = {}) {
    const topic = h('textarea', { class: 'input', rows: 3, placeholder: 'Ej.: Los animales de la granja y sus sonidos; o: Contar hasta 10 con frutas; o: Los planetas', value: prev.topic || '' });
    let count = prev.count || 6;
    const difficulty = h('select', { class: 'input' },
      ...[['fácil', 'Fácil'], ['normal', 'Normal'], ['un poco difícil', 'Un reto']].map(([v, l]) => h('option', { value: v, selected: v === (prev.difficulty || 'normal') }, l)));
    const types = new Set(prev.types || AI_TYPES);
    const chips = h('div', { class: 'chips' }, ...AI_TYPES.map((t) => {
      const b = h('button', { class: `chip ${types.has(t) ? 'on' : ''}`, type: 'button' }, `${ACTIVITY_TYPES[t].icon} ${ACTIVITY_TYPES[t].name}`);
      b.addEventListener('click', () => { if (types.has(t)) types.delete(t); else types.add(t); b.classList.toggle('on'); });
      return b;
    }));
    const err = h('p', { class: 'form-error' });
    body.replaceChildren(
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, '¿Sobre qué tema?'), topic),
      h('div', { class: 'row wrap' },
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Actividades'), stepper(count, { min: 3, max: 12, onChange: (v) => { count = v; } })),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Dificultad'), difficulty)),
      h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Tipos permitidos'), chips),
      h('p', { class: 'muted small' }, `Modelo: ${settings().aiModel}. Puedes cambiarlo o borrar la clave en Ajustes.`),
      err,
    );
    m.setActions([
      { label: 'Cancelar', class: 'btn-ghost' },
      {
        label: '✨ Generar', class: 'btn-primary',
        onClick: async () => {
          if (!topic.value.trim()) { err.textContent = 'Escribe un tema.'; return false; }
          if (!types.size) { err.textContent = 'Elige al menos un tipo.'; return false; }
          const req = { topic: topic.value.trim(), count, difficulty: difficulty.value, types: [...types], age: 5, model: settings().aiModel };
          loadingView();
          const r = await window.api.aiGenerate(req);
          if (!r.ok) { formView(req); body.querySelector('.form-error').textContent = `⚠️ ${r.error}`; return false; }
          generated = aiToSession(r.result);
          if (!generated.activities.length) { formView(req); body.querySelector('.form-error').textContent = '⚠️ La respuesta no tenía actividades válidas. Prueba otra vez.'; return false; }
          resultView(req);
          return false;
        },
      },
    ]);
  }

  function loadingView() {
    body.replaceChildren(h('div', { class: 'busy' }, h('div', { class: 'spinner' }), h('p', 'Inventando actividades… (puede tardar un minuto)')));
    m.setActions([]);
  }

  function resultView(req) {
    const dest = h('select', { class: 'input' },
      h('option', { value: '__new', selected: !unit }, 'Nueva unidad: "Creado con IA"'),
      ...course.units.map((u) => h('option', { value: u.id, selected: unit && u.id === unit.id }, `${u.icon || '📘'} ${u.title}`)));
    body.replaceChildren(
      h('div', { class: 'ai-result-head' }, h('span', { class: 'big-icon' }, generated.icon), h('b', generated.title), h('span', { class: 'muted' }, ` · ${generated.activities.length} actividades`)),
      h('div', { class: 'act-list compact' }, ...generated.activities.map((a, i) => h('div', { class: 'act-row' },
        h('span', { class: 'act-num' }, String(i + 1)),
        h('span', { class: 'act-type' }, ACTIVITY_TYPES[a.type].icon),
        h('div', { class: 'act-info' }, h('b', ACTIVITY_TYPES[a.type].name), h('div', { class: 'muted small' }, `«${a.prompt.say}»`), h('div', { class: 'small' }, activitySummary(a))),
        h('div', { class: 'act-thumbs' }, ...activityCards(a).slice(0, 4).map((c) => cardThumb(c, 36)))))),
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Añadir a'), dest),
      h('p', { class: 'muted small' }, 'Después podrás editar cada actividad, cambiar dibujos o grabar tu voz.'),
    );
    m.setActions([
      { label: '↺ Generar otra', class: 'btn-ghost', onClick: () => { formView(req); return false; } },
      {
        label: 'Añadir al curso', class: 'btn-primary',
        onClick: () => {
          if (dest.value === '__new') course.units.push(unitOf('Creado con IA', '✨', [generated]));
          else course.units.find((u) => u.id === dest.value).sessions.push(generated);
          save();
          onDone?.();
          toast('✔ Sesión añadida', 'ok');
          return true;
        },
      },
    ]);
  }

  if (hasKey) formView(); else keyView();
}
