// Premios del juego tras una sesión: experiencia, nivel, racha, misión, insignias, jefe y cofres.
import { h } from '../core/dom.js';
import { getStudent, findCourse } from '../core/store.js';
import { go } from '../core/router.js';
import { speak } from '../core/speech.js';
import { sfx } from '../core/sfx.js';
import { confetti, burstAt } from '../core/fx.js';
import { sleep } from '../core/util.js';
import { limitInfo } from '../core/progress.js';
import { getGame, levelInfo } from '../core/game.js';
import { backgroundCss } from '../data/rewards.js';
import { mascotEl, mascotReact } from './mascot.js';
import { chestOverlay } from './chest.js';
import { ARROW_SVG } from '../activities/common.js';

export const mode = 'kid';

export function render(root, { ev, courseId }) {
  const st = getStudent();
  const g = getGame(st);
  const course = findCourse(courseId);
  let alive = true;

  const afterXp = levelInfo(g.xp);
  const beforeXp = levelInfo(Math.max(0, g.xp - (ev?.xp || 0)));
  const lvNum = h('div', { class: 'gr-lv' }, `Nivel ${beforeXp.level}`);
  const rank = h('div', { class: 'gr-rank' }, beforeXp.rank);
  const fill = h('span', { style: { width: `${Math.round(beforeXp.pct * 100)}%` } });
  const bar = h('div', { class: 'gr-bar' }, fill);
  const xpChip = h('div', { class: 'gr-xp' }, `+${ev?.xp || 0} XP`);

  const title = ev?.boss ? (ev.bossDefeated ? '¡Venciste al jefe!' : '¡Casi vences al jefe!') : '¡Más experiencia!';
  const chips = h('div', { class: 'gr-chips' });
  const chip = (icon, text, cls = '') => { const c = h('div', { class: `gr-chip ${cls}` }, h('span', { class: 'gc-i' }, icon), h('span', text)); chips.append(c); return c; };
  if (ev?.boss && !ev.bossDefeated) chip('💪', 'Inténtalo otra vez, ¡tú puedes!');
  if (ev?.streakInc && ev.streak >= 2) chip('🔥', `${ev.streak} días seguidos`);
  if (ev?.missionDone) chip('🎯', '¡Misión del día cumplida!', 'gold');
  for (const b of ev?.newBadges || []) chip(b.icon, `Insignia: ${b.name}`, 'badge');

  const chestBtn = h('button', { class: 'kbtn orange chest-btn hidden', type: 'button' }, '🎁 ', h('span', { class: 'cb-n' }, ''));
  const nextBtn = h('button', { class: 'kbtn green big-next', type: 'button', 'aria-label': 'Seguir', html: ARROW_SVG });
  const mascot = mascotEl(st, { size: 'min(18vmin, 160px)', cls: 'rw-mascot', course });

  const refreshChest = () => {
    const n = getGame(st).chests;
    chestBtn.classList.toggle('hidden', n <= 0);
    chestBtn.querySelector('.cb-n').textContent = n > 1 ? `Abrir cofre (${n})` : 'Abrir cofre';
  };

  root.append(h('div', { class: 'kid-page game-reward', style: { background: backgroundCss(st) } },
    h('div', { class: 'gr-title' }, title),
    h('div', { class: 'gr-mid' }, mascot,
      h('div', { class: 'gr-card' }, h('div', { class: 'gr-head' }, lvNum, rank), bar, xpChip)),
    chips,
    h('div', { class: 'gr-actions' }, chestBtn, nextBtn),
  ));
  refreshChest();

  chestBtn.addEventListener('click', () => {
    sfx.tap();
    chestOverlay(root, st, () => { if (alive) refreshChest(); });
  });
  nextBtn.addEventListener('click', () => {
    sfx.tap();
    if (limitInfo(st.id).reached) go('limit');
    else go('map', { courseId });
  });

  // Animación: la barra se llena; si sube de nivel, se completa, cambia de nivel y sigue.
  (async () => {
    mascotReact(mascot, 'happy');
    sfx.win();
    if (ev?.bossDefeated || ev?.levelUp || ev?.missionDone) confetti();
    await sleep(500);
    if (!alive) return;
    if (ev?.levelUp) {
      fill.style.width = '100%';
      await sleep(900);
      if (!alive) return;
      sfx.unlock();
      lvNum.textContent = `Nivel ${afterXp.level}`;
      rank.textContent = afterXp.rank;
      burstAt(lvNum, ['⭐', '✨', '🎉'], 14);
      fill.style.transition = 'none';
      fill.style.width = '0%';
      void fill.offsetWidth;
      fill.style.transition = '';
    }
    fill.style.width = `${Math.round(afterXp.pct * 100)}%`;
    const say = [];
    say.push(ev?.boss ? (ev.bossDefeated ? '¡Venciste al jefe del mundo!' : '¡Casi! Vuelve a intentarlo.') : `¡Ganaste ${ev?.xp || 0} puntos de experiencia!`);
    if (ev?.levelUp) say.push(`¡Subiste al nivel ${afterXp.level}!`);
    if (ev?.missionDone) say.push('¡Cumpliste la misión del día!');
    if (ev?.streakInc && ev.streak >= 2) say.push(`¡Llevas ${ev.streak} días seguidos!`);
    for (const b of ev?.newBadges || []) say.push(`¡Nueva insignia: ${b.name}!`);
    if (getGame(st).chests > 0) say.push('¡Tienes un cofre! Tócalo para abrirlo.');
    for (const t of say) { if (!alive) return; await speak(t); }
  })();

  return () => { alive = false; };
}
