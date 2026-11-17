// Cuenta: tocar para contar y elegir el número. También sumas (dos grupos) y restas (se van algunos).
import { h, onResize } from '../core/dom.js';
import { renderCard } from '../core/card.js';
import { shuffle, fitGrid, range } from '../core/util.js';
import { sfx } from '../core/sfx.js';
import { optionCard, hintEls, later, clearTimers } from './common.js';

function answerOptions(answer) {
  const near = range(Math.max(0, answer - 2), answer + 2).filter((x) => x !== answer);
  const picked = shuffle(near).slice(0, 2);
  return [answer, ...picked].sort((a, b) => a - b);
}

export default function mount(root, act, ctx) {
  const n = Math.max(1, Math.min(20, Number(act.number) || 1));
  const second = Math.max(0, Math.min(20, Number(act.second) || 0));
  const op = act.op || 'none';
  const answer = op === 'add' ? n + second : op === 'sub' ? Math.max(0, n - second) : n;
  const timers = [];
  let counted = 0;
  let finished = false;
  let removedDone = op !== 'sub';
  let autoCounting = false;

  const wrap = h('div', { class: `act act-count op-${op}` });
  const field = h('div', { class: 'count-field' });
  const groups = [];
  const makeGroup = (k) => {
    const g = h('div', { class: 'count-group' });
    const items = range(1, k).map(() => {
      const it = h('button', { class: 'count-item', type: 'button' }, renderCard(act.item, { caption: false, cls: 'count-card' }));
      it.addEventListener('click', () => countItem(it));
      g.append(it);
      return it;
    });
    groups.push({ g, items, k });
    return g;
  };
  field.append(makeGroup(n));
  if (op === 'add') {
    field.append(h('div', { class: 'op-sign' }, '+'));
    field.append(makeGroup(second));
  }
  if (op === 'sub') field.append(h('div', { class: 'op-sign minus' }, '−', h('span', { class: 'op-small' }, String(second))));

  const nums = h('div', { class: 'num-row' });
  const numEls = answerOptions(answer).map((v) => {
    const el = optionCard({ text: String(v), say: String(v) }, { onTap: () => choose(v, el), cls: 'num-opt' });
    if (v === answer) el.dataset.correct = '1';
    nums.append(el);
    return el;
  });
  wrap.append(field, nums);
  root.append(wrap);

  const allItems = () => groups.flatMap((g) => g.items).filter((it) => !it.classList.contains('removed'));

  function countItem(it) {
    if (finished || autoCounting || it.classList.contains('counted') || it.classList.contains('removed') || it.classList.contains('leaving')) return;
    counted++;
    it.classList.add('counted');
    it.append(h('span', { class: 'count-badge' }, String(counted)));
    sfx.pop(counted);
    ctx.speak(String(counted));
  }

  function resetCount() {
    counted = 0;
    for (const it of groups.flatMap((g) => g.items)) {
      it.classList.remove('counted');
      it.querySelector('.count-badge')?.remove();
    }
  }

  function choose(v, el) {
    if (finished || el.classList.contains('gone')) return;
    if (v === answer) {
      finished = true;
      el.classList.add('done');
      ctx.speak(String(v));
      ctx.correct(el);
      ctx.done();
    } else {
      el.classList.add('gone');
      ctx.wrong(el);
    }
  }

  // Resta: los últimos "second" elementos se van volando.
  function removeItems() {
    if (removedDone) return;
    removedDone = true;
    resetCount();
    const items = groups[0].items.slice(n - second);
    items.forEach((it, i) => {
      later(() => {
        it.classList.add('leaving');
        sfx.whoosh();
        later(() => { it.classList.remove('leaving'); it.classList.add('removed'); }, 650, timers);
      }, 300 + i * 350, timers);
    });
  }

  async function autoCount() {
    if (autoCounting || finished) return;
    autoCounting = true;
    resetCount();
    for (const it of allItems()) {
      if (finished || !it.isConnected) break;
      counted++;
      it.classList.add('counted');
      it.append(h('span', { class: 'count-badge' }, String(counted)));
      sfx.pop(counted);
      await ctx.speak(String(counted));
      await new Promise((r) => later(r, 120, timers));
    }
    autoCounting = false;
  }

  const stop = onResize(wrap, (w, hgt) => {
    const numSize = Math.min(hgt * 0.2, w / 5);
    wrap.style.setProperty('--num', `${Math.floor(numSize)}px`);
    const fieldH = hgt - numSize - hgt * 0.12;
    const signW = op === 'none' ? 0 : w * 0.12;
    const groupW = op === 'add' ? (w * 0.92 - signW) / 2 : w * 0.92 - signW;
    const pad = Math.min(w, hgt) * 0.02;
    for (const g of groups) {
      const innerW = groupW - pad * 2;
      const innerH = fieldH - pad * 2;
      const gap = Math.max(4, Math.min(innerW, innerH) * 0.03);
      const fit = fitGrid(innerW, innerH, Math.max(1, g.k), gap, 1, innerH * 0.45);
      g.g.style.setProperty('--isz', `${fit.size}px`);
      g.g.style.setProperty('--icols', String(fit.cols));
      g.g.style.setProperty('--igap', `${Math.floor(gap)}px`);
      g.g.style.padding = `${Math.floor(pad)}px`;
    }
  });

  return {
    destroy() { stop(); clearTimers(timers); },
    afterPrompt() { removeItems(); },
    hint(level) {
      if (level >= 2) hintEls(numEls.filter((e) => e.dataset.correct), level);
      else autoCount();
    },
  };
}
