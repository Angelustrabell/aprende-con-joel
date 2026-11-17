// Teclado numérico para el PIN.
import { h, animateClass } from '../core/dom.js';
import { sfx } from '../core/sfx.js';

export function pinPad({ title, subtitle = '', onComplete, onCancel, cancelLabel = 'Cancelar', extra = null }) {
  let value = '';
  let busy = false;
  const dots = h('div', { class: 'pin-dots' }, ...[0, 1, 2, 3].map(() => h('span')));
  const msg = h('div', { class: 'pin-msg' }, subtitle);
  const titleEl = h('div', { class: 'pin-title' }, title);

  const key = (label, fn, cls = '') => {
    const b = h('button', { class: `pin-key ${cls}`, type: 'button' }, label);
    b.addEventListener('click', () => { sfx.tap(); fn(); });
    return b;
  };
  const pad = h('div', { class: 'pin-pad' },
    ...['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => key(d, () => press(d))),
    onCancel ? key('✖', () => onCancel(), 'muted') : h('span'),
    key('0', () => press('0')),
    key('⌫', () => press('back'), 'muted'),
  );
  const box = h('div', { class: 'pin-box' }, titleEl, msg, dots, pad,
    onCancel ? h('button', { class: 'link-btn', type: 'button', onclick: () => onCancel() }, cancelLabel) : null,
    extra);

  function renderDots() {
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i < value.length));
  }

  async function press(k) {
    if (busy) return;
    if (k === 'back') value = value.slice(0, -1);
    else if (value.length < 4) value += k;
    renderDots();
    if (value.length === 4) {
      busy = true;
      const ok = await onComplete(value);
      busy = false;
      if (!ok) {
        animateClass(box, 'shake');
        value = '';
        renderDots();
      }
    }
  }

  const onKey = (e) => {
    if (!box.isConnected) return;
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('back');
  };
  document.addEventListener('keydown', onKey);

  return {
    el: box,
    setMessage(text) { msg.textContent = text; },
    setTitle(text) { titleEl.textContent = text; },
    reset() { value = ''; renderDots(); },
    destroy() { document.removeEventListener('keydown', onKey); },
  };
}
