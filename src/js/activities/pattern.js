// Patrones: ¿qué viene después?
import { h, onResize } from '../core/dom.js';
import { renderCard, cardIsEmpty, cardKey } from '../core/card.js';
import { shuffle } from '../core/util.js';
import { optionCard, questionSlot, hintEls } from './common.js';

export default function mount(root, act, ctx) {
  const seq = act.sequence.filter((c) => !cardIsEmpty(c));
  const answer = seq[seq.length - 1];
  const shown = seq.slice(0, -1);
  let finished = false;
  let speaking = false;

  // Opciones: lo que aparece en la serie + distractores extra (máximo 4, siempre con la respuesta).
  const uniq = new Map();
  for (const c of [...seq, ...(act.extra || []).filter((c) => !cardIsEmpty(c))]) if (!uniq.has(cardKey(c))) uniq.set(cardKey(c), c);
  let options = [...uniq.values()];
  if (options.length > 4) {
    const rest = shuffle(options.filter((c) => cardKey(c) !== cardKey(answer))).slice(0, 3);
    options = [answer, ...rest];
  }
  options = shuffle(options);

  const wrap = h('div', { class: 'act act-pattern' });
  const row = h('div', { class: 'pattern-row' });
  const shownEls = shown.map((c) => renderCard(c, { caption: false, cls: 'pat-item' }));
  const slot = questionSlot();
  slot.classList.add('pat-item');
  row.append(...shownEls, slot);
  const opts = h('div', { class: 'pattern-options' });
  const optEls = options.map((c) => {
    const el = optionCard(c, { caption: false, onTap: () => choose(c, el) });
    if (cardKey(c) === cardKey(answer)) el.dataset.correct = '1';
    opts.append(el);
    return el;
  });
  wrap.append(row, opts);
  root.append(wrap);

  function choose(c, el) {
    if (finished || el.classList.contains('gone')) return;
    if (cardKey(c) === cardKey(answer)) {
      finished = true;
      slot.replaceChildren(...renderCard(answer, { caption: false }).childNodes);
      slot.classList.add('filled');
      if (answer.color) { slot.classList.add('has-color'); slot.style.setProperty('--card-color', answer.color); }
      el.classList.add('done');
      ctx.say(answer);
      ctx.correct(slot);
      ctx.done();
    } else {
      el.classList.add('gone');
      ctx.wrong(el);
    }
  }

  async function chant() {
    if (speaking) return;
    speaking = true;
    for (const el of shownEls) {
      if (finished || !el.isConnected) break;
      el.classList.add('chant');
      const c = shown[shownEls.indexOf(el)];
      await ctx.say(c);
      el.classList.remove('chant');
    }
    slot.classList.add('chant');
    setTimeout(() => slot.classList.remove('chant'), 700);
    speaking = false;
  }

  const stop = onResize(wrap, (w, hgt) => {
    const n = seq.length;
    const gap = Math.min(w, hgt) * 0.02;
    const size = Math.min((w * 0.95 - gap * (n - 1)) / n, hgt * 0.3);
    wrap.style.setProperty('--sz', `${Math.floor(size)}px`);
    wrap.style.setProperty('--osz', `${Math.floor(Math.min(hgt * 0.3, (w * 0.8) / Math.max(3, options.length)))}px`);
    wrap.style.setProperty('--gap', `${Math.floor(gap)}px`);
  });

  return {
    destroy: stop,
    hint(level) {
      if (level >= 2) hintEls(optEls.filter((e) => e.dataset.correct), level);
      else chant();
    },
  };
}
