// Progreso del alumno: actividades, sesiones, tiempo diario y repaso.
import { store, save, settings, findSession } from './store.js';
import { todayKey } from './util.js';
import { validateActivity } from '../data/activityTypes.js';

const NOT_SCORED = new Set(['view', 'paint', 'reading']);
export const isScored = (act) => !NOT_SCORED.has(act.type);

export function getProgress(studentId = store.studentId) {
  const all = store.data.progress;
  if (!all[studentId]) all[studentId] = { sessions: {}, activities: {}, log: [], daily: {}, drawings: [] };
  const p = all[studentId];
  p.sessions = p.sessions || {};
  p.activities = p.activities || {};
  p.log = p.log || [];
  p.daily = p.daily || {};
  p.drawings = p.drawings || [];
  return p;
}

export function today(studentId = store.studentId) {
  const p = getProgress(studentId);
  const k = todayKey();
  if (!p.daily[k]) p.daily[k] = { seconds: 0, sessions: 0, bonusMinutes: 0, bonusSessions: 0 };
  return p.daily[k];
}

export function addSeconds(studentId, sec) {
  if (!studentId || sec <= 0) return;
  today(studentId).seconds += sec;
  save();
}

export function limitInfo(studentId = store.studentId) {
  const s = settings();
  const t = today(studentId);
  const minutesAllowed = s.dailyMinutes > 0 ? s.dailyMinutes + (t.bonusMinutes || 0) : 0;
  const sessionsAllowed = s.maxSessionsPerDay > 0 ? s.maxSessionsPerDay + (t.bonusSessions || 0) : 0;
  const timeUp = minutesAllowed > 0 && t.seconds >= minutesAllowed * 60;
  const sessionsUp = sessionsAllowed > 0 && t.sessions >= sessionsAllowed;
  return {
    reached: timeUp || sessionsUp,
    timeUp,
    sessionsUp,
    secondsLeft: minutesAllowed > 0 ? Math.max(0, minutesAllowed * 60 - t.seconds) : Infinity,
    usedSeconds: t.seconds,
    sessionsToday: t.sessions,
  };
}

export function grantBonus(studentId, minutes = 10) {
  const t = today(studentId);
  t.bonusMinutes = (t.bonusMinutes || 0) + minutes;
  if (settings().maxSessionsPerDay > 0) t.bonusSessions = (t.bonusSessions || 0) + 1;
  save();
}

export function recordActivity(studentId, act, errors) {
  if (!studentId) return;
  const p = getProgress(studentId);
  const a = p.activities[act.id] || (p.activities[act.id] = { attempts: 0, errors: 0, lastErrors: 0, lastAt: 0, firstTry: 0 });
  a.attempts++;
  a.errors += errors;
  a.lastErrors = errors;
  a.lastAt = Date.now();
  if (errors === 0) a.firstTry++;
  save();
}

export function starsFor(totalErrors, scoredCount) {
  if (scoredCount === 0) return 3;
  const rate = totalErrors / scoredCount;
  if (rate <= 0.34) return 3;
  if (rate <= 1.2) return 2;
  return 1;
}

export function recordSession(studentId, { courseId, sessionId, stars, errors, duration, count }) {
  if (!studentId) return;
  const p = getProgress(studentId);
  const s = p.sessions[sessionId] || (p.sessions[sessionId] = { completed: 0, bestStars: 0, lastAt: 0 });
  s.completed++;
  s.bestStars = Math.max(s.bestStars, stars);
  s.lastAt = Date.now();
  p.log.push({ at: Date.now(), courseId, sessionId, stars, errors, duration: Math.round(duration), count });
  if (p.log.length > 1000) p.log.splice(0, p.log.length - 1000);
  today(studentId).sessions++;
  save();
}

export const sessionDone = (studentId, sessionId) => (getProgress(studentId).sessions[sessionId]?.completed || 0) > 0;
export const sessionStars = (studentId, sessionId) => getProgress(studentId).sessions[sessionId]?.bestStars || 0;

// ¿Tiene al menos una actividad lista para jugar?
export const hasContent = (s) => s.activities.some((a) => !validateActivity(a));

// ¿Está desbloqueada la sesión? Papá puede bloquearla (session.locked); si no, se abre en orden
// dentro de cada unidad, salvo que el curso sea de orden libre.
export function sessionUnlocked(studentId, unit, index, course = null) {
  if (unit.sessions[index]?.locked) return false;
  if (!settings().sequentialUnlock || course?.freeOrder || index === 0) return true;
  const prev = unit.sessions.slice(0, index).filter((s) => hasContent(s) && !s.locked);
  if (!prev.length) return true;
  return sessionDone(studentId, prev[prev.length - 1].id);
}

// Siguiente sesión recomendada de un curso: la primera desbloqueada sin completar.
export function nextSession(studentId, course) {
  for (const unit of course.units) {
    for (let i = 0; i < unit.sessions.length; i++) {
      const s = unit.sessions[i];
      if (!hasContent(s) || s.locked) continue;
      if (!sessionDone(studentId, s.id) && sessionUnlocked(studentId, unit, i, course)) return s;
    }
  }
  return null;
}

// Elige actividades de repaso: las que más le costaron y las que hace más tiempo que no ve.
export function pickReview(studentId, course, excludeSessionId, count) {
  if (!count || !course) return [];
  const p = getProgress(studentId);
  const now = Date.now();
  const candidates = [];
  for (const unit of course.units) {
    for (const session of unit.sessions) {
      if (session.id === excludeSessionId || !sessionDone(studentId, session.id)) continue;
      for (const act of session.activities) {
        if (!isScored(act)) continue;
        const st = p.activities[act.id];
        if (!st) continue;
        const days = (now - (st.lastAt || now)) / 86400000;
        const avgErr = st.attempts ? st.errors / st.attempts : 0;
        const score = st.lastErrors * 3 + avgErr * 2 + Math.min(days, 14) * 0.4 + Math.random() * 0.8;
        candidates.push({ act, score });
      }
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, count).map((c) => c.act);
}

// Actividades que le cuestan (para el panel de papá).
export function struggles(studentId) {
  const p = getProgress(studentId);
  const out = [];
  for (const [actId, st] of Object.entries(p.activities)) {
    const avg = st.attempts ? st.errors / st.attempts : 0;
    if (st.attempts > 0 && (avg >= 1.5 || st.lastErrors >= 2)) out.push({ actId, ...st, avg });
  }
  out.sort((a, b) => b.avg - a.avg);
  return out;
}

export function courseCompletion(studentId, course) {
  let total = 0;
  let done = 0;
  for (const u of course.units) {
    for (const s of u.sessions) {
      if (!hasContent(s) || s.locked) continue;
      total++;
      if (sessionDone(studentId, s.id)) done++;
    }
  }
  return { total, done };
}

export function logWithNames(studentId, limit = 30) {
  const p = getProgress(studentId);
  return p.log.slice(-limit).reverse().map((entry) => {
    const found = findSession(entry.sessionId);
    const isBoss = String(entry.sessionId).startsWith('boss-');
    return { ...entry, sessionTitle: isBoss ? '👾 Jefe de mundo' : found ? found.session.title : '(sesión borrada)', icon: isBoss ? '👾' : found ? found.session.icon : '❔' };
  });
}
