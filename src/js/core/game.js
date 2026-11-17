// Juego: puntos de experiencia (XP), niveles, racha de días, misión diaria, insignias, cofres y jefes de mundo.
// Es común a todos los cursos. Premia el esfuerzo y la constancia (no solo acertar).
import { store, save, settings, editState } from './store.js';
import { todayKey, dayKeyOffset, pick, shuffle } from './util.js';
import { getProgress, hasContent, sessionDone } from './progress.js';
import { validateActivity } from '../data/activityTypes.js';
import { ALL_STICKERS } from '../data/rewards.js';
import { BADGES, RANKS } from '../data/badges.js';

export const BOSS_MIN_ACTIVITIES = 6; // un mundo tiene jefe si reúne al menos estas actividades con respuesta
export const BOSS_SIZE = 8;
// El jefe usa preguntas de respuesta rápida: no se traza, ni se colorea, ni se lee.
const BOSS_TYPES = new Set(['choose', 'listen', 'match', 'order', 'count', 'pattern', 'sort', 'memory']);
const bossable = (a) => BOSS_TYPES.has(a.type) && !validateActivity(a);

// ---------- Estado del alumno ----------
export function getGame(st) {
  const g = st.game || (st.game = {});
  g.xp ??= 0;
  g.chests ??= 0;
  g.opened ??= 0;
  g.missionsDone ??= 0;
  g.perfect ??= 0;
  g.bosses ??= {};
  g.badges ??= {};
  g.seenStory ??= {};
  g.streak ??= { last: '', count: 0, best: 0 };
  g.mission ??= { date: '', goal: 2, done: 0, claimed: false };
  return g;
}

// ---------- Niveles ----------
export function levelInfo(xp) {
  let level = 1;
  let need = 60;
  let left = Math.max(0, xp);
  while (left >= need) { left -= need; level++; need = Math.round(need * 1.18 + 10); }
  return { level, into: left, need, pct: need ? left / need : 0, rank: RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 2))] };
}

export const xpFor = (stars, boss) => (boss ? 40 + 20 * stars : 10 + 10 * stars);

// ---------- Racha ----------
export function streakNow(g) {
  const s = g.streak;
  if (s.last === todayKey() || s.last === dayKeyOffset(-1)) return s.count; // la racha sigue viva hasta que pase un día sin jugar
  return 0;
}

function touchStreak(g) {
  const s = g.streak;
  const today = todayKey();
  if (s.last === today) return false;
  s.count = s.last === dayKeyOffset(-1) ? s.count + 1 : 1;
  s.last = today;
  s.best = Math.max(s.best, s.count);
  return true;
}

// ---------- Misión del día ----------
export function ensureMission(g) {
  const today = todayKey();
  if (g.mission.date !== today) g.mission = { date: today, goal: Math.max(1, settings().dailyGoal || 2), done: 0, claimed: false };
  return g.mission;
}

// ---------- Mundos (unidades) ----------
const playable = (s) => hasContent(s) && !s.locked;

export function unitScored(unit) {
  let n = 0;
  for (const s of unit.sessions) for (const a of s.activities) if (bossable(a)) n++;
  return n;
}

export const hasBoss = (unit) => unit.boss !== false && unitScored(unit) >= BOSS_MIN_ACTIVITIES;

export function unitStatus(st, unit) {
  const g = getGame(st);
  const list = unit.sessions.filter(playable);
  const done = list.filter((s) => sessionDone(st.id, s.id)).length;
  const allDone = list.length > 0 && done === list.length;
  const boss = hasBoss(unit);
  const bossStars = g.bosses[unit.id] || 0;
  return { total: list.length, done, allDone, hasBoss: boss, bossAvail: boss && allDone, bossStars, bossDefeated: bossStars >= 2, cleared: boss ? bossStars >= 2 : allDone };
}

// ¿Está abierto el mundo? Se abre cuando se supera el mundo que pide (unit.requires), salvo que papá lo abra.
export function worldUnlocked(st, course, unit) {
  if (editState.on || unit.open || !unit.requires) return true;
  const req = course.units.find((u) => u.id === unit.requires);
  return req ? unitStatus(st, req).cleared : true;
}

// Mundos terminados (todas sus sesiones hechas)
export function worldsDoneCount(st) {
  let n = 0;
  for (const c of store.data.courses) for (const u of c.units) if (unitStatus(st, u).allDone) n++;
  return n;
}

// Actividades del jefe: mezcla de lo que hay en el mundo, empezando por lo que más le costó.
export function bossActivities(st, unit, n = BOSS_SIZE) {
  const p = getProgress(st.id);
  const pool = [];
  for (const s of unit.sessions) for (const a of s.activities) if (bossable(a)) pool.push(a);
  const scored = shuffle(pool).map((a) => ({ a, w: (p.activities[a.id]?.errors || 0) * 2 + Math.random() }));
  scored.sort((x, y) => y.w - x.w);
  return shuffle(scored.slice(0, n).map((x) => x.a));
}

// ---------- Premios al terminar una sesión ----------
function badgeContext(st) {
  const g = getGame(st);
  const p = getProgress(st.id);
  let readDone = 0;
  const done = Object.entries(p.sessions).filter(([, v]) => v.completed > 0).map(([id]) => id);
  const set = new Set(done);
  for (const c of store.data.courses) for (const u of c.units) for (const s of u.sessions) if (set.has(s.id) && s.activities.some((a) => a.type === 'reading')) readDone++;
  const sessionsDone = done.filter((id) => !id.startsWith('boss-')).length;
  return { g, st, level: levelInfo(g.xp).level, sessionsDone, readDone, worldsDone: worldsDoneCount(st) };
}

export function checkBadges(st) {
  const c = badgeContext(st);
  const fresh = [];
  for (const b of BADGES) {
    if (!c.g.badges[b.id] && b.test(c)) { c.g.badges[b.id] = Date.now(); fresh.push(b); }
  }
  return fresh;
}

// Devuelve lo que pasó (para mostrarlo): xp, nivel, racha, misión, jefe, cofres e insignias nuevas.
export function awardSession(st, { stars, boss = false, unitId = null }) {
  const g = getGame(st);
  const before = levelInfo(g.xp).level;
  let gain = xpFor(stars, boss);
  const ev = { boss, stars, bossDefeated: false, bossFailed: false, missionDone: false, newChests: 0 };

  ev.streakInc = touchStreak(g);
  const m = ensureMission(g);
  m.done++;
  if (m.done >= m.goal && !m.claimed) { m.claimed = true; g.missionsDone++; g.chests++; ev.newChests++; ev.missionDone = true; gain += 20; }
  if (stars === 3) g.perfect++;

  if (boss) {
    if (stars >= 2) {
      const first = !(g.bosses[unitId] >= 2);
      g.bosses[unitId] = Math.max(g.bosses[unitId] || 0, stars);
      ev.bossDefeated = true;
      if (first) { g.chests++; ev.newChests++; ev.firstDefeat = true; }
    } else ev.bossFailed = true;
  }

  g.xp += gain;
  const after = levelInfo(g.xp);
  ev.xp = gain;
  ev.level = after.level;
  ev.levelUp = after.level > before;
  ev.streak = g.streak.count;
  ev.mission = { ...m };
  ev.newBadges = checkBadges(st);
  ev.chests = g.chests;
  save();
  return ev;
}

// Abre un cofre: estrellas, una pegatina nueva o un bonus de XP.
export function openChest(st) {
  const g = getGame(st);
  if (g.chests <= 0) return null;
  g.chests--;
  g.opened++;
  const missing = ALL_STICKERS.filter((s) => !st.stickers.includes(s.e));
  const r = Math.random();
  let prize;
  if (r < 0.45 || (!missing.length && r < 0.85)) { const n = 4 + Math.floor(Math.random() * 7); st.stars += n; prize = { kind: 'stars', n }; }
  else if (r < 0.85 && missing.length) { const s = pick(missing); st.stickers.push(s.e); prize = { kind: 'sticker', sticker: s }; }
  else { g.xp += 30; prize = { kind: 'xp', n: 30 }; }
  prize.newBadges = checkBadges(st);
  prize.chests = g.chests;
  save();
  return prize;
}
