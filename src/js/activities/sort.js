// Clasifica: arrastrar cada cosa a su cesta (o tocarla y luego tocar la cesta).
import { h, onResize } from '../core/dom.js';
import { renderCard, cardIsEmpty } from '../core/card.js';
import { shuffle } from '../core/util.js';
import { makeDraggable } from '../core/drag.js';
import { hintEls } from './common.js';

export default function mount(root, act, ctx) {
  const groups = act.groups.filter((g) => !cardIsEmpty(g.label)).slice(0, 3);
  const items = shuffle(groups.flatMap((g, gi) => g.items.filter((c) => !cardIsEmpty(c)).map((c) => ({ c, gi }))));
  let placed = 0;
  let selected = null;
  let finished = false;
  const disposers = [];

  const wrap = h('div', { class: 'act act-sort' });
  const basketsRow = h('div', { class: 'baskets' });
  const baskets = groups.map((g, gi) => {
    const zone = h('div', { class: 'basket-zone' });
    const b = h('div', { class: 'basket' }, renderCard(g.label, { cls: 'basket-label' }), zone);
    b.dataset.group = String(gi);
    b.addEventListener('click', () => {
      if (selected) tryPlace(selected, b);
      else ctx.say(g.label);
    });
    basketsRow.append(b);
    return { b, zone };
  });
  const tray = h('div', { class: 'sort-tray' });
  wrap.append(basketsRow, tray);
  root.append(wrap);

  const pieces = items.map((it) => {
    const el = renderCard(it.c, { cls: 'sort-item', caption: false });
    el.dataset.group = String(it.gi);
    tray.append(el);
    disposers.push(makeDraggable(el, {
      getTargets: () => baskets.map((x) => x.b),
      onStart: () => select(el, it, false),
      onTap: () => select(el, it, true),
      onDrop: (_el, target) => tryPlace({ el, it }, target),
    }));
    return { el, it };
  });

  function select(el, it, speakIt) {
    if (finished || el.classList.contains('used')) return;
    pieces.forEach((p) => p.el.classList.remove('selected'));
    el.classList.add('selected');
    selected = { el, it };
    if (speakIt) ctx.say(it.c);
  }

  function tryPlace(sel, basketEl) {
    const { el, it } = sel;
    if (finished || el.classList.contains('used')) return false;
    el.classList.remove('selected');
    selected = null;
    if (basketEl.dataset.group === String(it.gi)) {
      el.classList.add('used');
      baskets[it.gi].zone.append(renderCard(it.c, { caption: false, cls: 'in-basket' }));
      placed++;
      ctx.say(it.c);
      ctx.correct(basketEl);
      if (placed >= items.length) {
        finished = true;
        ctx.done();
      }
      return true;
    }
    ctx.wrong(basketEl);
    return false;
  }

  disposers.push(onResize(wrap, (w, hgt) => {
    const nb = Math.max(1, groups.length);
    const bw = (w * 0.94) / nb - w * 0.02;
    wrap.style.setProperty('--bw', `${Math.floor(bw)}px`);
    wrap.style.setProperty('--bh', `${Math.floor(hgt * 0.52)}px`);
    wrap.style.setProperty('--lab', `${Math.floor(Math.min(hgt * 0.2, bw * 0.45))}px`);
    const n = Math.max(1, items.length);
    const isz = Math.min((w * 0.94) / Math.min(n, 8) - 10, hgt * 0.22);
    wrap.style.setProperty('--isz', `${Math.floor(isz)}px`);
    wrap.style.setProperty('--mini', `${Math.floor(Math.min(hgt * 0.12, bw / 4.5))}px`);
  }));

  return {
    destroy: () => disposers.forEach((d) => d()),
    hint(level) {
      const p = selected || pieces.find((x) => !x.el.classList.contains('used'));
      if (!p) return;
      hintEls([p.el, baskets[p.it.gi].b], level);
    },
  };
}
