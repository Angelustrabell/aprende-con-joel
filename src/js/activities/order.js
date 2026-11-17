// Ordena: tocar (o arrastrar hacia arriba) las tarjetas en el orden correcto.
import { h, onResize } from '../core/dom.js';
import { renderCard, cardIsEmpty, cardKey } from '../core/card.js';
import { shuffleChanged } from '../core/util.js';
import { makeDraggable } from '../core/drag.js';
import { hintEls } from './common.js';

export default function mount(root, act, ctx) {
  const items = act.items.filter((c) => !cardIsEmpty(c)).map((c, i) => ({ c, i, key: cardKey(c) }));
  let next = 0;
  let finished = false;
  const disposers = [];

  const wrap = h('div', { class: 'act act-order' });
  const slotsRow = h('div', { class: 'order-slots' });
  const slots = items.map((_, i) => h('div', { class: 'order-slot' }, h('span', { class: 'slot-num' }, String(i + 1))));
  slotsRow.append(...slots);
  const pool = h('div', { class: 'order-pool' });
  wrap.append(slotsRow, pool);
  root.append(wrap);

  const pieces = shuffleChanged(items, (x) => x.key).map((x) => {
    const el = renderCard(x.c, { cls: 'order-piece' });
    el.dataset.order = String(x.i);
    pool.append(el);
    disposers.push(makeDraggable(el, {
      getTargets: () => [slotsRow],
      onTap: () => attempt(x, el),
      onDrop: () => attempt(x, el),
    }));
    return { x, el };
  });

  function attempt(x, el) {
    if (finished || el.classList.contains('used')) return false;
    if (x.key === items[next].key) {
      const slot = slots[next];
      slot.classList.add('filled');
      slot.append(renderCard(x.c, { cls: 'placed' }));
      el.classList.add('used');
      next++;
      ctx.say(x.c);
      ctx.correct(slot);
      if (next >= items.length) {
        finished = true;
        ctx.done();
      }
      return true;
    }
    ctx.wrong(el);
    return false;
  }

  disposers.push(onResize(wrap, (w, hgt) => {
    const n = Math.max(1, items.length);
    const gap = Math.min(w, hgt) * 0.03;
    const size = Math.min((w * 0.94 - gap * (n - 1)) / n, hgt * 0.36);
    wrap.style.setProperty('--sz', `${Math.floor(size)}px`);
    wrap.style.setProperty('--gap', `${Math.floor(gap)}px`);
  }));

  return {
    destroy: () => disposers.forEach((d) => d()),
    hint(level) {
      if (next >= items.length) return;
      const target = pieces.find((p) => !p.el.classList.contains('used') && p.x.key === items[next].key);
      hintEls([target?.el, slots[next]], level);
    },
  };
}
