// Pestaña de alumnos (perfiles).
import { h } from '../core/dom.js';
import { store, save, newStudent, setStudent } from '../core/store.js';
import { confirmDialog, openModal } from '../core/modal.js';
import { AVATARS, MASCOTS } from '../data/rewards.js';
import { field } from './widgets.js';
import { glyph, kindText } from '../data/mascotArt.js';

function studentDialog(st, onSave) {
  const data = { name: st?.name || '', avatar: st?.avatar || AVATARS[0], mascot: st?.mascot?.kind || MASCOTS[0].e };
  const name = h('input', { class: 'input', value: data.name, placeholder: 'Nombre' });
  const avatars = h('div', { class: 'onb-avatars' });
  const drawAv = () => avatars.replaceChildren(...AVATARS.map((a) => h('button', { class: `avatar-btn ${a === data.avatar ? 'on' : ''}`, type: 'button', onclick: () => { data.avatar = a; drawAv(); } }, a)));
  drawAv();
  const mascots = h('div', { class: 'onb-mascots small' });
  const drawM = () => mascots.replaceChildren(...MASCOTS.map((m) => h('button', { class: `mascot-btn ${m.e === data.mascot ? 'on' : ''}`, type: 'button', onclick: () => { data.mascot = m.e; drawM(); } }, h('span', glyph(m.e)), h('small', m.n))));
  drawM();
  openModal({
    title: st ? 'Editar alumno' : 'Nuevo alumno',
    wide: true,
    content: h('div', { class: 'form-col' }, field('Nombre', name), field('Avatar', avatars), field('Mascota', mascots)),
    actions: [
      { label: 'Cancelar', class: 'btn-ghost' },
      {
        label: 'Guardar', class: 'btn-primary',
        onClick: () => {
          if (!name.value.trim()) { name.focus(); return false; }
          onSave({ name: name.value.trim(), avatar: data.avatar, mascot: MASCOTS.find((m) => m.e === data.mascot) });
          return true;
        },
      },
    ],
  });
}

export function renderStudentsTab(el) {
  const draw = () => {
    el.replaceChildren(
      h('div', { class: 'section-head' },
        h('h2', 'Alumnos'),
        h('button', {
          class: 'btn btn-primary', type: 'button',
          onclick: () => studentDialog(null, (d) => {
            const s = newStudent(d.name, d.avatar);
            s.mascot.kind = d.mascot.e;
            s.mascot.name = d.mascot.n;
            store.data.students.push(s);
            save();
            draw();
          }),
        }, '＋ Añadir alumno')),
      h('div', { class: 'student-cards' }, ...store.data.students.map((s) => h('div', { class: `panel student-card ${s.id === store.studentId ? 'current' : ''}` },
        h('div', { class: 'sc-avatar' }, s.avatar),
        h('div', { class: 'sc-body' },
          h('b', s.name),
          h('div', { class: 'muted small' }, `Mascota: ${kindText(s.mascot.kind)} ${s.mascot.name} · ⭐ ${s.stars} · 📒 ${s.stickers.length} ${s.stickers.length === 1 ? 'pegatina' : 'pegatinas'}`),
          s.id === store.studentId ? h('span', { class: 'badge' }, 'Juega ahora') : h('button', { class: 'btn btn-ghost small', type: 'button', onclick: () => { setStudent(s.id); draw(); } }, 'Elegir para jugar')),
        h('div', { class: 'cc-actions' },
          h('button', {
            class: 'btn btn-ghost btn-icon', type: 'button', title: 'Editar',
            onclick: () => studentDialog(s, (d) => {
              s.name = d.name;
              s.avatar = d.avatar;
              if (s.mascot.kind !== d.mascot.e) { s.mascot.kind = d.mascot.e; s.mascot.name = d.mascot.n; }
              save();
              draw();
            }),
          }, '✏️'),
          store.data.students.length > 1 ? h('button', {
            class: 'btn btn-ghost btn-icon danger', type: 'button', title: 'Eliminar',
            onclick: async () => {
              if (!(await confirmDialog(`¿Eliminar a ${s.name} y todo su progreso?`, { okLabel: 'Eliminar', danger: true }))) return;
              store.data.students = store.data.students.filter((x) => x !== s);
              delete store.data.progress[s.id];
              if (store.studentId === s.id) setStudent(store.data.students[0].id);
              save();
              draw();
            },
          }, '🗑') : null),
      ))),
      h('p', { class: 'muted small' }, 'Si hay más de un alumno, en el modo alumno se puede cambiar tocando el nombre arriba a la izquierda.'),
    );
  };
  draw();
}
