// Editor de una actividad con vista previa en vivo.
import { h, animateClass } from '../core/dom.js';
import { findSession, save } from '../core/store.js';
import { go } from '../core/router.js';
import { clone, debounce } from '../core/util.js';
import { sayThing, speak, stopSpeech } from '../core/speech.js';
import { sfx } from '../core/sfx.js';
import { burstAt } from '../core/fx.js';
import { confirmDialog, toast } from '../core/modal.js';
import { ACTIVITY_TYPES, newActivity, validateActivity } from '../data/activityTypes.js';
import { mountActivity } from '../activities/index.js';
import { buildForm } from './forms.js';
import { save as saveStore } from '../core/store.js';

export const mode = 'parent';

export function render(root, { sessionId, activityId = null, newType = null }) {
  const found = findSession(sessionId);
  if (!found) { go('parentHome'); return; }
  const { session } = found;
  // Las lecturas se editan en su propio editor (texto grande con vista previa).
  if (newType === 'reading' || session.activities.find((a) => a.id === activityId)?.type === 'reading') {
    let a = session.activities.find((x) => x.id === activityId);
    if (!a) { a = newActivity('reading'); session.activities.push(a); saveStore(); }
    go('readingEditor', { sessionId, activityId: a.id });
    return;
  }
  const original = activityId ? session.activities.find((a) => a.id === activityId) : null;
  const act = original ? clone(original) : newActivity(newType || 'choose');
  const type = ACTIVITY_TYPES[act.type];
  let dirty = !original;
  let instance = null;
  let previewErrors = 0;
  let destroyed = false;

  const back = async () => {
    if (dirty && !(await confirmDialog('Hay cambios sin guardar. ¿Salir sin guardar?', { okLabel: 'Salir sin guardar', danger: true }))) return;
    go('sessionEditor', { sessionId });
  };

  const errorEl = h('div', { class: 'form-error' });
  const formHost = h('div', { class: 'form-host' });
  const previewBox = h('div', { class: 'preview-box kid-preview' });
  const doneOverlay = h('div', { class: 'preview-done hidden' }, '✔ ¡Completada!');

  const saveBtn = h('button', { class: 'btn btn-primary', type: 'button' }, '💾 Guardar');
  saveBtn.addEventListener('click', doSave);

  root.append(h('div', { class: 'p-page' },
    h('header', { class: 'p-header' },
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: back }, '← Volver'),
      h('div', { class: 'p-title' }, h('span', { class: 'type-icon' }, type.icon), `${original ? 'Editar' : 'Nueva'}: ${type.name}`, h('small', { class: 'muted' }, ` · ${session.title}`)),
      h('div', { class: 'p-actions' }, saveBtn),
    ),
    h('div', { class: 'editor-grid' },
      h('div', { class: 'editor-form' }, h('p', { class: 'type-desc' }, type.desc), formHost, errorEl),
      h('div', { class: 'editor-preview' },
        h('div', { class: 'preview-head' },
          h('b', 'Vista previa'),
          h('div', { class: 'row' },
            h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => remount(true) }, '▶ Probar con voz'),
            h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => remount(false) }, '🔄 Reiniciar'))),
        h('div', { class: 'preview-frame' }, previewBox, doneOverlay),
        h('p', { class: 'muted small' }, 'Puedes jugarla aquí mismo con el ratón para comprobarla.'),
      ),
    ),
  ));

  function rebuildForm() {
    const scroll = formHost.parentElement?.scrollTop || 0;
    formHost.replaceChildren(buildForm(act, onChanged));
    if (formHost.parentElement) formHost.parentElement.scrollTop = scroll;
  }

  const remountSoon = debounce(() => remount(false), 400);

  function onChanged(rebuild) {
    dirty = true;
    errorEl.textContent = '';
    if (rebuild) rebuildForm();
    remountSoon();
  }

  async function remount(withPrompt) {
    if (destroyed) return;
    try { instance?.destroy?.(); } catch { /* nada */ }
    instance = null;
    stopSpeech();
    previewErrors = 0;
    doneOverlay.classList.add('hidden');
    previewBox.replaceChildren();
    const area = h('div', { class: 'act-root' });
    previewBox.append(area);
    const err = validateActivity(act);
    if (err) {
      area.append(h('div', { class: 'preview-msg' }, `⚠️ ${err}`));
      return;
    }
    const ctx = {
      preview: true,
      childName: 'Joel',
      say: (c) => sayThing(c),
      speak: (t) => speak(t),
      mascot: () => {},
      correct: (el) => { sfx.correct(); if (el) burstAt(el); },
      wrong: (el, o = {}) => {
        previewErrors++;
        if (el) animateClass(el, 'shake');
        if (o.quiet) sfx.flip(); else sfx.wrong();
        if (previewErrors === 2) instance?.hint?.(1);
        if (previewErrors >= 4 && previewErrors % 2 === 0) instance?.hint?.(2);
      },
      done: () => { sfx.win(); setTimeout(() => doneOverlay.classList.remove('hidden'), 500); },
      saveDrawing: async () => {},
    };
    try {
      instance = await mountActivity(area, act, ctx);
      if (withPrompt) await sayThing(act.prompt);
      if (!destroyed) instance?.afterPrompt?.();
    } catch (e) {
      console.error(e);
      area.append(h('div', { class: 'preview-msg' }, `⚠️ Error en la vista previa: ${e.message}`));
    }
  }

  function doSave() {
    const err = validateActivity(act);
    if (err) {
      errorEl.textContent = `⚠️ ${err}`;
      animateClass(errorEl, 'shake');
      return;
    }
    const idx = session.activities.findIndex((a) => a.id === act.id);
    if (idx >= 0) session.activities[idx] = act;
    else session.activities.push(act);
    save();
    dirty = false;
    toast('Actividad guardada', 'ok');
    go('sessionEditor', { sessionId });
  }

  const onKey = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); doSave(); }
  };
  document.addEventListener('keydown', onKey);

  rebuildForm();
  remount(false);

  return () => {
    destroyed = true;
    document.removeEventListener('keydown', onKey);
    try { instance?.destroy?.(); } catch { /* nada */ }
  };
}
