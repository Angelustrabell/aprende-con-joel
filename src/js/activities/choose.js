// Toca la correcta (una o varias correctas). Opcionalmente muestra una tarjeta arriba.
import { h } from '../core/dom.js';
import { renderCard, cardIsEmpty } from '../core/card.js';
import { shuffle } from '../core/util.js';
import { autoGrid, optionCard, hintEls } from './common.js';

export default function mount(root, act, ctx) {
  const items = act.options
    .map((c, i) => ({ c, i, correct: (act.correct || []).includes(i) }))
    .filter((x) => !cardIsEmpty(x.c));
  const need = Math.max(1, items.filter((x) => x.correct).length);
  let found = 0;
  let finished = false;

  const wrap = h('div', { class: 'act act-choose' });
  if (act.target && !cardIsEmpty(act.target)) {
    wrap.classList.add('has-target');
    const t = renderCard(act.target, { cls: 'target', tag: 'button', attrs: { type: 'button' } });
    t.addEventListener('click', () => ctx.say(act.target));
    wrap.append(h('div', { class: 'target-row' }, t));
  }

  const grid = h('div', { class: 'opt-grid' });
  const els = shuffle(items).map((x) => {
    const el = optionCard(x.c, { onTap: () => tap(x, el) });
    if (x.correct) el.dataset.correct = '1';
    return el;
  });
  grid.append(...els);
  wrap.append(grid);

  let counter = null;
  if (need > 1) {
    counter = h('div', { class: 'found-counter' }, ...Array.from({ length: need }, () => h('span', { class: 'dot' })));
    wrap.append(counter);
  }
  root.append(wrap);
  const stopGrid = autoGrid(grid, els.length);

  function tap(x, el) {
    if (finished || el.classList.contains('done') || el.classList.contains('gone')) return;
    if (x.correct) {
      el.classList.add('done');
      found++;
      counter?.children[found - 1]?.classList.add('on');
      ctx.say(x.c);
      ctx.correct(el);
      if (found >= need) {
        finished = true;
        ctx.done();
      }
    } else {
      el.classList.add('gone');
      ctx.wrong(el);
    }
  }

  return {
    destroy: stopGrid,
    hint(level) {
      hintEls(els.filter((e) => e.dataset.correct && !e.classList.contains('done')), level);
    },
  };
}
