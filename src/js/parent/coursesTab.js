// Pestaña de cursos.
import { h } from '../core/dom.js';
import { store, save, courseStats, addBooksCopy, addPrimeroCopy } from '../core/store.js';
import { go } from '../core/router.js';
import { uid } from '../core/util.js';
import { confirmDialog, openModal, toast } from '../core/modal.js';
import { seedCourse } from '../data/templates.js';
import { iconInput, colorChoice, toggle, field } from './widgets.js';
import { exportCourse, importCourse, duplicateCourse } from './transfer.js';

function newCourseDialog(onCreate) {
  const data = { title: '', icon: '📚', color: '#6c4cf5' };
  const title = h('input', { class: 'input', placeholder: 'Ej.: Letras de la M a la Z, Inglés, Mis animales…' });
  openModal({
    title: 'Nuevo curso',
    content: h('div', { class: 'form-col' },
      field('Título', title),
      field('Icono', iconInput(data.icon, (v) => { data.icon = v; })),
      field('Color', colorChoice(data.color, (c) => { data.color = c; }))),
    actions: [
      { label: 'Cancelar', class: 'btn-ghost' },
      {
        label: 'Crear', class: 'btn-primary',
        onClick: () => {
          if (!title.value.trim()) { title.focus(); return false; }
          onCreate({ id: uid(), title: title.value.trim(), icon: data.icon || '📚', color: data.color, visible: true, units: [] });
          return true;
        },
      },
    ],
  });
}

export function renderCoursesTab(el) {
  const draw = () => {
    el.replaceChildren();
    el.append(h('div', { class: 'section-head' },
      h('h2', 'Cursos'),
      h('div', { class: 'row' },
        h('button', { class: 'btn btn-ghost', type: 'button', title: 'Añade otra copia del curso de primero (por si quieres volver al original)', onclick: async () => { try { await addPrimeroCopy(); toast('🚀 Curso de primero añadido', 'ok'); draw(); } catch (e) { toast(`No se pudo cargar: ${e.message}`, 'error'); } } }, '🚀 Cargar Camino a primero'),
        h('button', { class: 'btn btn-ghost', type: 'button', title: 'Añade otra copia del curso con el texto original de los libros', onclick: async () => { try { await addBooksCopy(); toast('📖 Curso original añadido (oculto para Joel)', 'ok'); draw(); } catch (e) { toast(`No se pudo cargar: ${e.message}`, 'error'); } } }, '📖 Cargar libros originales'),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: async () => { if (await importCourse()) draw(); } }, '📥 Importar curso'),
        h('button', {
          class: 'btn btn-primary', type: 'button',
          onclick: () => newCourseDialog((c) => { store.data.courses.push(c); save(); go('courseEditor', { courseId: c.id }); }),
        }, '＋ Nuevo curso'))));

    if (!store.data.courses.length) {
      el.append(h('div', { class: 'empty' },
        h('div', { class: 'empty-icon' }, '📚'),
        h('p', 'Todavía no hay cursos.'),
        h('div', { class: 'row center' },
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { store.data.courses.push(seedCourse()); save(); draw(); } }, '🌟 Cargar el curso de ejemplo'),
          h('button', { class: 'btn btn-primary', type: 'button', onclick: () => newCourseDialog((c) => { store.data.courses.push(c); save(); go('courseEditor', { courseId: c.id }); }) }, '＋ Crear un curso'))));
      return;
    }

    el.append(h('div', { class: 'course-cards' }, ...store.data.courses.map((c, i) => {
      const st = courseStats(c);
      return h('div', { class: 'panel course-card' },
        h('div', { class: 'cc-icon', style: { background: c.color || '#6c4cf5' } }, c.icon || '📚'),
        h('div', { class: 'cc-body' },
          h('button', { class: 'cc-title link-like', type: 'button', onclick: () => go('courseEditor', { courseId: c.id }) }, c.title),
          h('div', { class: 'muted small' }, `${st.units} unidades · ${st.sessions} sesiones · ${st.activities} actividades`),
          toggle(c.visible !== false, (v) => { c.visible = v; save(); }, 'Visible para el alumno')),
        h('div', { class: 'cc-actions' },
          h('button', { class: 'btn btn-primary', type: 'button', onclick: () => go('courseEditor', { courseId: c.id }) }, '✏️ Editar'),
          h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Exportar (para compartir o guardar)', onclick: () => exportCourse(c) }, '📤'),
          h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Duplicar', onclick: () => { duplicateCourse(c); save(); draw(); toast('Curso duplicado'); } }, '⧉'),
          h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Subir', disabled: i === 0, onclick: () => { const a = store.data.courses; [a[i - 1], a[i]] = [a[i], a[i - 1]]; save(); draw(); } }, '↑'),
          h('button', {
            class: 'btn btn-ghost btn-icon danger', type: 'button', title: 'Eliminar',
            onclick: async () => {
              if (!(await confirmDialog(`¿Eliminar el curso "${c.title}"? Se borrarán sus ${st.sessions} sesiones. (El progreso guardado no se pierde, pero ya no se verá.)`, { okLabel: 'Eliminar curso', danger: true }))) return;
              store.data.courses.splice(i, 1);
              save();
              draw();
            },
          }, '🗑')),
      );
    })));
    el.append(h('p', { class: 'muted small' }, 'Consejo: exporta un curso para compartirlo con otra familia o guardarlo; se incluyen tus imágenes y grabaciones.'));
  };
  draw();
}
