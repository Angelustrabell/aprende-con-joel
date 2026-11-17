// Editor de un curso: unidades y sesiones, plantillas rápidas e IA.
import { h } from '../core/dom.js';
import { findCourse, save, store } from '../core/store.js';
import { go } from '../core/router.js';
import { clone, uid } from '../core/util.js';
import { confirmDialog, promptDialog, openModal, toast } from '../core/modal.js';
import { iconInput, colorChoice, toggle } from './widgets.js';
import { templatesDialog } from './templatesDialog.js';
import { aiDialog } from './aiDialog.js';

export const mode = 'parent';

function freshIds(session) {
  const s = clone(session);
  s.id = uid();
  for (const a of s.activities) a.id = uid();
  return s;
}

export function render(root, { courseId, focusUnit = null }) {
  const course = findCourse(courseId);
  if (!course) { go('parentHome'); return; }
  const unitsHost = h('div', { class: 'units' });

  const titleInput = h('input', { class: 'input input-title', value: course.title });
  titleInput.addEventListener('change', () => { course.title = titleInput.value.trim() || 'Curso'; save(); });

  const swap = (arr, i, j) => { [arr[i], arr[j]] = [arr[j], arr[i]]; save(); draw(); };

  function sessionRow(unit, s, i) {
    const n = s.activities.length;
    return h('div', { class: 'sess-row' },
      h('span', { class: 'sess-icon' }, s.icon || '⭐'),
      h('button', { class: 'sess-title link-like', type: 'button', onclick: () => go('sessionEditor', { sessionId: s.id }) }, s.title),
      h('span', { class: `badge ${n ? '' : 'warn'}` }, n ? `${n} actividades` : 'vacía'),
      s.locked ? h('span', { class: 'badge warn' }, '🔒 bloqueada') : null,
      h('div', { class: 'row-actions' },
        h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: s.locked ? 'Habilitar para Joel' : 'Bloquear para Joel', onclick: () => { s.locked = !s.locked; save(); draw(); } }, s.locked ? '🔒' : '🔓'),
        h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Probar', disabled: !n, onclick: () => go('player', { sessionId: s.id, preview: true, returnTo: { name: 'courseEditor', params: { courseId } } }) }, '▶'),
        h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Editar', onclick: () => go('sessionEditor', { sessionId: s.id }) }, '✏️'),
        h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Duplicar', onclick: () => { const c = freshIds(s); c.title += ' (copia)'; unit.sessions.splice(i + 1, 0, c); save(); draw(); } }, '⧉'),
        h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Subir', disabled: i === 0, onclick: () => swap(unit.sessions, i, i - 1) }, '↑'),
        h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Bajar', disabled: i === unit.sessions.length - 1, onclick: () => swap(unit.sessions, i, i + 1) }, '↓'),
        h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Mover a otra unidad', disabled: course.units.length < 2, onclick: () => moveSession(unit, i) }, '↔'),
        h('button', {
          class: 'btn btn-ghost btn-icon danger', type: 'button', title: 'Eliminar',
          onclick: async () => {
            if (!(await confirmDialog(`¿Eliminar la sesión "${s.title}" y sus ${n} actividades?`, { okLabel: 'Eliminar', danger: true }))) return;
            unit.sessions.splice(i, 1);
            save();
            draw();
          },
        }, '🗑'),
      ),
    );
  }

  function moveSession(unit, i) {
    const m = openModal({
      title: 'Mover a la unidad…',
      content: h('div', { class: 'list-pick' }, ...course.units.filter((u) => u !== unit).map((u) => h('button', {
        class: 'btn btn-ghost btn-block', type: 'button',
        onclick: () => {
          const [s] = unit.sessions.splice(i, 1);
          u.sessions.push(s);
          save();
          m.close();
          draw();
          toast(`Movida a "${u.title}"`);
        },
      }, `${u.icon || '📘'} ${u.title}`))),
      actions: [{ label: 'Cancelar', class: 'btn-ghost' }],
    });
  }

  async function newSession(unit) {
    const title = await promptDialog('Nombre de la sesión', { placeholder: 'Ej.: La letra M' });
    if (!title) return;
    const s = { id: uid(), title, icon: '⭐', activities: [] };
    unit.sessions.push(s);
    save();
    go('sessionEditor', { sessionId: s.id });
  }

  function draw() {
    unitsHost.replaceChildren();
    if (!course.units.length) {
      unitsHost.append(h('div', { class: 'empty' }, h('div', { class: 'empty-icon' }, '📘'),
        h('p', 'Este curso está vacío.'),
        h('p', { class: 'muted' }, 'Crea una unidad (por ejemplo "Letras") o usa una plantilla rápida para generar sesiones completas en segundos.')));
    }
    course.units.forEach((u, ui) => {
      const t = h('input', { class: 'input unit-title', value: u.title });
      t.addEventListener('change', () => { u.title = t.value.trim() || 'Unidad'; save(); });
      const box = h('section', { class: 'panel unit-box', id: `unit-${u.id}` },
        h('div', { class: 'unit-head' },
          iconInput(u.icon || '', (v) => { u.icon = v; save(); }),
          t,
          h('div', { class: 'row-actions' },
            h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Subir unidad', disabled: ui === 0, onclick: () => swap(course.units, ui, ui - 1) }, '↑'),
            h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Bajar unidad', disabled: ui === course.units.length - 1, onclick: () => swap(course.units, ui, ui + 1) }, '↓'),
            h('button', {
              class: 'btn btn-ghost btn-icon danger', type: 'button', title: 'Eliminar unidad',
              onclick: async () => {
                if (!(await confirmDialog(`¿Eliminar la unidad "${u.title}" con sus ${u.sessions.length} sesiones?`, { okLabel: 'Eliminar', danger: true }))) return;
                course.units.splice(ui, 1);
                save();
                draw();
              },
            }, '🗑'),
          ),
        ),
        h('div', { class: 'sess-list' }, ...u.sessions.map((s, i) => sessionRow(u, s, i))),
        h('div', { class: 'unit-foot' },
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => newSession(u) }, '＋ Nueva sesión'),
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => templatesDialog(course, u, draw) }, '⚡ Plantilla aquí'),
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => aiDialog(course, u, draw) }, '✨ IA aquí'),
        ),
      );
      unitsHost.append(box);
    });
  }

  async function newUnit() {
    const title = await promptDialog('Nombre de la unidad', { placeholder: 'Ej.: Letras, Números, Animales…' });
    if (!title) return;
    course.units.push({ id: uid(), title, icon: '📘', sessions: [] });
    save();
    draw();
  }

  root.append(h('div', { class: 'p-page' },
    h('header', { class: 'p-header' },
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => go('parentHome', { tab: 'courses' }) }, '← Cursos'),
      h('div', { class: 'p-title' }, 'Editar curso'),
      h('div', { class: 'p-actions' },
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => templatesDialog(course, null, draw) }, '⚡ Plantilla rápida'),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => aiDialog(course, null, draw) }, '✨ Crear con IA'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: newUnit }, '＋ Nueva unidad')),
    ),
    h('main', { class: 'p-main' },
      h('div', { class: 'panel course-head' },
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Icono'), iconInput(course.icon || '', (v) => { course.icon = v; save(); })),
        h('div', { class: 'field grow' }, h('span', { class: 'field-label' }, 'Título'), titleInput),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Color'), colorChoice(course.color || '#6c4cf5', (c) => { course.color = c; save(); })),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Visible para el alumno'), toggle(course.visible !== false, (v) => { course.visible = v; save(); })),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Abrir en cualquier orden'), toggle(!!course.freeOrder, (v) => { course.freeOrder = v; save(); })),
      ),
      unitsHost,
    ),
  ));
  draw();
  if (focusUnit) setTimeout(() => document.getElementById(`unit-${focusUnit}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  void store;
}
