// Ventanas emergentes, confirmaciones y avisos.
import { h } from './dom.js';

const stack = [];

export function openModal({ title, content, actions = [], wide = false, kid = false, onClose, dismissable = true } = {}) {
  const root = document.getElementById('modal-root');
  const box = h('div', { class: `modal ${wide ? 'wide' : ''} ${kid ? 'kid-modal' : ''}` },
    title ? h('div', { class: 'modal-title' }, title) : null,
    h('div', { class: 'modal-body' }, content),
  );
  const footer = h('div', { class: 'modal-actions' });
  const overlay = h('div', { class: 'modal-overlay' }, box);
  let closed = false;

  const api = {
    el: box,
    body: box.querySelector('.modal-body'),
    close(result) {
      if (closed) return;
      closed = true;
      overlay.classList.add('closing');
      setTimeout(() => overlay.remove(), 150);
      const i = stack.indexOf(api);
      if (i >= 0) stack.splice(i, 1);
      onClose?.(result);
    },
    setActions(list) {
      footer.replaceChildren();
      for (const a of list) {
        footer.append(h('button', {
          class: `btn ${a.class || ''}`,
          disabled: a.disabled,
          onclick: async () => {
            const r = await a.onClick?.(api);
            if (r !== false) api.close(a.value);
          },
        }, a.label));
      }
      if (list.length && !footer.isConnected) box.append(footer);
    },
  };
  api.setActions(actions);
  if (dismissable) {
    overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) api.close(); });
  }
  root.append(overlay);
  stack.push(api);
  setTimeout(() => box.querySelector('input:not([type=checkbox]):not([type=radio]), textarea')?.focus(), 50);
  return api;
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && stack.length) {
    const top = stack[stack.length - 1];
    top.close();
  }
});

export function closeAllModals() {
  for (const m of stack.slice()) m.close();
}

export function confirmDialog(message, { okLabel = 'Sí', cancelLabel = 'Cancelar', danger = false, title = '' } = {}) {
  return new Promise((resolve) => {
    let result = false;
    openModal({
      title,
      content: h('p', { class: 'confirm-text' }, message),
      actions: [
        { label: cancelLabel, class: 'btn-ghost', onClick: () => { result = false; } },
        { label: okLabel, class: danger ? 'btn-danger' : 'btn-primary', onClick: () => { result = true; } },
      ],
      onClose: () => resolve(result),
    });
  });
}

export function alertDialog(message, title = '') {
  return new Promise((resolve) => {
    openModal({ title, content: h('p', { class: 'confirm-text' }, message), actions: [{ label: 'Entendido', class: 'btn-primary' }], onClose: resolve });
  });
}

export function promptDialog(title, { value = '', placeholder = '', okLabel = 'Aceptar', multiline = false } = {}) {
  return new Promise((resolve) => {
    let result = null;
    const input = multiline
      ? h('textarea', { class: 'input', rows: 5, placeholder, value })
      : h('input', { class: 'input', type: 'text', placeholder, value });
    const m = openModal({
      title,
      content: input,
      actions: [
        { label: 'Cancelar', class: 'btn-ghost' },
        { label: okLabel, class: 'btn-primary', onClick: () => { result = input.value.trim(); } },
      ],
      onClose: () => resolve(result),
    });
    if (!multiline) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { result = input.value.trim(); m.close(); }
      });
    }
  });
}

export function toast(message, type = 'info', ms = 2600) {
  const root = document.getElementById('toast-root');
  const t = h('div', { class: `toast toast-${type}` }, message);
  root.append(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 400);
}

// Ventana de espera con mensaje (devuelve función para cerrarla).
export function busy(message) {
  const m = openModal({ content: h('div', { class: 'busy' }, h('div', { class: 'spinner' }), h('p', message)), dismissable: false });
  return () => m.close();
}
