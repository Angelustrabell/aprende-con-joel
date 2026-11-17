// Pantalla de "por hoy terminamos" (límite de tiempo o de sesiones).
import { h, holdButton } from '../core/dom.js';
import { getStudent } from '../core/store.js';
import { go } from '../core/router.js';
import { speak } from '../core/speech.js';
import { mascotEl } from './mascot.js';

export const mode = 'kid';

export function render(root) {
  const st = getStudent();
  const homeBtn = h('button', { class: 'kbtn small', type: 'button' }, '🏠');
  homeBtn.addEventListener('click', () => go('studentHome'));
  const lockBtn = h('button', { class: 'lock-btn', type: 'button', title: 'Papá: mantén pulsado para dar más tiempo' }, '🔒');
  holdButton(lockBtn, 2000, () => go('pin', { next: 'bonus' }));

  root.append(h('div', { class: 'kid-page limit' },
    h('div', { class: 'night-stars' }, ...Array.from({ length: 30 }, (_, i) => h('span', { style: { left: `${(i * 37) % 100}%`, top: `${(i * 53) % 70}%`, animationDelay: `${(i % 7) * 0.4}s` } }, i % 3 ? '✦' : '⭐'))),
    h('div', { class: 'limit-moon' }, '🌙'),
    h('div', { class: 'limit-box' },
      mascotEl(st, { size: 'min(26vmin, 220px)', cls: 'sleeping' }),
      h('div', { class: 'limit-text' }, '¡Por hoy terminamos!'),
      h('div', { class: 'limit-sub' }, 'Mañana jugamos más 😴'),
      homeBtn,
    ),
    lockBtn,
  ));
  speak(`¡Muy bien, ${st.name}! Por hoy ya jugamos mucho. Mañana jugamos más.`);
}
