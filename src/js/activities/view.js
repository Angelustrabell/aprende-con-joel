// Lámina o video: presentar algo nuevo. No se puntúa.
import { h } from '../core/dom.js';
import { renderCard, cardIsEmpty } from '../core/card.js';
import { mediaUrl } from '../core/media.js';
import { later, clearTimers, ARROW_SVG } from './common.js';

export default function mount(root, act, ctx) {
  const timers = [];
  let finished = false;
  const wrap = h('div', { class: 'act act-view' });
  const stage = h('div', { class: 'view-stage' });
  let video = null;

  if (act.video) {
    video = h('video', { class: 'view-video', src: mediaUrl(act.video), playsinline: true, preload: 'auto' });
    const playBtn = h('button', { class: 'video-play', type: 'button' }, '▶');
    const toggle = () => {
      if (video.paused) { video.play().catch(() => {}); playBtn.classList.add('hidden'); } else { video.pause(); playBtn.classList.remove('hidden'); }
    };
    playBtn.addEventListener('click', toggle);
    video.addEventListener('click', toggle);
    video.addEventListener('ended', () => { playBtn.classList.remove('hidden'); showNext(); });
    stage.append(h('div', { class: 'video-wrap' }, video, playBtn));
  } else if (!cardIsEmpty(act.card)) {
    const c = renderCard(act.card, { cls: 'view-card', tag: 'button', attrs: { type: 'button' } });
    c.addEventListener('click', () => ctx.say(act.card));
    stage.append(c);
  }

  const next = h('button', { class: 'next-btn invisible', type: 'button', 'aria-label': 'Siguiente', html: ARROW_SVG });
  next.addEventListener('click', () => {
    if (finished) return;
    finished = true;
    video?.pause();
    ctx.done({ quiet: true });
  });
  wrap.append(stage, next);
  root.append(wrap);

  function showNext() { next.classList.remove('invisible'); }
  later(showNext, 4000, timers);

  return {
    destroy() { clearTimers(timers); video?.pause(); },
    afterPrompt() { showNext(); },
    hint() { next.classList.add('hint-1'); },
  };
}
