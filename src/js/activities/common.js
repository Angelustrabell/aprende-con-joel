// Utilidades compartidas por las actividades.
import { h, onResize } from '../core/dom.js';
import { fitGrid } from '../core/util.js';
import { renderCard } from '../core/card.js';

// Coloca n elementos cuadrados dentro de "box" con el mayor tamaño posible (variable CSS --sz).
export function autoGrid(box, n, { gap = 0.04, maxFrac = 0.42, aspect = 1, minCols = 1 } = {}) {
  return onResize(box, (w, hgt) => {
    const g = Math.round(Math.min(w, hgt) * gap);
    let { cols, size } = fitGrid(w, hgt, n, g, aspect, Math.min(w, hgt) * (n === 1 ? 0.9 : maxFrac) * (n <= 2 ? 1.3 : 1));
    if (cols < minCols && n >= minCols) {
      cols = minCols;
      size = Math.min(size, (w - g * (cols - 1)) / cols);
    }
    box.style.setProperty('--sz', `${Math.floor(size)}px`);
    box.style.setProperty('--gap', `${g}px`);
    box.style.setProperty('--cols', String(cols));
  });
}

// Botón-tarjeta para elegir.
export function optionCard(c, { onTap, caption = true, cls = '' } = {}) {
  const el = renderCard(c, { caption, cls: `opt ${cls}`, tag: 'button', attrs: { type: 'button' } });
  if (onTap) el.addEventListener('click', (e) => { e.preventDefault(); onTap(el, e); });
  return el;
}

export const ARROW_SVG = '<svg viewBox="0 0 24 24" width="62%" height="62%" aria-hidden="true"><path d="M4 12h14M12.5 5.5 19 12l-6.5 6.5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function questionSlot() {
  return h('div', { class: 'cardv q-slot' }, h('span', { class: 'cv-text len-1' }, '?'));
}

export const later = (fn, ms, timers) => {
  const t = setTimeout(fn, ms);
  timers.push(t);
  return t;
};

export const clearTimers = (timers) => timers.forEach((t) => clearTimeout(t));

// Resalta (pista) elementos.
export function hintEls(els, level) {
  for (const el of els) {
    if (!el) continue;
    el.classList.remove('hint-1', 'hint-2');
    el.classList.add(level >= 2 ? 'hint-2' : 'hint-1');
  }
}
