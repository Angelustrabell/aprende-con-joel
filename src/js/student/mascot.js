// La mascota con sus accesorios y su globo de diálogo.
import { h, animateClass } from '../core/dom.js';
import { shopItem } from '../data/rewards.js';
import { glyph, isArt } from '../data/mascotArt.js';

// La guía de un curso: la mascota que papá le asignó al curso (course.mascot) o, si no tiene, la del alumno.
export function courseMascot(course, student) {
  const own = course?.mascot;
  if (own?.kind) return { kind: own.kind, name: own.name || '' };
  return { kind: student?.mascot?.kind || 'svg:nous', name: student?.mascot?.name || '' };
}

export function mascotEl(student, { size = '30vmin', cls = '', preview = null, course = null } = {}) {
  const base = student?.mascot || { kind: 'svg:nous', wearing: {} };
  const m = { ...base, kind: courseMascot(course, student).kind };
  const w = { ...(m.wearing || {}), ...(preview || {}) };
  const acc = (slot) => {
    const it = w[slot] ? shopItem(w[slot]) : null;
    return it && it.e ? h('span', { class: `m-acc m-${slot}` }, it.e) : null;
  };
  return h('div', { class: `mascot ${isArt(m.kind) ? `m-art m-${m.kind.slice(4)}` : ''} ${cls}`, style: { '--ms': size } },
    h('span', { class: 'm-shadow' }),
    h('span', { class: 'm-body' }, glyph(m.kind)),
    acc('neck'), acc('face'), acc('hat'), acc('hand'),
  );
}

export function mascotReact(el, mood) {
  const cls = mood === 'happy' ? 'm-happy' : mood === 'sad' ? 'm-sad' : 'm-talk';
  animateClass(el, cls, 900);
}

export function bubbleEl(text = '') {
  return h('div', { class: `bubble ${text ? '' : 'hidden'}` }, text);
}

export function setBubble(el, text) {
  el.textContent = text || '';
  el.classList.toggle('hidden', !text);
  if (text) animateClass(el, 'pop', 400);
}
