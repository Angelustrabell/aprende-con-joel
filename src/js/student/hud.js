// Piezas del juego que se repiten en varias pantallas: nivel, racha, cofres y misión del día.
import { h } from '../core/dom.js';
import { getGame, levelInfo, streakNow, ensureMission } from '../core/game.js';

// Nivel con su barra de XP, la racha de días y los cofres que tiene guardados.
export function hudEl(st, { onChest = null } = {}) {
  const g = getGame(st);
  const lv = levelInfo(g.xp);
  const streak = streakNow(g);
  const level = h('div', { class: 'lv-pill', title: `Nivel ${lv.level} · ${lv.rank}` },
    h('span', { class: 'lv-num' }, `Nv ${lv.level}`),
    h('span', { class: 'lv-bar' }, h('span', { style: { width: `${Math.round(lv.pct * 100)}%` } })));
  const items = [level];
  if (streak > 0) items.push(h('div', { class: 'streak-pill', title: `${streak} ${streak === 1 ? 'día' : 'días'} seguidos` }, '🔥 ', h('b', String(streak))));
  if (g.chests > 0) {
    const chest = h('button', { class: 'chest-pill', type: 'button', title: 'Abrir cofre' }, '🎁 ', h('b', String(g.chests)));
    if (onChest) chest.addEventListener('click', onChest);
    items.push(chest);
  }
  return h('div', { class: 'hud' }, ...items);
}

// Misión del día: cuántas sesiones lleva de las que se piden.
export function missionEl(st) {
  const g = getGame(st);
  const m = ensureMission(g);
  const done = Math.min(m.done, m.goal);
  const dots = Array.from({ length: m.goal }, (_, i) => h('span', { class: `md ${i < done ? 'on' : ''}` }, i < done ? '★' : '☆'));
  return h('div', { class: `mission-pill ${m.claimed ? 'done' : ''}`, title: 'Misión del día' },
    h('span', { class: 'mp-icon' }, m.claimed ? '✅' : '🎯'),
    h('span', { class: 'mp-text' }, m.claimed ? '¡Misión cumplida!' : `Misión de hoy: ${done}/${m.goal}`),
    h('span', { class: 'mp-dots' }, ...dots));
}
