// Escucha y elige: suena algo y hay que tocar la tarjeta correspondiente.
import { h } from '../core/dom.js';
import { cardIsEmpty } from '../core/card.js';
import { shuffle } from '../core/util.js';
import { autoGrid, optionCard, hintEls } from './common.js';

export default function mount(root, act, ctx) {
  const items = act.options.map((c, i) => ({ c, i, correct: i === act.correct })).filter((x) => !cardIsEmpty(x.c));
  const target = act.options[act.correct];
  const sound = act.sound && (act.sound.audio || act.sound.say) ? act.sound : target;
  let finished = false;

  const wrap = h('div', { class: 'act act-listen' });
  const speaker = h('button', { class: 'big-speaker', type: 'button', 'aria-label': 'Escuchar' }, h('span', '🔊'));
  speaker.addEventListener('click', () => play());
  wrap.append(h('div', { class: 'speaker-row' }, speaker));

  const grid = h('div', { class: 'opt-grid' });
  const els = shuffle(items).map((x) => {
    const el = optionCard(x.c, { onTap: () => tap(x, el) });
    if (x.correct) el.dataset.correct = '1';
    return el;
  });
  grid.append(...els);
  wrap.append(grid);
  root.append(wrap);
  const stopGrid = autoGrid(grid, els.length);

  async function play() {
    speaker.classList.add('playing');
    await ctx.say(sound);
    speaker.classList.remove('playing');
  }

  function tap(x, el) {
    if (finished || el.classList.contains('gone')) return;
    if (x.correct) {
      finished = true;
      el.classList.add('done');
      ctx.say(x.c);
      ctx.correct(el);
      ctx.done();
    } else {
      el.classList.add('gone');
      ctx.wrong(el);
      setTimeout(() => { if (!finished) play(); }, 1600);
    }
  }

  return {
    destroy: stopGrid,
    afterPrompt: () => play(),
    replay: () => play(),
    hint(level) { hintEls(els.filter((e) => e.dataset.correct), level); },
  };
}
