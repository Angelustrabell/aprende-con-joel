// Memoria: cartas boca abajo, encontrar las parejas.
import { h } from '../core/dom.js';
import { renderCard, cardIsEmpty } from '../core/card.js';
import { shuffle } from '../core/util.js';
import { sfx } from '../core/sfx.js';
import { autoGrid, later, clearTimers } from './common.js';

export default function mount(root, act, ctx) {
  const timers = [];
  const deck = [];
  act.pairs.filter((p) => !cardIsEmpty(p.a)).slice(0, 8).forEach((p, pi) => {
    deck.push({ pi, c: p.a });
    deck.push({ pi, c: p.b && !cardIsEmpty(p.b) ? p.b : p.a });
  });
  const totalPairs = deck.length / 2;
  let first = null;
  let lock = false;
  let matched = 0;
  let mismatches = 0;
  let finished = false;

  const wrap = h('div', { class: 'act act-memory' });
  const grid = h('div', { class: 'opt-grid mem-grid' });
  const cards = shuffle(deck).map((d) => {
    const el = h('button', { class: 'mem-card', type: 'button' },
      h('div', { class: 'mem-inner' },
        h('div', { class: 'mem-back' }, h('span', '⭐')),
        h('div', { class: 'mem-front' }, renderCard(d.c, { caption: true })),
      ));
    const item = { ...d, el };
    el.dataset.pair = String(d.pi);
    el.addEventListener('click', () => flip(item));
    return item;
  });
  grid.append(...cards.map((c) => c.el));
  wrap.append(grid);
  root.append(wrap);
  const stopGrid = autoGrid(grid, cards.length, { maxFrac: 0.48, gap: 0.03 });

  function flip(item) {
    if (finished || lock || item.el.classList.contains('flipped')) return;
    item.el.classList.add('flipped');
    sfx.flip();
    ctx.say(item.c);
    if (!first) {
      first = item;
      return;
    }
    const a = first;
    first = null;
    if (a.pi === item.pi) {
      a.el.classList.add('matched');
      item.el.classList.add('matched');
      matched++;
      ctx.correct(item.el);
      if (matched >= totalPairs) {
        finished = true;
        ctx.done();
      }
    } else {
      lock = true;
      mismatches++;
      // Equivocarse es parte del juego: solo cuenta como error si pasa de lo normal.
      if (mismatches > totalPairs) ctx.wrong(null, { quiet: true });
      later(() => {
        a.el.classList.remove('flipped');
        item.el.classList.remove('flipped');
        lock = false;
      }, 1150, timers);
    }
  }

  function peek(ms) {
    if (lock || finished) return;
    lock = true;
    const hidden = cards.filter((c) => !c.el.classList.contains('flipped'));
    hidden.forEach((c) => c.el.classList.add('flipped', 'peek'));
    later(() => {
      hidden.forEach((c) => c.el.classList.remove('flipped', 'peek'));
      lock = false;
    }, ms, timers);
  }

  return {
    destroy() { stopGrid(); clearTimers(timers); },
    hint(level) { peek(level >= 2 ? 2000 : 1200); },
  };
}
