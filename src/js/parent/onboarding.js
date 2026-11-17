// Primera configuración: PIN, nombre del niño, mascota y curso de ejemplo.
import { h } from '../core/dom.js';
import { store, settings, newStudent, setStudent, saveNow } from '../core/store.js';
import { go } from '../core/router.js';
import { hashPin } from '../core/util.js';
import { speak } from '../core/speech.js';
import { MASCOTS, AVATARS } from '../data/rewards.js';
import { glyph } from '../data/mascotArt.js';
import { seedCourse } from '../data/templates.js';
import { pinPad } from './pinPad.js';

export const mode = 'parent';

export function render(root, { onlyPin = false } = {}) {
  const data = store.data;
  const answers = { name: 'Joel', avatar: '👦', mascot: MASCOTS[0], seed: true, minutes: 20 };
  const box = h('div', { class: 'onb-card' });
  root.append(h('div', { class: 'onb-page' }, box));
  let pad = null;

  const steps = [];
  if (!onlyPin) steps.push(welcome);
  if (!settings().pinHash || onlyPin) steps.push(pinStep);
  if (!onlyPin && !data.students.length) steps.push(childStep, mascotStep);
  if (!onlyPin && !data.courses.length) steps.push(courseStep);
  steps.push(doneStep);
  let i = 0;

  function show() {
    pad?.destroy();
    pad = null;
    box.replaceChildren();
    steps[i]();
  }
  const nextStep = () => { i++; show(); };

  function header(title, sub) {
    return [
      h('div', { class: 'onb-progress' }, ...steps.map((_, k) => h('span', { class: k <= i ? 'on' : '' }))),
      h('h1', title),
      sub ? h('p', { class: 'onb-sub' }, sub) : null,
    ];
  }

  function welcome() {
    box.append(...header('¡Bienvenido a Aprende con Joel! 🌟', 'Una app para aprender jugando, con dos modos:'),
      h('div', { class: 'onb-modes' },
        h('div', { class: 'onb-mode' }, h('div', { class: 'big' }, '👨'), h('b', 'Modo papá'), h('p', 'Creas los cursos, ves el progreso y ajustas límites. Protegido con PIN.')),
        h('div', { class: 'onb-mode' }, h('div', { class: 'big' }, '🧒'), h('b', 'Modo alumno'), h('p', 'Pantalla completa, con voz, dibujos grandes, mascota y premios.')),
      ),
      h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: nextStep }, 'Empezar'));
  }

  function pinStep() {
    let first = null;
    box.append(...header('Crea tu PIN', 'Son 4 números para entrar al modo papá. Joel no debe saberlo.'));
    pad = pinPad({
      title: 'Nuevo PIN',
      subtitle: 'Escribe 4 números',
      onComplete: async (pin) => {
        if (!first) {
          first = pin;
          pad.setTitle('Repite el PIN');
          pad.setMessage('Otra vez, para confirmar');
          pad.reset();
          return true;
        }
        if (pin !== first) {
          first = null;
          pad.setTitle('Nuevo PIN');
          pad.setMessage('No coinciden. Empecemos de nuevo.');
          return false;
        }
        settings().pinHash = await hashPin(pin);
        await saveNow();
        nextStep();
        return true;
      },
    });
    box.append(h('div', { class: 'onb-pin' }, pad.el));
  }

  function childStep() {
    const name = h('input', { class: 'input input-lg', value: answers.name, placeholder: 'Nombre' });
    const avatars = h('div', { class: 'onb-avatars' });
    const drawAvatars = () => avatars.replaceChildren(...AVATARS.map((a) => {
      const b = h('button', { class: `avatar-btn ${a === answers.avatar ? 'on' : ''}`, type: 'button' }, a);
      b.addEventListener('click', () => { answers.avatar = a; drawAvatars(); });
      return b;
    }));
    drawAvatars();
    box.append(...header('¿Quién va a aprender?', 'Puedes añadir más niños después en Alumnos.'),
      h('label', { class: 'field' }, h('span', 'Nombre'), name),
      h('div', { class: 'field' }, h('span', 'Avatar'), avatars),
      h('button', {
        class: 'btn btn-primary btn-lg', type: 'button',
        onclick: () => { answers.name = name.value.trim() || 'Joel'; nextStep(); },
      }, 'Siguiente'));
  }

  function mascotStep() {
    const grid = h('div', { class: 'onb-mascots' });
    const draw = () => grid.replaceChildren(...MASCOTS.map((m) => {
      const b = h('button', { class: `mascot-btn ${m === answers.mascot ? 'on' : ''}`, type: 'button' }, h('span', glyph(m.e)), h('small', m.n));
      b.addEventListener('click', () => { answers.mascot = m; draw(); speak(`¡Hola! Soy ${m.n}.`); });
      return b;
    }));
    draw();
    box.append(...header(`Elige la mascota de ${answers.name}`, 'Le acompañará, le hablará y le felicitará. Joel podrá cambiarla y vestirla con sus estrellas.'),
      grid,
      h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: nextStep }, 'Siguiente'));
  }

  function courseStep() {
    const seed = h('input', { type: 'checkbox', checked: true });
    const minutes = h('select', { class: 'input' },
      ...[[10, '10 minutos'], [15, '15 minutos'], [20, '20 minutos'], [30, '30 minutos'], [45, '45 minutos'], [0, 'Sin límite']]
        .map(([v, l]) => h('option', { value: String(v), selected: v === 20 }, l)));
    box.append(...header('Contenido y tiempo'),
      h('label', { class: 'check-card' }, seed,
        h('div', h('b', 'Cargar el curso de ejemplo'),
          h('p', 'Vocales, números del 1 al 5, colores, animales, formas, patrones, emociones, sumas y láminas para colorear. Puedes editarlo o borrarlo.'))),
      h('label', { class: 'field' }, h('span', 'Tiempo máximo de juego al día'), minutes),
      h('button', {
        class: 'btn btn-primary btn-lg', type: 'button',
        onclick: () => { answers.seed = seed.checked; answers.minutes = Number(minutes.value); nextStep(); },
      }, 'Siguiente'));
  }

  async function finishSetup() {
    if (!data.students.length && !onlyPin) {
      const st = newStudent(answers.name, answers.avatar);
      st.mascot.kind = answers.mascot.e;
      st.mascot.name = answers.mascot.n;
      data.students.push(st);
      setStudent(st.id);
    }
    if (steps.includes(courseStep)) {
      if (answers.seed) data.courses.push(seedCourse());
      settings().dailyMinutes = answers.minutes;
    }
    await saveNow();
  }

  function doneStep() {
    finishSetup();
    box.append(...header('¡Todo listo! 🎉', onlyPin ? 'Tu PIN nuevo ya está guardado.' : `Para volver al modo papá desde el modo de ${answers.name}, mantén pulsado el candado 🔒 de la esquina 2 segundos y escribe tu PIN.`),
      h('div', { class: 'onb-actions' },
        h('button', { class: 'btn btn-ghost btn-lg', type: 'button', onclick: () => go('parentHome') }, '👨 Ir al modo papá'),
        h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: () => go('studentHome') }, `🧒 Empezar a jugar`),
      ));
  }

  show();
  return () => pad?.destroy();
}
