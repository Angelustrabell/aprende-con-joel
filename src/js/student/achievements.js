// Mis logros: nivel, racha, cofres e insignias.
import { h, animateClass } from '../core/dom.js';
import { getStudent } from '../core/store.js';
import { go } from '../core/router.js';
import { speak } from '../core/speech.js';
import { sfx } from '../core/sfx.js';
import { burstAt } from '../core/fx.js';
import { getGame, levelInfo, streakNow } from '../core/game.js';
import { BADGES } from '../data/badges.js';
import { backgroundCss } from '../data/rewards.js';
import { chestOverlay } from './chest.js';

export const mode = 'kid';

export function render(root) {
  const st = getStudent();
  const g = getGame(st);
  const lv = levelInfo(g.xp);
  const have = BADGES.filter((b) => g.badges[b.id]).length;

  const back = h('button', { class: 'kid-back', type: 'button' }, '🏠');
  back.addEventListener('click', () => go('studentHome'));

  const stat = (icon, big, small) => h('div', { class: 'ach-stat' }, h('span', { class: 'as-i' }, icon), h('b', big), h('small', small));
  const chestStat = g.chests > 0
    ? h('button', { class: 'ach-stat chest', type: 'button' }, h('span', { class: 'as-i' }, '🎁'), h('b', String(g.chests)), h('small', 'Abrir cofre'))
    : stat('🎁', String(g.opened), 'cofres abiertos');
  if (g.chests > 0) chestStat.addEventListener('click', () => chestOverlay(root, st, () => go('achievements')));

  const grid = h('div', { class: 'badge-grid' }, ...BADGES.map((b) => {
    const got = !!g.badges[b.id];
    const el = h('button', { class: `badge ${got ? 'got' : 'locked'}`, type: 'button' },
      h('span', { class: 'bd-i' }, got ? b.icon : '❔'),
      h('small', got ? b.name : '???'));
    el.addEventListener('click', () => {
      if (got) { sfx.pop(4); animateClass(el, 'bounce'); burstAt(el, ['✨'], 6); speak(`${b.name}. ${b.desc}`); }
      else { sfx.tap(); speak(`Por conseguir: ${b.desc}`); }
    });
    return el;
  }));

  root.append(h('div', { class: 'kid-page achievements', style: { background: backgroundCss(st) } },
    h('div', { class: 'kid-top' }, back, h('div', { class: 'kid-title' }, 'Mis logros'), h('div', { class: 'star-pill' }, '🏅 ', h('b', `${have}/${BADGES.length}`))),
    h('div', { class: 'ach-top' },
      h('div', { class: 'ach-level' },
        h('div', { class: 'al-row' }, h('b', `Nivel ${lv.level}`), h('span', lv.rank)),
        h('div', { class: 'gr-bar' }, h('span', { style: { width: `${Math.round(lv.pct * 100)}%` } })),
        h('small', `${lv.into} / ${lv.need} XP para el siguiente nivel`)),
      stat('🔥', String(streakNow(g)), 'días seguidos'),
      stat('🏆', String(g.streak.best), 'mejor racha'),
      chestStat),
    h('div', { class: 'ach-scroll' }, grid),
  ));
  speak(`Eres nivel ${lv.level}, ${lv.rank}. Tienes ${have} insignias.`);
}
