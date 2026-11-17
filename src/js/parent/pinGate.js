// Entrada al modo papá (o para dar tiempo extra) con PIN.
import { h } from '../core/dom.js';
import { settings, getStudent, save } from '../core/store.js';
import { go } from '../core/router.js';
import { hashPin } from '../core/util.js';
import { grantBonus } from '../core/progress.js';
import { openModal, toast } from '../core/modal.js';
import { pinPad } from './pinPad.js';

export const mode = 'kid';
let failures = 0;
let lockedUntil = 0;

export function render(root, { next = 'parentHome' } = {}) {
  const forgot = h('button', { class: 'link-btn small', type: 'button' }, '¿Olvidaste el PIN?');
  const pad = pinPad({
    title: next === 'bonus' ? 'Dar 10 minutos más' : 'Modo papá',
    subtitle: 'Escribe tu PIN',
    onCancel: () => go('studentHome'),
    extra: forgot,
    onComplete: async (pin) => {
      if (Date.now() < lockedUntil) {
        pad.setMessage(`Espera ${Math.ceil((lockedUntil - Date.now()) / 1000)} segundos`);
        return false;
      }
      if ((await hashPin(pin)) === settings().pinHash) {
        failures = 0;
        if (next === 'bonus') {
          grantBonus(getStudent().id, 10);
          toast('⏱ +10 minutos para hoy', 'ok');
          go('studentHome');
        } else {
          go('parentHome');
        }
        return true;
      }
      failures++;
      if (failures >= 3) {
        lockedUntil = Date.now() + 30000;
        failures = 0;
        pad.setMessage('Demasiados intentos. Espera 30 segundos.');
      } else {
        pad.setMessage('PIN incorrecto');
      }
      return false;
    },
  });

  forgot.addEventListener('click', () => resetPinDialog());

  root.append(h('div', { class: 'kid-page pin-page' }, pad.el));
  return () => pad.destroy();
}

// Restablecer el PIN: un reto que un niño de 5 años no puede resolver.
function resetPinDialog() {
  const a = 12 + Math.floor(Math.random() * 30);
  const b = 13 + Math.floor(Math.random() * 30);
  const word = h('input', { class: 'input', placeholder: 'Escribe BORRAR PIN' });
  const sum = h('input', { class: 'input', placeholder: `¿Cuánto es ${a} × ${b}?`, inputmode: 'numeric' });
  const err = h('p', { class: 'form-error' });
  openModal({
    title: 'Restablecer PIN',
    content: h('div', { class: 'form-col' },
      h('p', 'Para crear un PIN nuevo, escribe la frase y resuelve la multiplicación.'),
      word, sum, err),
    actions: [
      { label: 'Cancelar', class: 'btn-ghost' },
      {
        label: 'Restablecer', class: 'btn-danger',
        onClick: () => {
          if (word.value.trim().toUpperCase() !== 'BORRAR PIN' || Number(sum.value) !== a * b) {
            err.textContent = 'No es correcto.';
            return false;
          }
          settings().pinHash = '';
          save();
          go('onboarding', { onlyPin: true });
          return true;
        },
      },
    ],
  });
}
