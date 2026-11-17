// Editor de una sesión: lista de actividades.
import { h } from '../core/dom.js';
import { findSession, save } from '../core/store.js';
import { go } from '../core/router.js';
import { clone, uid } from '../core/util.js';
import { cardThumb } from '../core/card.js';
import { confirmDialog, openModal, toast } from '../core/modal.js';
import { ACTIVITY_TYPES, TYPE_ORDER, activitySummary, activityCards, validateActivity } from '../data/activityTypes.js';
import { iconInput, toggle } from './widgets.js';

export const mode = 'parent';

export function typePicker(onPick) {
  const m = openModal({
    title: '¿Qué tipo de actividad?',
    wide: true,
    content: h('div', { class: 'type-grid' }, ...TYPE_ORDER.map((t) => {
      const T = ACTIVITY_TYPES[t];
      const b = h('button', { class: 'type-tile', type: 'button' }, h('span', { class: 'tt-icon' }, T.icon), h('b', T.name), h('small', T.desc));
      b.addEventListener('click', () => { m.close(); onPick(t); });
      return b;
    })),
    actions: [{ label: 'Cancelar', class: 'btn-ghost' }],
  });
}

export function render(root, { sessionId }) {
  const found = findSession(sessionId);
  if (!found) { go('parentHome'); return; }
  const { course, unit, session } = found;
  const list = h('div', { class: 'act-list' });

  const titleInput = h('input', { class: 'input input-title', value: session.title });
  titleInput.addEventListener('change', () => { session.title = titleInput.value.trim() || 'Sesión'; save(); });

  const draw = () => {
    list.replaceChildren();
    if (!session.activities.length) {
      list.append(h('div', { class: 'empty' }, h('div', { class: 'empty-icon' }, '🧩'), h('p', 'Esta sesión aún no tiene actividades.'), h('p', { class: 'muted' }, 'Una buena sesión para 5 años tiene de 4 a 8 actividades (5–10 minutos).')));
    }
    session.activities.forEach((a, i) => {
      const T = ACTIVITY_TYPES[a.type] || { icon: '❔', name: a.type };
      const err = validateActivity(a);
      const row = h('div', { class: `act-row ${err ? 'invalid' : ''}` },
        h('span', { class: 'act-num' }, String(i + 1)),
        h('span', { class: 'act-type' }, T.icon),
        h('div', { class: 'act-info' },
          h('b', T.name),
          h('div', { class: 'muted small' }, a.prompt?.say ? `«${a.prompt.say}»` : ''),
          h('div', { class: 'small' }, err ? `⚠️ ${err}` : activitySummary(a))),
        h('div', { class: 'act-thumbs' }, ...activityCards(a).slice(0, 4).map((c) => cardThumb(c, 40))),
        h('div', { class: 'row-actions' },
          h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Probar esta actividad', onclick: () => go('player', { single: a.id, preview: true, returnTo: { name: 'sessionEditor', params: { sessionId } } }) }, '▶'),
          h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Editar', onclick: () => go('activityEditor', { sessionId, activityId: a.id }) }, '✏️'),
          h('button', {
            class: 'btn btn-ghost btn-icon', type: 'button', title: 'Duplicar',
            onclick: () => { const c = clone(a); c.id = uid(); session.activities.splice(i + 1, 0, c); save(); draw(); },
          }, '⧉'),
          h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Subir', disabled: i === 0, onclick: () => { [session.activities[i - 1], session.activities[i]] = [session.activities[i], session.activities[i - 1]]; save(); draw(); } }, '↑'),
          h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Bajar', disabled: i === session.activities.length - 1, onclick: () => { [session.activities[i + 1], session.activities[i]] = [session.activities[i], session.activities[i + 1]]; save(); draw(); } }, '↓'),
          h('button', {
            class: 'btn btn-ghost btn-icon danger', type: 'button', title: 'Eliminar',
            onclick: async () => {
              if (!(await confirmDialog(`¿Eliminar la actividad ${i + 1} (${T.name})?`, { okLabel: 'Eliminar', danger: true }))) return;
              session.activities.splice(i, 1);
              save();
              draw();
              toast('Actividad eliminada');
            },
          }, '🗑'),
        ),
      );
      row.addEventListener('dblclick', () => go('activityEditor', { sessionId, activityId: a.id }));
      list.append(row);
    });
  };
  draw();

  root.append(h('div', { class: 'p-page' },
    h('header', { class: 'p-header' },
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => go('courseEditor', { courseId: course.id }) }, `← ${course.title}`),
      h('div', { class: 'p-title' }, h('small', { class: 'muted' }, `${unit.title} › `), 'Sesión'),
      h('div', { class: 'p-actions' },
        h('button', {
          class: 'btn btn-primary', type: 'button', disabled: !session.activities.length,
          onclick: () => go('player', { sessionId, preview: true, returnTo: { name: 'sessionEditor', params: { sessionId } } }),
        }, '▶ Probar sesión completa')),
    ),
    h('main', { class: 'p-main' },
      h('div', { class: 'panel session-head' },
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Icono'), iconInput(session.icon || '', (v) => { session.icon = v; save(); })),
        h('div', { class: 'field grow' }, h('span', { class: 'field-label' }, 'Título de la sesión'), titleInput),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Bloqueada para Joel 🔒'), toggle(!!session.locked, (v) => { session.locked = v; save(); })),
      ),
      h('div', { class: 'section-head' },
        h('h2', `Actividades (${session.activities.length})`),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => typePicker((t) => go('activityEditor', { sessionId, newType: t })) }, '＋ Añadir actividad')),
      list,
      h('p', { class: 'muted small' }, 'Consejo: doble clic en una actividad para editarla. Las actividades con ⚠️ se saltan hasta que las completes.'),
    ),
  ));
}
