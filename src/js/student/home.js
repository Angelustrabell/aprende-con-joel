// Pantalla de inicio del modo Joel.
import { h, holdButton, onResize } from '../core/dom.js';
import { store, getStudent, setStudent, selectableCourses, activeCourse, settings, save, editState, courseStats } from '../core/store.js';
import { go } from '../core/router.js';
import { speak } from '../core/speech.js';
import { sfx } from '../core/sfx.js';
import { limitInfo } from '../core/progress.js';
import { backgroundCss } from '../data/rewards.js';
import { openModal } from '../core/modal.js';
import { mascotEl, mascotReact, bubbleEl, setBubble, courseMascot } from './mascot.js';
import { hudEl, missionEl } from './hud.js';
import { chestOverlay } from './chest.js';
import { courseEditDialog } from '../parent/courseDialog.js';

export const mode = 'kid';
let lastGreet = 0;

export function render(root) {
  const st = getStudent();
  if (!st) { go('onboarding'); return; }
  const limit = limitInfo(st.id);
  const courses = selectableCourses();
  const editing = editState.on;

  const hasSwitch = courses.length > 1 || (editing && courses.length > 0);
  const baseSize = hasSwitch ? 'min(15vmin, 150px)' : 'min(19vmin, 180px)';
  const mascot = mascotEl(st, { size: baseSize, cls: 'home-mascot', course: activeCourse() });
  const bubble = bubbleEl();
  const playBtn = h('button', { class: `kbtn play-btn ${limit.reached ? 'sleepy' : ''}`, type: 'button' },
    h('span', { class: 'play-icon' }, limit.reached ? '🌙' : '▶'), h('span', { class: 'play-label' }, '¡Jugar!'));
  const albumBtn = h('button', { class: 'round-btn', type: 'button' }, h('span', '📒'), h('small', 'Álbum'));
  const achBtn = h('button', { class: 'round-btn', type: 'button' }, h('span', '🏅'), h('small', 'Logros'));
  const shopBtn = h('button', { class: 'round-btn', type: 'button' }, h('span', '👕'), h('small', courseMascot(activeCourse(), st).name || 'Mascota'));
  const lockBtn = h('button', { class: 'lock-btn', type: 'button', title: 'Mantén pulsado para el modo papá' }, '🔒');
  const studentBtn = h('button', { class: 'student-chip', type: 'button' }, h('span', { class: 'avatar' }, st.avatar), h('span', st.name));

  // Interruptor de cursos: elige a qué se juega con ¡Jugar!
  const switchEl = hasSwitch ? courseSwitch() : null;
  function courseSwitch() {
    const cur = activeCourse();
    return h('div', { class: 'course-switch' }, ...courses.map((c) => {
      const chip = h('div', { class: `cs-chip ${cur && cur.id === c.id ? 'on' : ''} ${c.visible === false ? 'hiddenc' : ''}`, role: 'button', tabindex: '0', title: c.visible === false ? 'Oculto para Joel' : '' },
        h('span', { class: 'cs-icon' }, c.icon || '📚'), h('span', c.title),
        c.visible === false ? h('span', { class: 'cs-icon' }, '🚫') : null);
      chip.addEventListener('click', () => {
        sfx.tap();
        settings().activeCourseId = c.id;
        save();
        speak(c.title);
        go('studentHome');
      });
      if (editing) {
        const tools = h('span', { class: 'chip-tools' },
          h('span', { title: c.visible === false ? 'Mostrar a Joel' : 'Ocultar a Joel', onclick: (e) => { e.stopPropagation(); c.visible = c.visible === false; save(); go('studentHome'); } }, c.visible === false ? '👁️' : '🚫'),
          h('span', { title: 'Editar curso', onclick: (e) => { e.stopPropagation(); courseEditDialog(c, () => go('studentHome')); } }, '✏️'));
        chip.append(tools);
      }
      return chip;
    }));
  }

  const page = h('div', { class: 'kid-page home', style: { background: backgroundCss(st) } },
    h('div', { class: 'deco clouds' }),
    h('div', { class: 'deco hills' }),
    h('div', { class: 'kid-top' }, studentBtn, hudEl(st, { onChest: () => chestOverlay(page, st, () => go('studentHome')) }), h('div', { class: 'star-pill' }, '⭐ ', h('b', String(st.stars)))),
    h('div', { class: 'home-center' },
      h('div', { class: 'home-mascot-wrap' }, bubble, mascot),
      playBtn,
      missionEl(st),
      switchEl,
      h('div', { class: 'home-row' }, albumBtn, achBtn, shopBtn),
    ),
    lockBtn,
  );
  root.append(page);

  // Ajuste automático: si algo queda fuera de la pantalla se prueba, en orden, con una mascota más pequeña y
  // luego con botones y espacios más compactos, hasta que todo quepa.
  const fitHome = () => {
    const row = page.querySelector('.home-row');
    if (!row) return;
    const fits = () => row.getBoundingClientRect().bottom <= page.clientHeight - 4;
    const steps = [[false, 1], [false, 0.8], [false, 0.65], [true, 0.8], [true, 0.65], [true, 0.5]];
    mascot.style.setProperty('--ms', baseSize);
    page.classList.remove('compact');
    const base = mascot.getBoundingClientRect().width;
    for (const [compact, scale] of steps) {
      page.classList.toggle('compact', compact);
      mascot.style.setProperty('--ms', scale === 1 ? baseSize : `${Math.round(base * scale)}px`);
      if (fits()) break;
    }
  };
  requestAnimationFrame(fitHome);
  let fitRaf = 0;
  const fitSoon = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitHome); }; // fuera del observador, para no provocar avisos
  const stopFit1 = onResize(page, fitSoon);
  const stopFit2 = onResize(page.querySelector('.home-mascot-wrap'), fitSoon); // el globo de la guía cambia la altura
  const stopFit = () => { stopFit1(); stopFit2(); };

  mascot.addEventListener('click', () => {
    mascotReact(mascot, 'happy');
    sfx.pop(4);
    const t = `¡Hola, ${st.name}!`;
    setBubble(bubble, t);
    speak(t);
  });

  playBtn.addEventListener('click', () => {
    sfx.tap();
    if (!editing && limitInfo(st.id).reached) { go('limit'); return; }
    const course = activeCourse();
    if (!course || (!editing && !courseStats(course).activities)) {
      const t = 'Todavía no hay juegos. Pídele a papá que prepare uno.';
      setBubble(bubble, t);
      speak(t);
      return;
    }
    go('map', { courseId: course.id });
  });
  albumBtn.addEventListener('click', () => { sfx.tap(); go('album'); });
  achBtn.addEventListener('click', () => { sfx.tap(); go('achievements'); });
  shopBtn.addEventListener('click', () => { sfx.tap(); go('shop'); });
  holdButton(lockBtn, 2000, () => go('pin', { next: 'parentHome' }));

  studentBtn.addEventListener('click', () => {
    if (store.data.students.length < 2) return;
    const m = openModal({
      kid: true,
      title: '¿Quién va a jugar?',
      content: h('div', { class: 'student-pick' }, ...store.data.students.map((s) => {
        const b = h('button', { class: 'student-tile', type: 'button' }, h('span', { class: 'avatar' }, s.avatar), h('span', s.name));
        b.addEventListener('click', () => { setStudent(s.id); m.close(); go('studentHome'); });
        return b;
      })),
    });
  });

  // Saludo (no cada vez que se vuelve al inicio).
  const greet = Date.now() - lastGreet > 4 * 60 * 1000;
  const t = setTimeout(() => {
    const text = limit.reached ? `¡Hola, ${st.name}! Por hoy ya jugamos mucho.` : `¡Hola, ${st.name}! ¿Jugamos?`;
    setBubble(bubble, text);
    mascotReact(mascot, 'talk');
    if (greet) { lastGreet = Date.now(); speak(text); }
  }, 500);
  return () => { clearTimeout(t); stopFit(); };
}
