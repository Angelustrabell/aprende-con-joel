// Ventana rápida para editar una sesión (conferencia) desde el mapa en modo edición.
import { h } from '../core/dom.js';
import { save } from '../core/store.js';
import { go } from '../core/router.js';
import { confirmDialog, openModal, toast } from '../core/modal.js';
import { field, iconInput, toggle } from './widgets.js';

export const readingOf = (session) => session.activities.find((a) => a.type === 'reading') || null;

export function sessionEditDialog(course, unit, session, onDone) {
  const title = h('input', { class: 'input', value: session.title });
  const data = { icon: session.icon || '📖', locked: !!session.locked };
  const reading = readingOf(session);
  const m = openModal({
    title: 'Editar conferencia',
    wide: true,
    content: h('div', { class: 'form-col' },
      field('Título', title),
      field('Icono', iconInput(data.icon, (v) => { data.icon = v; })),
      field('Bloqueada para Joel 🔒', toggle(data.locked, (v) => { data.locked = v; }), 'Joel la ve con candado y no puede abrirla hasta que la habilites.'),
      h('div', { class: 'row' },
        reading ? h('button', {
          class: 'btn btn-primary', type: 'button',
          onclick: () => { m.close(); go('readingEditor', { sessionId: session.id, activityId: reading.id, returnTo: { name: 'map', params: { courseId: course.id } } }); },
        }, '📝 Editar el texto') : null,
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { m.close(); go('sessionEditor', { sessionId: session.id }); } }, '🧩 Actividades de la sesión'),
        h('button', {
          class: 'btn btn-ghost danger', type: 'button',
          onclick: async () => {
            if (!(await confirmDialog(`¿Eliminar "${session.title}"? Se pierde su texto adaptado (el original se puede volver a cargar desde Cursos).`, { okLabel: 'Eliminar', danger: true }))) return;
            unit.sessions.splice(unit.sessions.indexOf(session), 1);
            save();
            m.close();
            toast('Conferencia eliminada');
            onDone?.();
          },
        }, '🗑 Eliminar'))),
    actions: [
      { label: 'Cancelar', class: 'btn-ghost' },
      {
        label: 'Guardar', class: 'btn-primary',
        onClick: () => {
          session.title = title.value.trim() || session.title;
          session.icon = data.icon;
          session.locked = data.locked;
          save();
          onDone?.();
          return true;
        },
      },
    ],
  });
}
