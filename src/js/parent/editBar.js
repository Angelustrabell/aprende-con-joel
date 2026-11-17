// Barra del modo edición: se ve sobre las pantallas de Joel para saber que estás editando.
import { h } from '../core/dom.js';
import { editState } from '../core/store.js';
import { go } from '../core/router.js';

export function editBar(screen) {
  return h('div', { class: 'edit-bar' },
    h('b', '✏️ MODO EDICIÓN'),
    screen !== 'studentHome' ? h('button', { type: 'button', onclick: () => go('studentHome') }, '🏠 Inicio') : null,
    h('button', { type: 'button', onclick: () => go('parentHome') }, '🛠 Panel de papá'),
    h('button', {
      class: 'primary', type: 'button',
      onclick: () => { editState.on = false; go('studentHome'); },
    }, '▶ Salir al modo Joel'));
}
