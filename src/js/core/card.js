// Tarjetas: la pieza básica de contenido (emoji, imagen, texto, color y sonido).
import { h } from './dom.js';
import { mediaUrl } from './media.js';
import { settings } from './store.js';

export const emptyCard = () => ({ emoji: '', image: '', text: '', color: '', say: '', audio: '' });

export function normalizeCard(c) {
  return { ...emptyCard(), ...(c || {}) };
}

export const card = (emoji = '', text = '', say = '', extra = {}) => ({ ...emptyCard(), emoji, text, say: say || text, ...extra });

export const cardIsEmpty = (c) => !c || !(c.emoji || c.image || c.text || c.color);

// Identidad visual de la tarjeta (dos tarjetas con la misma clave se consideran iguales).
export function cardKey(c) {
  if (!c) return '';
  return [c.image, c.emoji, (c.text || '').toLowerCase(), (c.color || '').toLowerCase()].join('|');
}

export function cardLabel(c) {
  if (!c) return '';
  return c.text || c.say || c.emoji || (c.image ? '🖼️ imagen' : '') || (c.color ? `color ${c.color}` : '') || '(vacía)';
}

function textClass(text) {
  const len = [...text].length;
  if (len <= 2) return 'len-1';
  if (len <= 4) return 'len-2';
  if (len <= 8) return 'len-3';
  return 'len-4';
}

// Dibuja una tarjeta. Usa unidades relativas a su propio tamaño (container queries).
export function renderCard(c, { caption = true, cls = '', tag = 'div', attrs = {} } = {}) {
  c = normalizeCard(c);
  const el = h(tag, { class: `cardv ${cls}`, ...attrs });
  const showCaption = caption && settings().showCaptions !== false;
  const colorOnly = c.color && !c.image && !c.emoji && !c.text;
  if (c.color) {
    el.classList.add('has-color');
    el.style.setProperty('--card-color', c.color);
  }
  if (c.image) {
    el.append(h('img', { class: 'cv-img', src: mediaUrl(c.image), draggable: 'false', alt: '' }));
  } else if (c.emoji) {
    el.append(h('span', { class: 'cv-emoji' }, c.emoji));
  } else if (colorOnly) {
    el.classList.add('color-only');
  } else if (c.text) {
    el.append(h('span', { class: `cv-text ${textClass(c.text)}` }, c.text));
    return el;
  } else {
    el.append(h('span', { class: 'cv-empty' }, '＋'));
    el.classList.add('is-empty');
  }
  if (c.text && showCaption && (c.image || c.emoji)) {
    el.classList.add('with-caption');
    el.append(h('span', { class: 'cv-caption' }, c.text));
  }
  return el;
}

// Miniatura para las listas del modo papá.
export function cardThumb(c, size = 48) {
  const el = renderCard(c, { caption: false, cls: 'thumb' });
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  return el;
}
