// Reproductor de sesiones: va pasando por las actividades, da ánimos, pistas y recompensas.
import { h, animateClass } from '../core/dom.js';
import { store, getStudent, findSession, findActivity, findUnit, settings, save } from '../core/store.js';
import { awardSession, bossActivities } from '../core/game.js';
import { go } from '../core/router.js';
import { speak, sayThing, stopSpeech, sayPraise, sayRetry } from '../core/speech.js';
import { sfx } from '../core/sfx.js';
import { burstAt, flyStar } from '../core/fx.js';
import { saveBlob } from '../core/media.js';
import { sleep, pick } from '../core/util.js';
import {
  isScored, recordActivity, recordSession, starsFor, pickReview, addSeconds, getProgress,
} from '../core/progress.js';
import { mountActivity } from '../activities/index.js';
import { backgroundCss, ALL_STICKERS } from '../data/rewards.js';
import { validateActivity } from '../data/activityTypes.js';
import { mascotEl, mascotReact, bubbleEl, setBubble } from './mascot.js';

export const mode = 'kid';

const IDLE_MS = 15000;

export async function render(root, params) {
  const { sessionId, preview = false, single = null, returnTo = null, edit = false, boss = null } = params;
  const st = getStudent();
  const studentId = preview ? null : st?.id;

  let course = null;
  let session = null;
  let list = [];
  if (boss) {
    // Jefe de mundo: un reto con actividades de todo el mundo (no es una sesión guardada).
    const f = findUnit(boss.unitId);
    if (!f) { goBack(); return; }
    course = f.course;
    session = { id: `boss-${f.unit.id}`, title: `Jefe de ${f.unit.title}`, activities: [] };
    list = bossActivities(st, f.unit).map((act) => ({ act, review: false }));
  } else if (single) {
    const f = findActivity(single);
    if (!f) { goBack(); return; }
    ({ course, session } = f);
    list = [{ act: f.activity, review: false }];
  } else {
    const f = findSession(sessionId);
    if (!f) { goBack(); return; }
    ({ course, session } = f);
    list = session.activities.filter((act) => !validateActivity(act)).map((act) => ({ act, review: false }));
    if (!preview && studentId && list.length) {
      const review = pickReview(studentId, course, session.id, settings().reviewCount).filter((act) => !validateActivity(act));
      list = [...review.map((act) => ({ act, review: true })), ...list];
    }
  }
  if (!list.length) { goBack(); return; }

  function goBack() {
    if (returnTo) go(returnTo.name, returnTo.params || {});
    else if (course) go('map', { courseId: course.id });
    else go('studentHome');
  }

  // ---------- Estado ----------
  let idx = -1;
  let instance = null;
  let actErrors = 0;
  let errorsTotal = 0;
  let scoredCount = 0;
  let transitioning = false;
  let destroyed = false;
  let idleTimer = null;
  let idleStage = 0;
  let lastTick = Date.now();
  const startTime = Date.now();

  // ---------- Interfaz ----------
  const exitBtn = h('button', { class: 'kid-back', type: 'button' }, preview ? '✖' : '🏠');
  const repeatBtn = h('button', { class: 'kid-back repeat-btn', type: 'button', title: 'Repetir' }, '🔊');
  const editBtn = edit ? h('button', { class: 'kid-back player-edit-btn', type: 'button', title: 'Editar esta parte' }, '✏️') : null;
  const dots = h('div', { class: 'progress-dots' }, ...list.map((it) => h('span', { class: `pdot ${it.review ? 'review' : ''}` })));
  const stage = h('div', { class: 'act-stage' });
  const mascot = mascotEl(st, { size: 'min(15vmin, 130px)', cls: 'player-mascot', course });
  const bubble = bubbleEl();
  const page = h('div', { class: 'kid-page player', style: { background: backgroundCss(st) } },
    h('div', { class: 'kid-top' }, exitBtn, dots, preview ? h('span', { class: 'preview-badge' }, edit ? 'EDICIÓN' : 'VISTA PREVIA') : null, boss && !preview ? h('span', { class: 'preview-badge boss-badge' }, '👾 JEFE') : null, editBtn, repeatBtn),
    stage,
    h('div', { class: 'player-mascot-wrap' }, bubble, mascot),
  );
  root.append(page);

  // El globo se oculta solo para no tapar la actividad.
  let bubbleTimer = null;
  const showBubble = (text, mood, hideAfter = 0) => {
    clearTimeout(bubbleTimer);
    setBubble(bubble, text);
    if (mood) mascotReact(mascot, mood);
    if (hideAfter) hideBubbleSoon(hideAfter);
  };
  const hideBubbleSoon = (ms = 2500) => {
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => setBubble(bubble, ''), ms);
  };

  // ---------- Tiempo de uso ----------
  const tickTime = () => {
    const now = Date.now();
    const sec = Math.min(30, (now - lastTick) / 1000);
    lastTick = now;
    if (studentId && !document.hidden) addSeconds(studentId, sec);
  };
  const timeInterval = setInterval(tickTime, 5000);

  // ---------- Ayuda si se queda quieto ----------
  function resetIdle() {
    clearTimeout(idleTimer);
    idleStage = 0;
    if (!settings().idleHelp || transitioning) return;
    idleTimer = setTimeout(onIdle, IDLE_MS);
  }
  function onIdle() {
    // Las lecturas no se interrumpen: leer una página lleva más de 15 s y repetir la voz la reiniciaría.
    if (destroyed || transitioning || instance?.noIdle) return;
    idleStage++;
    if (idleStage === 1) playPrompt().then(() => instance?.replay?.());
    else instance?.hint?.(1);
    if (idleStage < 3) idleTimer = setTimeout(onIdle, IDLE_MS);
  }
  stage.addEventListener('pointerdown', () => resetIdle());

  // ---------- Contexto para las actividades ----------
  const ctx = {
    preview,
    childName: st?.name || '',
    say: (c) => sayThing(c),
    speak: (t) => speak(t),
    mascot: (text, mood = 'talk') => showBubble(text, mood, 3000),
    correct(el) {
      sfx.correct();
      if (el) burstAt(el);
      resetIdle();
    },
    wrong(el, opts = {}) {
      actErrors++;
      resetIdle();
      if (el) animateClass(el, 'shake', 600);
      if (opts.quiet) {
        sfx.flip();
      } else {
        sfx.wrong();
        const r = sayRetry();
        showBubble(r.text, 'sad', 2500);
      }
      if (actErrors === 2) instance?.hint?.(1);
      else if (actErrors >= 4 && actErrors % 2 === 0) instance?.hint?.(2);
    },
    done: (opts = {}) => finishActivity(opts),
    async saveDrawing(blob) {
      if (!studentId) return;
      const file = await saveBlob(blob, 'png');
      getProgress(studentId).drawings.push({ file, at: Date.now(), sessionId: session?.id });
      save();
    },
  };

  async function playPrompt() {
    const act = list[idx]?.act;
    if (!act) return;
    const text = act.prompt?.say || '';
    showBubble(text, 'talk');
    repeatBtn.classList.add('playing');
    await sayThing(act.prompt);
    repeatBtn.classList.remove('playing');
    if (!destroyed && list[idx]?.act === act) hideBubbleSoon(2500);
  }

  function updateDots() {
    [...dots.children].forEach((d, i) => {
      d.classList.toggle('current', i === idx);
      d.classList.toggle('past', i < idx);
    });
  }

  async function runActivity(i) {
    idx = i;
    transitioning = false;
    actErrors = 0;
    try { instance?.destroy?.(); } catch (e) { console.error(e); }
    instance = null;
    stage.replaceChildren();
    updateDots();
    const item = list[i];
    const area = h('div', { class: 'act-root enter' });
    stage.append(area);
    if (item.review && (i === 0 || !list[i - 1].review)) {
      showBubble('¡Primero repasamos!', 'happy');
      await speak('¡Primero repasamos!');
      if (destroyed) return;
    }
    try {
      instance = await mountActivity(area, item.act, ctx);
    } catch (e) {
      console.error(e);
      area.append(h('div', { class: 'act-error' }, '😕'));
      setTimeout(() => finishActivity({ quiet: true, skip: true }), 1200);
      return;
    }
    if (destroyed) { instance?.destroy?.(); return; }
    await playPrompt();
    if (destroyed || idx !== i) return;
    instance?.afterPrompt?.();
    resetIdle();
  }

  async function finishActivity(opts = {}) {
    if (transitioning || destroyed) return;
    transitioning = true;
    clearTimeout(idleTimer);
    const item = list[idx];
    if (!opts.skip && isScored(item.act)) {
      scoredCount++;
      errorsTotal += actErrors;
      if (studentId) recordActivity(studentId, item.act, actErrors);
    }
    if (opts.quiet) {
      sfx.tap();
      await sleep(250);
    } else {
      await sleep(850);
      if (destroyed) return;
      sfx.star();
      const dot = dots.children[idx];
      flyStar(stage, dot);
      const p = opts.text ? { text: opts.text, promise: speak(opts.text) } : sayPraise(st?.name);
      showBubble(p.text, 'happy');
      await p.promise;
      await sleep(350);
    }
    if (destroyed) return;
    if (idx + 1 < list.length) runActivity(idx + 1);
    else finishSession();
  }

  async function finishSession() {
    clearInterval(timeInterval);
    tickTime();
    const duration = (Date.now() - startTime) / 1000;
    const stars = starsFor(errorsTotal, scoredCount);
    if (preview) {
      showPreviewEnd(stars);
      return;
    }
    recordSession(studentId, { courseId: course.id, sessionId: session.id, stars, errors: errorsTotal, duration, count: list.length });
    const student = getStudent(studentId);
    student.stars += stars;
    const ev = awardSession(student, { stars, boss: !!boss, unitId: boss?.unitId });
    const missing = ALL_STICKERS.filter((s) => !student.stickers.includes(s.e));
    let sticker = null;
    let bonus = 0;
    if (boss && stars < 2) {
      // el jefe no se vence todavía: sin pegatina, pero sí las estrellas y el XP por intentarlo
    } else if (missing.length) {
      sticker = pick(missing);
      student.stickers.push(sticker.e);
    } else {
      bonus = 2;
      student.stars += bonus;
    }
    save();
    go('reward', { stars, sticker, bonus, courseId: course.id, sessionId: session.id, ev });
  }

  function showPreviewEnd(stars) {
    stage.replaceChildren(h('div', { class: 'preview-end' },
      h('div', { class: 'pe-stars' }, '★'.repeat(stars) + '☆'.repeat(3 - stars)),
      h('p', `Vista previa terminada · errores: ${errorsTotal}`),
      h('div', { class: 'pe-actions' },
        h('button', { class: 'kbtn small', type: 'button', onclick: () => go('player', params) }, '🔁 Repetir'),
        h('button', { class: 'kbtn small green', type: 'button', onclick: goBack }, '✔ Volver'),
      ),
    ));
    sfx.win();
  }

  // ---------- Botones ----------
  repeatBtn.addEventListener('click', async () => {
    sfx.tap();
    resetIdle();
    await playPrompt();
    instance?.replay?.();
  });

  editBtn?.addEventListener('click', () => {
    const act = list[idx]?.act;
    if (!act || !session) return;
    if (act.type === 'reading') go('readingEditor', { sessionId: session.id, activityId: act.id, page: instance?.page?.() ?? 0, returnTo });
    else go('activityEditor', { sessionId: session.id, activityId: act.id });
  });

  exitBtn.addEventListener('click', () => {
    if (preview) { goBack(); return; }
    sfx.tap();
    const overlay = h('div', { class: 'exit-overlay' },
      h('div', { class: 'exit-box' },
        h('div', { class: 'exit-q' }, '¿Salir?'),
        h('div', { class: 'exit-actions' },
          h('button', { class: 'kbtn exit-yes', type: 'button', onclick: () => goBack() }, '✔'),
          h('button', { class: 'kbtn exit-no', type: 'button', onclick: () => overlay.remove() }, '✖'),
        ),
      ));
    page.append(overlay);
    speak('¿Quieres salir?');
  });

  runActivity(0);

  return () => {
    destroyed = true;
    clearTimeout(idleTimer);
    clearTimeout(bubbleTimer);
    clearInterval(timeInterval);
    if (studentId && idx >= 0) tickTime();
    try { instance?.destroy?.(); } catch (e) { console.error(e); }
    stopSpeech();
    void store;
  };
}
