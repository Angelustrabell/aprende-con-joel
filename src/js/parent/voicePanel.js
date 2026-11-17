// Panel de voz del editor de lectura: voz híbrida.
// Cada página puede tener la grabación de la voz de papá. La grabación se liga al TEXTO de la página
// (no a su número): si papá cambia ese texto, la grabación queda aparte como "texto anterior" y esa
// página vuelve a sonar con la voz de Windows; las demás páginas no se ven afectadas.
import { h } from '../core/dom.js';
import { save } from '../core/store.js';
import { Recorder, saveBlob } from '../core/media.js';
import { pageKey, pageSnippet } from '../core/markdown.js';
import { playFile, stopSpeech } from '../core/speech.js';
import { confirmDialog, toast } from '../core/modal.js';

const MAX_SECONDS = 600;
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// getPages(): páginas actuales (bloques) · getIndex(): página que se está viendo · goTo(i) · listen()
// onState(recording): para bloquear el texto mientras se graba.
export function voicePanel({ act, getPages, getIndex, goTo, listen, onState }) {
  act.audios = act.audios || {};
  let rec = null;
  let recKey = '';
  let recSnippet = '';
  let t0 = 0;
  let timer = null;
  const el = h('section', { class: 'rd-voice' });
  const timerEl = h('b', { class: 'rec-time' }, '0:00');

  function drawChips(keys, idx, locked) {
    return h('div', { class: 'vchips' }, ...keys.map((k, i) => {
      const has = !!act.audios[k]?.f;
      const b = h('button', {
        class: `vchip ${i === idx ? 'on' : ''} ${has ? 'has' : ''}`, type: 'button', disabled: locked,
        title: has ? 'Con tu voz grabada' : 'Con la voz de Windows',
        onclick: () => goTo(i),
      }, String(i + 1), has ? ' 🎙' : '');
      return b;
    }));
  }

  function refresh() {
    const pages = getPages();
    const idx = Math.max(0, Math.min(getIndex(), pages.length - 1));
    const keys = pages.map(pageKey);
    const cur = keys[idx];
    const entry = act.audios[cur];
    const orphans = Object.entries(act.audios).filter(([k, v]) => v?.f && !keys.includes(k));
    const empty = !pages[idx]?.length;

    const status = rec
      ? h('div', { class: 'vstatus rec' }, h('span', { class: 'rec-dot' }), 'Grabando la página ', String(Math.max(1, keys.indexOf(recKey) + 1)), ' · ', timerEl)
      : h('div', { class: 'vstatus' }, entry ? `🎙 Suena tu grabación (${fmt(entry.s || 0)})` : '🔊 Suena la voz de Windows');

    const buttons = rec
      ? [
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => stopRec(true) }, '⏹ Terminar y guardar'),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => stopRec(false) }, '✖ Cancelar')]
      : [
        h('button', { class: 'btn btn-primary', type: 'button', disabled: empty, onclick: startRec }, entry ? '🎙 Volver a grabar' : '🎙 Grabar esta página'),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: listen, title: 'Suena igual que cuando Joel la lea' }, '▶ Escuchar como la oirá Joel'),
        entry ? h('button', { class: 'btn btn-ghost danger', type: 'button', onclick: () => removeEntry(cur) }, '🗑 Quitar mi grabación') : null];

    const orphanBox = orphans.length ? h('details', { class: 'vorphans' },
      h('summary', `⚠ ${orphans.length} grabación${orphans.length === 1 ? '' : 'es'} de un texto anterior`),
      h('p', { class: 'muted small' }, 'Ya no coinciden con ninguna página porque cambiaste el texto. Puedes usarlas en la página actual (si solo corregiste una palabra) o quitarlas.'),
      ...orphans.map(([k, v]) => h('div', { class: 'vorphan' },
        h('span', { class: 'vo-text' }, `«${v.t || '…'}»`),
        h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Escuchar', onclick: () => playFile(v.f) }, '▶'),
        h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Usar en esta página', disabled: !!rec, onclick: () => { act.audios[cur] = v; delete act.audios[k]; commit(); } }, '↪ Usar aquí'),
        h('button', { class: 'btn btn-ghost btn-sm danger', type: 'button', title: 'Quitar', disabled: !!rec, onclick: () => { delete act.audios[k]; commit(); } }, '🗑')))) : null;

    el.replaceChildren(
      h('div', { class: 'vhead' }, h('b', '🎙 Tu voz'), h('span', { class: 'muted small' }, `página ${idx + 1} de ${pages.length}`)),
      status,
      h('div', { class: 'row vbtns' }, ...buttons),
      drawChips(keys, idx, !!rec),
      orphanBox,
      h('p', { class: 'muted small' }, 'Si una página no tiene tu grabación, la lee la voz de Windows. Para que tus grabaciones no se desacomoden al editar, elige «Las separo yo» y marca las páginas con ⏎ Página nueva.'),
    );
  }

  function commit() { save(); refresh(); }

  async function startRec() {
    stopSpeech();
    const pages = getPages();
    const idx = Math.max(0, Math.min(getIndex(), pages.length - 1));
    recKey = pageKey(pages[idx]);
    recSnippet = pageSnippet(pages[idx]);
    const r = new Recorder();
    try { await r.start(); } catch (e) {
      toast(`No se pudo usar el micrófono: ${e.message || e.name}. Revisa que esté conectado y permitido.`, 'error', 5000);
      return;
    }
    rec = r;
    t0 = Date.now();
    onState?.(true);
    timer = setInterval(() => {
      const s = (Date.now() - t0) / 1000;
      timerEl.textContent = fmt(s);
      if (s >= MAX_SECONDS) stopRec(true);
    }, 250);
    refresh();
  }

  async function stopRec(keep) {
    if (!rec) return;
    clearInterval(timer);
    const r = rec;
    rec = null;
    onState?.(false);
    if (!keep) { r.cancel(); refresh(); return; }
    const secs = Math.round((Date.now() - t0) / 1000);
    const blob = await r.stop();
    if (!blob) { toast('No se grabó nada. Prueba otra vez.', 'error'); refresh(); return; }
    try {
      const name = await saveBlob(blob, 'webm');
      act.audios[recKey] = { f: name, t: recSnippet, at: Date.now(), s: secs };
      toast('🎙 Grabación guardada', 'ok');
    } catch (e) { toast(`No se pudo guardar: ${e.message}`, 'error'); }
    commit();
  }

  async function removeEntry(key) {
    if (!(await confirmDialog('¿Quitar tu grabación de esta página? Volverá a leerla la voz de Windows.', { okLabel: 'Quitar', danger: true }))) return;
    delete act.audios[key];
    commit();
  }

  refresh();
  return {
    el,
    refresh,
    isRecording: () => !!rec,
    destroy() { clearInterval(timer); try { rec?.cancel(); } catch { /* nada */ } rec = null; },
  };
}
