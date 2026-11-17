// Elegir curso (cuando hay más de uno visible).
import { h } from '../core/dom.js';
import { getStudent, visibleCourses } from '../core/store.js';
import { go } from '../core/router.js';
import { speak } from '../core/speech.js';
import { sfx } from '../core/sfx.js';
import { courseCompletion } from '../core/progress.js';
import { backgroundCss } from '../data/rewards.js';

export const mode = 'kid';

export function render(root) {
  const st = getStudent();
  const back = h('button', { class: 'kid-back', type: 'button' }, '🏠');
  back.addEventListener('click', () => go('studentHome'));
  const grid = h('div', { class: 'course-grid' }, ...visibleCourses().map((c) => {
    const { done, total } = courseCompletion(st.id, c);
    const tile = h('button', { class: 'course-tile', type: 'button', style: { '--cc': c.color || '#6c4cf5' } },
      h('span', { class: 'ct-icon' }, c.icon || '📚'),
      h('span', { class: 'ct-title' }, c.title),
      h('span', { class: 'ct-bar' }, h('span', { style: { width: `${total ? (done / total) * 100 : 0}%` } })),
    );
    tile.addEventListener('click', () => { sfx.tap(); speak(c.title); go('map', { courseId: c.id }); });
    return tile;
  }));
  root.append(h('div', { class: 'kid-page course-select', style: { background: backgroundCss(st) } },
    h('div', { class: 'kid-top' }, back, h('div', { class: 'kid-title' }, '¿Qué jugamos?'), h('div', { class: 'star-pill' }, '⭐ ', h('b', String(st.stars)))),
    grid,
  ));
  speak('¿Qué quieres jugar?');
}
