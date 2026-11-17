// Cofre del tesoro: se toca para abrir y trae estrellas, una pegatina nueva o XP.
import { h } from '../core/dom.js';
import { openChest, getGame } from '../core/game.js';
import { speak } from '../core/speech.js';
import { sfx } from '../core/sfx.js';
import { burstAt } from '../core/fx.js';
import { sleep } from '../core/util.js';

// Muestra el cofre encima de la pantalla. onClose(prize|null) se llama al cerrar.
export function chestOverlay(root, st, onClose) {
  const g = getGame(st);
  if (g.chests <= 0) { onClose?.(null); return; }
  let prize = null;
  let opened = false;

  const box = h('div', { class: 'chest-box' });
  const chest = h('button', { class: 'chest-big', type: 'button', 'aria-label': 'Abrir cofre' }, '🎁');
  const label = h('div', { class: 'chest-label' }, '¡Toca el cofre!');
  const close = h('button', { class: 'kbtn green chest-close hidden', type: 'button' }, '✔');
  box.append(chest, label, close);
  const overlay = h('div', { class: 'chest-overlay' }, box);
  root.append(overlay);
  speak('¡Tienes un cofre! Tócalo para abrirlo.');

  chest.addEventListener('click', async () => {
    if (opened) return;
    opened = true;
    sfx.unlock();
    chest.classList.add('shake-open');
    await sleep(700);
    prize = openChest(st);
    chest.textContent = prize?.kind === 'sticker' ? prize.sticker.e : prize?.kind === 'xp' ? '✨' : '⭐';
    chest.classList.remove('shake-open');
    chest.classList.add('opened');
    burstAt(chest, ['🎉', '⭐', '✨', '💎'], 16);
    sfx.win();
    const text = prize?.kind === 'sticker' ? `¡Una pegatina nueva: ${prize.sticker.n}!`
      : prize?.kind === 'xp' ? '¡Más 30 puntos de experiencia!'
        : `¡${prize?.n} estrellas!`;
    label.textContent = prize?.kind === 'sticker' ? `¡Pegatina: ${prize.sticker.n}!` : prize?.kind === 'xp' ? '¡+30 XP!' : `¡+${prize?.n} ⭐!`;
    close.classList.remove('hidden');
    speak(text);
  });
  close.addEventListener('click', () => {
    sfx.tap();
    overlay.remove();
    onClose?.(prize);
  });
}
