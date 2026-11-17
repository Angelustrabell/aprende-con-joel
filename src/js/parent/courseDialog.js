// Ventana para editar un curso (título, icono, color, visibilidad y orden) desde el modo edición.
import { h } from '../core/dom.js';
import { save } from '../core/store.js';
import { go } from '../core/router.js';
import { openModal } from '../core/modal.js';
import { field, iconInput, colorChoice, toggle } from './widgets.js';
import { MASCOTS } from '../data/rewards.js';
import { glyph } from '../data/mascotArt.js';

export function courseEditDialog(course, onDone) {
  const title = h('input', { class: 'input', value: course.title });
  const storyBox = h('textarea', { class: 'input', rows: 3, placeholder: 'Lo que dice la guía la primera vez que Joel entra al curso', value: course.story || '' });
  const data = { icon: course.icon || '📚', color: course.color || '#6c4cf5', visible: course.visible !== false, freeOrder: !!course.freeOrder, mascot: course.mascot?.kind || '' };
  const mascots = h('div', { class: 'onb-mascots small' });
  const drawM = () => mascots.replaceChildren(
    h('button', { class: `mascot-btn ${!data.mascot ? 'on' : ''}`, type: 'button', onclick: () => { data.mascot = ''; drawM(); } }, h('span', '👦'), h('small', 'La del alumno')),
    ...MASCOTS.map((m) => h('button', { class: `mascot-btn ${m.e === data.mascot ? 'on' : ''}`, type: 'button', onclick: () => { data.mascot = m.e; drawM(); } }, h('span', glyph(m.e)), h('small', m.n))));
  drawM();
  openModal({
    title: 'Editar curso',
    content: h('div', { class: 'form-col' },
      field('Título', title),
      field('Icono', iconInput(data.icon, (v) => { data.icon = v; })),
      field('Color', colorChoice(data.color, (c) => { data.color = c; })),
      field('Guía del curso (mascota)', mascots, 'Es la mascota que acompaña a Joel en este curso.'),
      field('Historia de bienvenida', storyBox, 'La guía la cuenta con su voz al entrar por primera vez.'),
      field('Visible para el alumno', toggle(data.visible, (v) => { data.visible = v; })),
      field('Abrir en cualquier orden', toggle(data.freeOrder, (v) => { data.freeOrder = v; }), 'Si está apagado, cada sesión se abre al terminar la anterior (excepto las que bloquees tú).'),
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => go('courseEditor', { courseId: course.id }) }, '🛠 Abrir en el panel (unidades y sesiones)')),
    actions: [
      { label: 'Cancelar', class: 'btn-ghost' },
      {
        label: 'Guardar', class: 'btn-primary',
        onClick: () => {
          course.title = title.value.trim() || course.title;
          course.icon = data.icon;
          course.color = data.color;
          course.visible = data.visible;
          course.freeOrder = data.freeOrder;
          const story = storyBox.value.trim();
          if (story) course.story = story; else delete course.story;
          if (data.mascot) course.mascot = { kind: data.mascot, name: MASCOTS.find((m) => m.e === data.mascot)?.n || '' }; else delete course.mascot;
          save();
          onDone?.();
          return true;
        },
      },
    ],
  });
}
