// Pantalla de premio al terminar una sesión.
import { h } from '../core/dom.js';
import { getStudent, findCourse } from '../core/store.js';
import { go } from '../core/router.js';
import { speak } from '../core/speech.js';
import { sfx } from '../core/sfx.js';
import { confetti, burstAt } from '../core/fx.js';
import { limitInfo } from '../core/progress.js';
import { backgroundCss } from '../data/rewards.js';
import { mascotEl, mascotReact } from './mascot.js';
import { ARROW_SVG } from '../activities/common.js';

export const mode = 'kid';

export function render(root, { stars = 3, sticker = null, bonus = 0, courseId, ev = null }) {
  const st = getStudent();
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  const starEls = [1, 2, 3].map((i) => h('span', { class: `rw-star ${i <= stars ? 'on' : ''}` }, i <= stars ? '★' : '☆'));
  const stickerCard = h('div', { class: 'sticker-card' },
    h('div', { class: 'sc-inner' },
      h('div', { class: 'sc-back' }, '🎁'),
      h('div', { class: 'sc-front' }, sticker ? sticker.e : '🌟'),
    ));
  const mascot = mascotEl(st, { size: 'min(22vmin, 200px)', cls: 'rw-mascot', course: findCourse(courseId) });
  const nextBtn = h('button', { class: 'kbtn green big-next', type: 'button', 'aria-label': 'Seguir', html: ARROW_SVG });
  const albumBtn = h('button', { class: 'round-btn', type: 'button' }, h('span', '📒'), h('small', 'Álbum'));

  root.append(h('div', { class: 'kid-page reward', style: { background: backgroundCss(st) } },
    h('div', { class: 'rw-title' }, '¡Lo lograste!'),
    h('div', { class: 'rw-stars' }, ...starEls),
    h('div', { class: 'rw-middle' }, mascot, stickerCard),
    h('div', { class: 'rw-label' }, sticker ? `Nueva pegatina: ${sticker.n}` : `¡Álbum completo! +${bonus} ⭐`),
    h('div', { class: 'rw-actions' }, albumBtn, nextBtn),
  ));

  sfx.win();
  confetti();
  mascotReact(mascot, 'happy');
  starEls.forEach((el, i) => later(() => { el.classList.add('show'); if (i < stars) { sfx.star(); burstAt(el, ['✨'], 5); } }, 500 + i * 450));
  later(async () => {
    await speak(`¡Muy bien, ${st.name}! Ganaste ${stars} ${stars === 1 ? 'estrella' : 'estrellas'}.`);
    stickerCard.classList.add('flipped');
    sfx.unlock();
    burstAt(stickerCard, ['🎉', '⭐', '✨'], 12);
    later(() => speak(sticker ? `¡Y una pegatina nueva: ${sticker.n}!` : '¡Tu álbum está completo!'), 500);
  }, 2000);

  stickerCard.addEventListener('click', () => {
    if (!stickerCard.classList.contains('flipped')) return;
    sfx.pop(5);
    if (sticker) speak(sticker.n);
  });
  nextBtn.addEventListener('click', () => {
    sfx.tap();
    if (ev) go('gameReward', { ev, courseId }); // experiencia, nivel, misión, insignias y cofres
    else if (limitInfo(st.id).reached) go('limit');
    else go('map', { courseId });
  });
  albumBtn.addEventListener('click', () => go('album', { highlight: sticker?.e, back: { name: 'map', params: { courseId } } }));

  return () => timers.forEach(clearTimeout);
}
