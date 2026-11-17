// Pestaña de progreso: tiempo, sesiones, lo que le cuesta y dibujos.
import { h } from '../core/dom.js';
import { store, getStudent, save, findActivity, settings } from '../core/store.js';
import { go } from '../core/router.js';
import { fmtDuration, fmtDate, dayKeyOffset } from '../core/util.js';
import { mediaUrl } from '../core/media.js';
import { cardThumb } from '../core/card.js';
import { confirmDialog, openModal, toast } from '../core/modal.js';
import {
  getProgress, today, limitInfo, grantBonus, struggles, courseCompletion, logWithNames,
} from '../core/progress.js';
import { ACTIVITY_TYPES, activityCards } from '../data/activityTypes.js';
import { getGame, levelInfo, streakNow } from '../core/game.js';
import { BADGES } from '../data/badges.js';

export function renderProgressTab(el) {
  let studentId = store.studentId || store.data.students[0]?.id;

  const draw = () => {
    el.replaceChildren();
    const st = getStudent(studentId);
    if (!st) { el.append(h('div', { class: 'empty' }, h('p', 'No hay alumnos.'))); return; }
    const p = getProgress(st.id);
    const t = today(st.id);
    const lim = limitInfo(st.id);
    const totalSessions = Object.values(p.sessions).reduce((n, s) => n + s.completed, 0);
    const days = Array.from({ length: 14 }, (_, i) => dayKeyOffset(i - 13));
    const mins = days.map((d) => Math.round((p.daily[d]?.seconds || 0) / 60));
    const maxMin = Math.max(5, ...mins);
    const weekSec = days.slice(-7).reduce((n, d) => n + (p.daily[d]?.seconds || 0), 0);

    const head = h('div', { class: 'section-head' },
      h('h2', `Progreso de ${st.name}`),
      store.data.students.length > 1 ? h('select', { class: 'input auto', onchange: (e) => { studentId = e.target.value; draw(); } },
        ...store.data.students.map((s) => h('option', { value: s.id, selected: s.id === st.id }, `${s.avatar} ${s.name}`))) : null);

    const tiles = h('div', { class: 'tiles' },
      tile('⏱', 'Hoy', fmtDuration(t.seconds), settings().dailyMinutes ? `límite ${settings().dailyMinutes + (t.bonusMinutes || 0)} min` : 'sin límite'),
      tile('📅', 'Últimos 7 días', fmtDuration(weekSec), ''),
      tile('✅', 'Sesiones hechas', String(totalSessions), `${t.sessions} hoy`),
      tile('⭐', 'Estrellas', String(st.stars), `${st.stickers.length} ${st.stickers.length === 1 ? 'pegatina' : 'pegatinas'}`),
    );
    const gm = getGame(st);
    const lv = levelInfo(gm.xp);
    const gameTiles = h('div', { class: 'tiles' },
      tile('🎮', 'Nivel', `${lv.level} · ${lv.rank}`, `${gm.xp} XP en total`),
      tile('🔥', 'Racha', `${streakNow(gm)} ${streakNow(gm) === 1 ? 'día' : 'días'}`, `mejor racha: ${gm.streak.best}`),
      tile('🛡️', 'Jefes vencidos', String(Object.values(gm.bosses).filter((s) => s >= 2).length), `${gm.missionsDone} misiones diarias cumplidas`),
      tile('🏅', 'Insignias', `${Object.keys(gm.badges).length}/${BADGES.length}`, `${gm.opened} cofres abiertos`),
    );

    const chart = h('div', { class: 'panel' },
      h('h3', 'Minutos por día'),
      h('div', { class: 'bars' }, ...days.map((d, i) => h('div', { class: 'bar-col', title: `${d}: ${mins[i]} min` },
        h('div', { class: 'bar-val' }, mins[i] ? String(mins[i]) : ''),
        h('div', { class: 'bar', style: { height: `${(mins[i] / maxMin) * 100}%` } }),
        h('div', { class: 'bar-label' }, d.slice(8)),
      ))));

    const coursesBox = h('div', { class: 'panel' }, h('h3', 'Avance por curso'),
      ...store.data.courses.map((c) => {
        const { done, total } = courseCompletion(st.id, c);
        return h('div', { class: 'course-progress' },
          h('span', `${c.icon || '📚'} ${c.title}`),
          h('div', { class: 'pbar' }, h('span', { style: { width: `${total ? (done / total) * 100 : 0}%` } })),
          h('span', { class: 'muted small' }, `${done}/${total}`));
      }));

    const hard = struggles(st.id).map((s) => ({ ...s, found: findActivity(s.actId) })).filter((s) => s.found).slice(0, 12);
    const hardBox = h('div', { class: 'panel' },
      h('h3', '🧩 Le cuesta'),
      h('p', { class: 'muted small' }, 'Actividades con varios errores. Aparecen más a menudo en los repasos automáticos.'),
      hard.length ? h('div', { class: 'act-list compact' }, ...hard.map((s) => {
        const a = s.found.activity;
        const T = ACTIVITY_TYPES[a.type];
        return h('div', { class: 'act-row' },
          h('span', { class: 'act-type' }, T.icon),
          h('div', { class: 'act-info' },
            h('b', a.prompt?.say || T.name),
            h('div', { class: 'muted small' }, `${s.found.session.title} · ${s.attempts} intentos · ${s.avg.toFixed(1)} errores de media · último: ${s.lastErrors}`)),
          h('div', { class: 'act-thumbs' }, ...activityCards(a).slice(0, 3).map((c) => cardThumb(c, 34))),
          h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Editar', onclick: () => go('activityEditor', { sessionId: s.found.session.id, activityId: a.id }) }, '✏️'));
      })) : h('p', { class: 'muted' }, '¡Nada por ahora! 🎉'));

    const log = logWithNames(st.id, 25);
    const logBox = h('div', { class: 'panel' }, h('h3', 'Últimas sesiones'),
      log.length ? h('table', { class: 'table' },
        h('thead', h('tr', h('th', 'Fecha'), h('th', 'Sesión'), h('th', 'Duración'), h('th', 'Estrellas'), h('th', 'Errores'))),
        h('tbody', ...log.map((e) => h('tr',
          h('td', fmtDate(e.at)), h('td', `${e.icon || ''} ${e.sessionTitle}`), h('td', fmtDuration(e.duration)),
          h('td', '★'.repeat(e.stars) + '☆'.repeat(3 - e.stars)), h('td', String(e.errors))))))
        : h('p', { class: 'muted' }, 'Aún no ha completado ninguna sesión.'));

    const drawings = p.drawings.slice().reverse();
    const galleryBox = h('div', { class: 'panel' }, h('h3', `🎨 Dibujos de ${st.name} (${drawings.length})`),
      drawings.length ? h('div', { class: 'gallery' }, ...drawings.map((d) => {
        const img = h('img', { src: mediaUrl(d.file), alt: '', loading: 'lazy' });
        const b = h('button', { class: 'gallery-item', type: 'button' }, img, h('small', fmtDate(d.at)));
        b.addEventListener('click', () => {
          openModal({
            wide: true,
            content: h('img', { class: 'gallery-big', src: mediaUrl(d.file), alt: '' }),
            actions: [
              {
                label: '🗑 Borrar', class: 'btn-ghost',
                onClick: async () => {
                  if (!(await confirmDialog('¿Borrar este dibujo?', { danger: true, okLabel: 'Borrar' }))) return false;
                  p.drawings = p.drawings.filter((x) => x !== d);
                  save();
                  draw();
                  return true;
                },
              },
              { label: 'Cerrar', class: 'btn-primary' },
            ],
          });
        });
        return b;
      })) : h('p', { class: 'muted' }, 'Los dibujos que haga en "Colorear" aparecerán aquí.'));

    const actions = h('div', { class: 'panel row wrap' },
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { st.stars += 5; save(); toast(`⭐ +5 estrellas para ${st.name}`, 'ok'); draw(); } }, '🎁 Regalar 5 estrellas'),
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { grantBonus(st.id, 10); toast('⏱ +10 minutos hoy', 'ok'); draw(); } }, `⏱ +10 minutos hoy${lim.reached ? ' (límite alcanzado)' : ''}`),
      h('button', {
        class: 'btn btn-ghost danger', type: 'button',
        onclick: async () => {
          if (!(await confirmDialog(`¿Borrar todo el progreso de ${st.name}? (sesiones, tiempos y errores; no borra estrellas, pegatinas ni dibujos)`, { okLabel: 'Borrar progreso', danger: true }))) return;
          const drawingsKeep = p.drawings;
          store.data.progress[st.id] = { sessions: {}, activities: {}, log: [], daily: {}, drawings: drawingsKeep };
          save();
          draw();
        },
      }, '🔄 Reiniciar progreso'));

    el.append(head, tiles, gameTiles, chart, h('div', { class: 'two-col' }, coursesBox, hardBox), logBox, galleryBox, actions);
  };
  draw();
}

function tile(icon, label, value, sub) {
  return h('div', { class: 'tile' }, h('div', { class: 'tile-icon' }, icon), h('div', { class: 'tile-value' }, value), h('div', { class: 'tile-label' }, label), sub ? h('div', { class: 'tile-sub' }, sub) : null);
}
