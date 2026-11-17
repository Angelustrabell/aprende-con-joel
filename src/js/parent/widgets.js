// Controles reutilizables del modo papá.
import { h } from '../core/dom.js';
import { EMOJI_CATEGORIES, searchEmoji } from '../data/emoji.js';
import { Recorder, saveBlob, pickFile, mediaUrl } from '../core/media.js';
import { playFile, speak, stopSpeech } from '../core/speech.js';
import { toast } from '../core/modal.js';

export function field(label, control, hint = '') {
  return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), control, hint ? h('small', { class: 'field-hint' }, hint) : null);
}

export function toggle(checked, onChange, label = '') {
  const input = h('input', { type: 'checkbox', checked });
  input.addEventListener('change', () => onChange(input.checked));
  return h('label', { class: 'switch' }, input, h('span', { class: 'slider' }), label ? h('span', { class: 'switch-label' }, label) : null);
}

export function stepper(value, { min = 0, max = 99, step = 1, onChange }) {
  const input = h('input', { class: 'input stepper-input', type: 'number', min, max, step, value: String(value) });
  const set = (v) => {
    v = Math.max(min, Math.min(max, Number(v) || min));
    input.value = String(v);
    onChange(v);
  };
  input.addEventListener('change', () => set(input.value));
  return h('div', { class: 'stepper' },
    h('button', { class: 'btn btn-icon', type: 'button', onclick: () => set(Number(input.value) - step) }, '−'),
    input,
    h('button', { class: 'btn btn-icon', type: 'button', onclick: () => set(Number(input.value) + step) }, '+'));
}

// Rejilla de emojis con categorías y búsqueda. onPick(emoji, nombre)
export function emojiGrid(onPick, { compact = false } = {}) {
  let cat = 0;
  const search = h('input', { class: 'input', type: 'search', placeholder: 'Buscar (ej.: perro, rojo, tren)…' });
  const tabs = h('div', { class: 'emoji-tabs' });
  const grid = h('div', { class: `emoji-grid ${compact ? 'compact' : ''}` });
  const drawTabs = () => tabs.replaceChildren(...EMOJI_CATEGORIES.map((c, i) => {
    const b = h('button', { class: `emoji-tab ${i === cat && !search.value ? 'on' : ''}`, type: 'button', title: c.name }, c.icon);
    b.addEventListener('click', () => { cat = i; search.value = ''; draw(); });
    return b;
  }));
  const draw = () => {
    drawTabs();
    const items = search.value.trim() ? searchEmoji(search.value) : EMOJI_CATEGORIES[cat].items;
    grid.replaceChildren(...items.map(([e, n]) => {
      const b = h('button', { class: 'emoji-cell', type: 'button', title: n }, e);
      b.addEventListener('click', () => onPick(e, n));
      return b;
    }));
    if (!items.length) grid.append(h('p', { class: 'muted' }, 'Nada encontrado. También puedes pegar un emoji en el campo.'));
  };
  search.addEventListener('input', draw);
  draw();
  return h('div', { class: 'emoji-picker' }, search, tabs, grid);
}

// Campo de icono (emoji o texto corto) con selector desplegable.
export function iconInput(value, onChange) {
  const input = h('input', { class: 'input icon-input', value, maxlength: 8 });
  const pop = h('div', { class: 'icon-pop hidden' });
  const btn = h('button', { class: 'btn btn-ghost', type: 'button' }, 'Elegir…');
  input.addEventListener('input', () => onChange(input.value.trim()));
  btn.addEventListener('click', () => {
    if (!pop.childNodes.length) {
      pop.append(emojiGrid((e) => { input.value = e; onChange(e); pop.classList.add('hidden'); }, { compact: true }));
    }
    pop.classList.toggle('hidden');
  });
  return h('div', { class: 'icon-field' }, h('div', { class: 'row' }, input, btn), pop);
}

export const PRESET_COLORS = ['#6c4cf5', '#ff5a5f', '#ff9f1c', '#ffd23f', '#2ecc71', '#2ec4ff', '#ff6fb5', '#795548', '#34495e'];

export function colorChoice(value, onChange) {
  const wrap = h('div', { class: 'color-choice' });
  const draw = () => wrap.replaceChildren(...PRESET_COLORS.map((c) => {
    const b = h('button', { class: `swatch ${c === value ? 'on' : ''}`, type: 'button', style: { background: c } });
    b.addEventListener('click', () => { value = c; onChange(c); draw(); });
    return b;
  }));
  draw();
  return wrap;
}

// Grabadora: botones para grabar, escuchar, borrar o subir un audio. onChange(nombreArchivo | '')
export function recorderWidget(value, onChange, { maxSeconds = 15, label = 'Grabar mi voz' } = {}) {
  let current = value || '';
  let rec = null;
  let timer = null;
  let seconds = 0;
  const wrap = h('div', { class: 'recorder' });

  const draw = () => {
    wrap.replaceChildren();
    if (rec) {
      const stopBtn = h('button', { class: 'btn btn-danger rec-on', type: 'button' }, `⏹ Detener (${seconds}s)`);
      stopBtn.addEventListener('click', stop);
      wrap.append(stopBtn);
      return;
    }
    const recBtn = h('button', { class: 'btn btn-ghost', type: 'button' }, current ? '🎙️ Regrabar' : `🎙️ ${label}`);
    recBtn.addEventListener('click', start);
    wrap.append(recBtn);
    if (current) {
      wrap.append(
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => playFile(current) }, '▶ Escuchar'),
        h('button', { class: 'btn btn-ghost', type: 'button', title: 'Quitar grabación', onclick: () => { current = ''; onChange(''); draw(); } }, '🗑'),
      );
    }
    const up = h('button', { class: 'btn btn-ghost', type: 'button', title: 'Subir un archivo de audio' }, '📂');
    up.addEventListener('click', async () => {
      const f = await pickFile('audio/*');
      if (!f) return;
      current = await saveBlob(f);
      onChange(current);
      draw();
    });
    wrap.append(up);
  };

  async function start() {
    stopSpeech();
    try {
      rec = new Recorder();
      await rec.start();
    } catch (e) {
      rec = null;
      toast('No se pudo usar el micrófono. Revisa que esté conectado y permitido en Windows.', 'error', 4000);
      return;
    }
    seconds = 0;
    timer = setInterval(() => {
      seconds++;
      draw();
      if (seconds >= maxSeconds) stop();
    }, 1000);
    draw();
  }

  async function stop() {
    clearInterval(timer);
    const r = rec;
    rec = null;
    const blob = await r?.stop();
    if (blob) {
      current = await saveBlob(blob, 'webm');
      onChange(current);
      playFile(current);
    }
    draw();
  }

  draw();
  wrap.cancel = () => { clearInterval(timer); rec?.cancel(); rec = null; };
  return wrap;
}

// Campo "lo que se dice" con botón para probar la voz.
export function sayInput(value, onChange, placeholder = 'Lo que dirá la voz') {
  const input = h('input', { class: 'input', value, placeholder });
  input.addEventListener('input', () => onChange(input.value));
  return h('div', { class: 'row say-row' }, input, h('button', { class: 'btn btn-ghost', type: 'button', title: 'Probar voz', onclick: () => speak(input.value) }, '🔊'));
}

export function mediaPreview(name, kind = 'image') {
  if (!name) return null;
  if (kind === 'video') return h('video', { class: 'media-preview', src: mediaUrl(name), controls: true });
  return h('img', { class: 'media-preview', src: mediaUrl(name), alt: '' });
}
