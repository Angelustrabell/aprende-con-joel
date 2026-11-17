// Arrastra y une: fichas arriba, parejas abajo. También funciona tocando una y luego la otra.
import { h, onResize } from '../core/dom.js';
import { renderCard, cardIsEmpty } from '../core/card.js';
import { shuffle, shuffleChanged } from '../core/util.js';
import { makeDraggable } from '../core/drag.js';
import { hintEls } from './common.js';

export default function mount(root, act, ctx) {
  const pairs = act.pairs.filter((p) => !cardIsEmpty(p.a) && !cardIsEmpty(p.b)).map((p, i) => ({ ...p, i }));
  let matched = 0;
  let selected = null;
  let finished = false;
  const disposers = [];

  const wrap = h('div', { class: 'act act-match' });
  const topRow = h('div', { class: 'match-row top' });
  const bottomRow = h('div', { class: 'match-row bottom' });
  wrap.append(topRow, h('div', { class: 'match-hint-arrow' }, '⬇️'), bottomRow);
  root.append(wrap);

  // Abajo, siempre en distinto orden que arriba (si no, bastaría arrastrar en vertical).
  const topOrder = shuffle(pairs);
  const bottomOrder = shuffleChanged(topOrder, (p) => p.i);

  const targets = bottomOrder.map((p) => {
    const el = renderCard(p.b, { cls: 'match-target', tag: 'button', attrs: { type: 'button' } });
    el.dataset.pair = String(p.i);
    el.addEventListener('click', () => {
      if (el.classList.contains('matched')) { ctx.say(p.b); return; }
      if (selected) tryMatch(selected, el);
      else ctx.say(p.b);
    });
    bottomRow.append(el);
    return el;
  });

  const pieces = topOrder.map((p) => {
    const el = renderCard(p.a, { cls: 'match-piece' });
    el.dataset.pair = String(p.i);
    topRow.append(el);
    disposers.push(makeDraggable(el, {
      getTargets: () => targets.filter((t) => !t.classList.contains('matched')),
      onStart: () => select(el, false),
      onTap: () => select(el, true),
      onDrop: (_el, target) => tryMatch(el, target),
    }));
    return el;
  });

  function select(el, speakIt) {
    if (finished || el.classList.contains('used')) return;
    pieces.forEach((p) => p.classList.remove('selected'));
    selected = el;
    el.classList.add('selected');
    if (speakIt) ctx.say(pairs.find((p) => String(p.i) === el.dataset.pair).a);
  }

  function tryMatch(piece, target) {
    if (finished || piece.classList.contains('used')) return false;
    const pair = pairs.find((p) => String(p.i) === piece.dataset.pair);
    if (target.dataset.pair === piece.dataset.pair) {
      piece.classList.add('used');
      piece.classList.remove('selected');
      target.classList.add('matched');
      target.append(renderCard(pair.a, { caption: false, cls: 'docked' }));
      selected = null;
      matched++;
      ctx.say(pair.b);
      ctx.correct(target);
      if (matched >= pairs.length) {
        finished = true;
        ctx.done();
      }
      return true;
    }
    ctx.wrong(target);
    piece.classList.remove('selected');
    selected = null;
    return false;
  }

  disposers.push(onResize(wrap, (w, hgt) => {
    const n = Math.max(1, pairs.length);
    const gap = Math.min(w, hgt) * 0.04;
    const size = Math.min((w * 0.94 - gap * (n - 1)) / n, hgt * 0.36);
    wrap.style.setProperty('--sz', `${Math.floor(size)}px`);
    wrap.style.setProperty('--gap', `${Math.floor(gap)}px`);
  }));

  return {
    destroy: () => disposers.forEach((d) => d()),
    hint(level) {
      const piece = selected || pieces.find((p) => !p.classList.contains('used'));
      if (!piece) return;
      const target = targets.find((t) => t.dataset.pair === piece.dataset.pair);
      hintEls([piece, target], level);
    },
  };
}
