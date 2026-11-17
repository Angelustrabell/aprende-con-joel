// Panel principal del modo papá con pestañas.
import { h } from '../core/dom.js';
import { getStudent, editState } from '../core/store.js';
import { go } from '../core/router.js';
import { confirmDialog } from '../core/modal.js';
import { renderCoursesTab } from './coursesTab.js';
import { renderProgressTab } from './progressTab.js';
import { renderStudentsTab } from './studentsTab.js';
import { renderSettingsTab } from './settingsTab.js';

export const mode = 'parent';

const TABS = [
  { id: 'courses', label: '📚 Cursos', render: renderCoursesTab },
  { id: 'progress', label: '📈 Progreso', render: renderProgressTab },
  { id: 'students', label: '🧒 Alumnos', render: renderStudentsTab },
  { id: 'settings', label: '⚙️ Ajustes', render: renderSettingsTab },
];

export function render(root, { tab = 'courses' } = {}) {
  editState.on = false;
  const content = h('main', { class: 'p-main' });
  const nav = h('nav', { class: 'p-tabs' });
  let cleanup = null;

  const show = (id) => {
    tab = id;
    try { cleanup?.(); } catch { /* nada */ }
    nav.replaceChildren(...TABS.map((t) => h('button', { class: `p-tab ${t.id === id ? 'on' : ''}`, type: 'button', onclick: () => show(t.id) }, t.label)));
    content.replaceChildren();
    cleanup = TABS.find((t) => t.id === id).render(content) || null;
  };

  const st = getStudent();
  root.append(h('div', { class: 'p-page' },
    h('header', { class: 'p-header main' },
      h('div', { class: 'brand' }, h('span', { class: 'brand-star' }, '🌟'), h('div', h('b', 'Aprende con Joel'), h('small', 'Modo papá'))),
      nav,
      h('div', { class: 'p-actions' },
        h('button', { class: 'btn btn-primary', type: 'button', title: 'Ver y editar las pantallas tal como las ve el alumno', onclick: () => { editState.on = true; go('studentHome'); } }, '✏️ Editar viendo como el alumno'),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => go('studentHome') }, `▶ Modo ${st ? st.name : 'alumno'}`),
        h('button', {
          class: 'btn btn-ghost', type: 'button', title: 'Cerrar la app',
          onclick: async () => { if (await confirmDialog('¿Cerrar la aplicación?', { okLabel: 'Cerrar' })) window.api.quit(); },
        }, '⏻'),
      ),
    ),
    content,
  ));
  show(tab);
  return () => cleanup?.();
}
