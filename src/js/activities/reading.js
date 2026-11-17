// Lectura: páginas de texto con imágenes y tablas, narradas con la voz de Windows.
import { h } from '../core/dom.js';
import { paginate, renderPage, pageSentences, pageKey } from '../core/markdown.js';
import { speak, stopSpeech, playFile } from '../core/speech.js';
import { ARROW_SVG } from './common.js';
import { onResize } from '../core/dom.js';

export default function mount(root, act, ctx) {
  const pages = paginate(act.md, act.size || 'normal', act.pagination === 'manual');
  let idx = Math.min(Math.max(0, act.startPage || 0), pages.length - 1);
  let narToken = 0;
  let destroyed = false;
  let finished = false;

  const body = h('div', { class: `rd-body size-${act.size || 'normal'}` });
  const counter = h('span', { class: 'rd-count' });
  const prev = h('button', { class: 'rd-nav rd-prev', type: 'button', 'aria-label': 'Anterior', html: ARROW_SVG });
  const next = h('button', { class: 'rd-nav rd-next', type: 'button', 'aria-label': 'Siguiente', html: ARROW_SVG });
  const bar = h('div', { class: 'rd-bar' }, prev, counter, next);
  const wrap = h('div', { class: 'act act-reading' }, body, bar);
  root.append(wrap);

  // Ajuste automático: si la página no cabe en la tarjeta, la letra se reduce hasta que quepa
  // (hasta un mínimo legible; si aun así no cabe, la tarjeta se desplaza).
  function fit() {
    if (destroyed) return;
    body.style.fontSize = '';
    const base = parseFloat(getComputedStyle(body).fontSize) || 20;
    let scale = 1;
    while (body.scrollHeight > body.clientHeight + 1 && scale > 0.5) {
      scale -= 0.05;
      body.style.fontSize = `${(base * scale).toFixed(2)}px`;
    }
  }
  const stopResize = onResize(body, () => fit());

  async function narrate() {
    const my = ++narToken;
    stopSpeech();
    if (act.narrate === false) return;
    // Voz híbrida: si papá grabó su voz para esta página (y el texto no ha cambiado), suena su
    // grabación; si no existe o no se puede reproducir, lee la voz de Windows.
    const rec = act.audios?.[pageKey(pages[idx])];
    if (rec?.f) {
      const ok = await playFile(rec.f);
      if (ok || destroyed || my !== narToken) return;
    }
    for (const s of pageSentences(pages[idx])) {
      if (destroyed || my !== narToken) return;
      await speak(s);
    }
  }

  function show(i, { say = true } = {}) {
    idx = Math.min(Math.max(0, i), pages.length - 1);
    narToken++;
    body.replaceChildren(renderPage(pages[idx]));
    body.scrollTop = 0;
    requestAnimationFrame(fit);
    counter.textContent = pages.length > 1 ? `${idx + 1} / ${pages.length}` : '';
    prev.classList.toggle('invisible', idx === 0);
    const last = idx === pages.length - 1;
    next.classList.toggle('last', last);
    next.innerHTML = last ? '✔' : ARROW_SVG;
    next.setAttribute('aria-label', last ? 'Terminar' : 'Siguiente');
    if (say) narrate();
    ctx.onPage?.(idx, pageKey(pages[idx]));
  }

  prev.addEventListener('click', () => show(idx - 1));
  next.addEventListener('click', () => {
    if (idx < pages.length - 1) { show(idx + 1); return; }
    if (finished) return;
    finished = true;
    narToken++;
    stopSpeech();
    ctx.done({ quiet: true });
  });

  show(idx, { say: false });

  return {
    destroy() { destroyed = true; stopResize(); narToken++; stopSpeech(); },
    afterPrompt() { if (!destroyed) narrate(); },
    replay() { narrate(); },
    hint() { next.classList.add('hint-1'); },
    noIdle: true, // el reproductor no repite la instrucción por inactividad mientras se lee
    page: () => idx,
    keys: () => pages.map(pageKey),
    pageCount: () => pages.length,
    goTo: (i) => show(i, { say: false }),
  };
}
