// Mapa de aventura de un curso: cada unidad es un MUNDO con su progreso, su jefe y su historia.
// En modo edición (papá) cada conferencia lleva herramientas: bloquear, editar, mover, eliminar.
import { h, animateClass, onResize } from '../core/dom.js';
import { findCourse, getStudent, editState, save } from '../core/store.js';
import { go } from '../core/router.js';
import { speak } from '../core/speech.js';
import { sfx } from '../core/sfx.js';
import { sessionDone, sessionUnlocked, sessionStars, limitInfo, hasContent } from '../core/progress.js';
import { getGame, unitStatus, worldUnlocked } from '../core/game.js';
import { backgroundCss } from '../data/rewards.js';
import { uid } from '../core/util.js';
import { promptDialog, toast } from '../core/modal.js';
import { sessionEditDialog, readingOf } from '../parent/sessionDialog.js';
import { newActivity } from '../data/activityTypes.js';
import { mascotEl } from './mascot.js';

export const mode = 'kid';
const SVG = 'http://www.w3.org/2000/svg';
const WORLD_COLORS = ['#7cc8ff', '#ffb347', '#8be28b', '#ff8fb8', '#b08bff', '#5fd3c8'];

function drawLines(path, svg) {
  const nodes = [...path.querySelectorAll('.map-node')];
  const pr = path.getBoundingClientRect();
  svg.setAttribute('width', pr.width);
  svg.setAttribute('height', pr.height);
  svg.replaceChildren();
  if (nodes.length < 2) return;
  const pts = nodes.map((n) => {
    const r = n.getBoundingClientRect();
    return { x: r.left - pr.left + r.width / 2, y: r.top - pr.top + r.height / 2 };
  });
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const mx = (a.x + b.x) / 2;
    d += ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  }
  const p = document.createElementNS(SVG, 'path');
  p.setAttribute('d', d);
  svg.append(p);
}

export function render(root, { courseId, scrollTo = null }) {
  const course = findCourse(courseId);
  const st = getStudent();
  if (!course || !st) { go('studentHome'); return; }
  const editing = editState.on;
  const g = getGame(st);
  const disposers = [];
  let nextNode = null;
  let focusNode = null;
  const refresh = (focus) => go('map', { courseId, scrollTo: focus || null });
  const returnHere = (sid) => ({ name: 'map', params: { courseId, scrollTo: sid } });

  // Siguiente misión: la primera sesión sin hacer, en un mundo abierto y desbloqueada.
  let next = null;
  if (!editing) {
    outer: for (const unit of course.units) {
      if (!worldUnlocked(st, course, unit)) continue;
      for (let i = 0; i < unit.sessions.length; i++) {
        const s = unit.sessions[i];
        if (hasContent(s) && !s.locked && !sessionDone(st.id, s.id) && sessionUnlocked(st.id, unit, i, course)) { next = s; break outer; }
      }
    }
  }

  const back = h('button', { class: 'kid-back', type: 'button' }, '🏠');
  back.addEventListener('click', () => go('studentHome'));
  const scroll = h('div', { class: 'map-scroll' });

  const openForEdit = (s) => {
    const reading = readingOf(s);
    if (hasContent(s)) go('player', { sessionId: s.id, preview: true, edit: true, returnTo: returnHere(s.id) });
    else if (reading) go('readingEditor', { sessionId: s.id, activityId: reading.id, returnTo: returnHere(s.id) });
    else go('sessionEditor', { sessionId: s.id });
  };

  async function addSession(unit) {
    const title = await promptDialog('Nombre de la nueva conferencia', { placeholder: 'Ej.: 51. Mi primera lección' });
    if (!title) return;
    const act = newActivity('reading');
    const s = { id: uid(), title, icon: '📖', locked: false, source: '', activities: [act] };
    unit.sessions.push(s);
    save();
    go('readingEditor', { sessionId: s.id, activityId: act.id, returnTo: returnHere(s.id) });
  }

  function nodeTools(unit, s, i) {
    const swap = (j) => { [unit.sessions[i], unit.sessions[j]] = [unit.sessions[j], unit.sessions[i]]; save(); refresh(s.id); };
    const stop = (fn) => (e) => { e.stopPropagation(); fn(); };
    return h('span', { class: 'node-tools' },
      h('span', { title: s.locked ? 'Habilitar para Joel' : 'Bloquear para Joel', onclick: stop(() => { s.locked = !s.locked; save(); refresh(s.id); }) }, s.locked ? '🔒' : '🔓'),
      h('span', { title: 'Editar', onclick: stop(() => sessionEditDialog(course, unit, s, () => refresh(s.id))) }, '✏️'),
      h('span', { title: 'Mover antes', class: i === 0 ? 'off' : '', onclick: stop(() => swap(i - 1)) }, '◀'),
      h('span', { title: 'Mover después', class: i === unit.sessions.length - 1 ? 'off' : '', onclick: stop(() => swap(i + 1)) }, '▶'));
  }

  course.units.forEach((unit, ui) => {
    if (!editing && !unit.sessions.some(hasContent)) return;
    const status = unitStatus(st, unit);
    const open = worldUnlocked(st, course, unit);
    const color = unit.color || WORLD_COLORS[ui % WORLD_COLORS.length];
    const svg = document.createElementNS(SVG, 'svg');
    svg.classList.add('map-lines');
    const path = h('div', { class: 'map-path' }, svg);

    unit.sessions.forEach((s, i) => {
      if (!editing && !hasContent(s)) return;
      const done = sessionDone(st.id, s.id);
      const unlocked = open && sessionUnlocked(st.id, unit, i, course);
      const stars = sessionStars(st.id, s.id);
      const isNext = next && next.id === s.id;
      const cls = `map-node ${done ? 'done' : ''} ${unlocked ? '' : 'locked'} ${s.locked ? 'parent-locked' : ''} ${isNext ? 'next' : ''}`;
      const node = h('button', { class: cls, type: 'button', 'data-sid': s.id },
        h('span', { class: 'node-icon' }, unlocked ? (s.icon || '⭐') : '🔒'),
        done ? h('span', { class: 'node-stars' }, '★'.repeat(stars) + '☆'.repeat(3 - stars)) : null,
        h('span', { class: 'node-title' }, s.title),
        editing ? nodeTools(unit, s, i) : null,
      );
      node.addEventListener('click', () => {
        if (editing) { openForEdit(s); return; }
        if (!unlocked) {
          animateClass(node, 'shake');
          sfx.wrong();
          const req = course.units.find((u) => u.id === unit.requires);
          speak(!open ? `Primero vence al jefe de ${req?.title || 'el mundo anterior'}.` : s.locked ? 'Esta la abre papá.' : 'Primero termina el anterior.');
          return;
        }
        sfx.tap();
        if (limitInfo(st.id).reached) { go('limit'); return; }
        go('player', { sessionId: s.id });
      });
      path.append(node);
      if (isNext) nextNode = node;
      if (scrollTo === s.id) focusNode = node;
    });

    // Jefe del mundo: se enfrenta al terminar todas las misiones del mundo.
    if (status.hasBoss) {
      const ready = status.bossAvail && !status.bossDefeated;
      const boss = h('button', { class: `map-node boss ${status.bossDefeated ? 'defeated' : ''} ${ready ? 'ready' : ''} ${status.bossAvail || editing ? '' : 'locked'}`, type: 'button', 'data-boss': unit.id },
        h('span', { class: 'node-icon' }, status.bossAvail || editing ? (status.bossDefeated ? '🏆' : unit.bossIcon || '👾') : '🔒'),
        status.bossStars ? h('span', { class: 'node-stars' }, '★'.repeat(status.bossStars) + '☆'.repeat(3 - status.bossStars)) : null,
        h('span', { class: 'node-title' }, status.bossDefeated ? 'Jefe vencido' : 'Jefe del mundo'));
      boss.addEventListener('click', () => {
        if (editing) { go('player', { boss: { unitId: unit.id }, preview: true, returnTo: returnHere(null) }); return; }
        if (!open || !status.bossAvail) {
          animateClass(boss, 'shake');
          sfx.wrong();
          speak('Termina todas las misiones de este mundo para enfrentar al jefe.');
          return;
        }
        sfx.tap();
        if (limitInfo(st.id).reached) { go('limit'); return; }
        go('player', { boss: { unitId: unit.id } });
      });
      path.append(boss);
    }

    const pill = h('div', { class: 'unit-pill' }, h('span', { class: 'unit-icon' }, unit.icon || '📘'), unit.title);
    const head = h('div', { class: 'unit-head-kid world-head' }, pill);
    if (status.total) {
      head.append(h('div', { class: 'world-prog' }, `${status.done}/${status.total}`,
        h('span', { class: 'wp-bar' }, h('span', { style: { width: `${Math.round((status.done / status.total) * 100)}%` } })),
        status.bossDefeated ? '🏆' : ''));
    }
    if (!open && !editing) {
      const req = course.units.find((u) => u.id === unit.requires);
      head.append(h('div', { class: 'world-lock' }, '🔒 Vence al jefe de ', req?.title || 'el mundo anterior'));
    }
    if (editing) {
      const setAll = (locked) => { unit.sessions.forEach((s) => { s.locked = locked; }); save(); refresh(); toast(locked ? '🔒 Todas bloqueadas' : '🔓 Todas habilitadas'); };
      const tools = h('span', { class: 'unit-tools' },
        h('button', {
          type: 'button',
          onclick: async () => {
            const t = await promptDialog('Nombre de la unidad', { value: unit.title });
            if (t) { unit.title = t; save(); refresh(); }
          },
        }, '✏️ Renombrar'),
        h('button', { type: 'button', title: 'Lo que dice la guía al llegar a este mundo', onclick: async () => { const t = await promptDialog('Historia del mundo (la cuenta la guía)', { value: unit.story || '', multiline: true }); if (t !== null && t !== undefined) { if (t.trim()) unit.story = t.trim(); else delete unit.story; delete g.seenStory[unit.id]; save(); toast('📜 Historia guardada'); } } }, '📜 Historia'),
        h('button', { type: 'button', onclick: () => setAll(false) }, '🔓 Habilitar todas'),
        h('button', { type: 'button', onclick: () => setAll(true) }, '🔒 Bloquear todas'),
        h('button', { type: 'button', onclick: () => addSession(unit) }, '＋ Conferencia'));
      if (unit.requires) {
        tools.append(h('button', { type: 'button', title: 'Este mundo pide vencer a otro antes. Aquí lo abres para Joel sin que lo venza.', onclick: () => { unit.open = !unit.open; save(); refresh(); toast(unit.open ? '🌍 Mundo abierto para Joel' : '🌍 Vuelve a pedir el mundo anterior'); } }, unit.open ? '🌍 Pedir mundo anterior' : '🌍 Abrir mundo a Joel'));
      }
      head.append(tools);
    }
    const section = h('section', { class: `map-unit world ${open || editing ? '' : 'closed'}`, style: { '--wc': color } }, head, path);
    scroll.append(section);
    disposers.push(onResize(path, () => drawLines(path, svg)));
  });

  if (editing) {
    scroll.append(h('button', {
      class: 'map-add', type: 'button',
      onclick: async () => {
        const t = await promptDialog('Nombre de la unidad nueva', { placeholder: 'Ej.: Fase C' });
        if (!t) return;
        course.units.push({ id: uid(), title: t, icon: '📘', sessions: [] });
        save();
        refresh();
      },
    }, '＋ Nueva unidad'));
  }

  if (nextNode) nextNode.append(mascotEl(st, { size: 'min(10vmin, 90px)', cls: 'node-mascot', course }));

  const page = h('div', { class: 'kid-page map', style: { background: backgroundCss(st) } },
    h('div', { class: 'kid-top' }, back, h('div', { class: 'kid-title' }, h('span', course.icon || '📚'), ' ', course.title), h('div', { class: 'star-pill' }, '⭐ ', h('b', String(st.stars)))),
    scroll,
  );
  root.append(page);

  // Historia: la primera vez que se llega a un mundo, la guía cuenta de qué trata.
  let storyShown = false;
  if (!editing) {
    const story = [];
    if (course.story) story.push({ key: `curso-${course.id}`, title: course.title, text: course.story });
    for (const unit of course.units) {
      if (unit.story && worldUnlocked(st, course, unit) && unit.sessions.some(hasContent)) story.push({ key: unit.id, title: unit.title, text: unit.story });
    }
    const fresh = story.find((x) => !g.seenStory[x.key]);
    if (fresh) {
      storyShown = true;
      const guide = mascotEl(st, { size: 'min(26vmin, 220px)', course });
      const go1 = h('button', { class: 'kbtn green story-go', type: 'button' }, '¡Vamos! ▶');
      const overlay = h('div', { class: 'story-overlay' },
        h('div', { class: 'story-card' }, guide,
          h('div', { class: 'story-text' }, h('div', { class: 'story-title' }, fresh.title), h('div', { class: 'story-body' }, fresh.text), go1)));
      page.append(overlay);
      setTimeout(() => speak(`${fresh.title}. ${fresh.text}`), 400);
      go1.addEventListener('click', () => { sfx.tap(); g.seenStory[fresh.key] = true; save(); overlay.remove(); speak('¡Toca la misión que brilla!'); nextNode?.scrollIntoView({ block: 'center', behavior: 'smooth' }); });
    }
  }

  const t = setTimeout(() => {
    (focusNode || nextNode)?.scrollIntoView({ block: 'center', behavior: focusNode ? 'auto' : 'smooth' });
    if (!editing && !storyShown) speak(nextNode ? '¡Toca la misión que brilla!' : '¡Terminaste todo lo que está abierto! Puedes repetir el que quieras.');
  }, 350);
  return () => { clearTimeout(t); disposers.forEach((d) => d()); };
}
