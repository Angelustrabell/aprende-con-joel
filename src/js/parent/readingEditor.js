// Editor de una conferencia: el texto a la izquierda y, a la derecha, lo que verá Joel.
// Se guarda solo mientras escribes. El texto original del libro queda siempre como referencia.
import { h } from '../core/dom.js';
import { findSession, save } from '../core/store.js';
import { go } from '../core/router.js';
import { debounce } from '../core/util.js';
import { pickFile, saveImage } from '../core/media.js';
import { paginate, renderPage, pageAtOffset } from '../core/markdown.js';
import { stopSpeech } from '../core/speech.js';
import { voicePanel } from './voicePanel.js';
import { confirmDialog, toast } from '../core/modal.js';
import { mountActivity } from '../activities/index.js';
import { iconInput, toggle, field } from './widgets.js';

export const mode = 'parent';

export function render(root, { sessionId, activityId, page = 0, returnTo = null }) {
  const found = findSession(sessionId);
  const act = found?.session.activities.find((a) => a.id === activityId);
  if (!found || !act) { go('parentHome'); return; }
  const { course, session } = found;
  let instance = null;
  let destroyed = false;
  let showOriginal = false;
  let currentPage = page;
  act.audios = act.audios || {};
  const hasRecordings = () => Object.values(act.audios).some((v) => v?.f);
  const isManual = () => act.pagination === 'manual';
  const pagesNow = () => paginate(ta.value, act.size || 'normal', isManual());

  const back = () => {
    save();
    if (returnTo) go(returnTo.name, returnTo.params || {});
    else go('sessionEditor', { sessionId });
  };

  // ---------- Texto ----------
  const ta = h('textarea', { class: 'rd-text', spellcheck: 'true', placeholder: 'Escribe aquí lo que Joel va a leer y escuchar.\n\nUna línea en blanco separa párrafos. Una línea con --- empieza una página nueva.' });
  ta.value = act.md || '';
  const status = h('span', { class: 'muted small' }, 'Guardado ✓');
  const info = h('span', { class: 'muted small' });

  const insert = (text, { select = false } = {}) => {
    ta.focus();
    if (!document.execCommand('insertText', false, text)) ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, select ? 'select' : 'end');
    onInput();
  };
  const wrapSel = (a, b = a) => {
    const { selectionStart: s, selectionEnd: e, value } = ta;
    insert(`${a}${value.slice(s, e) || 'texto'}${b}`);
  };
  const linePrefix = (prefix) => {
    const s = ta.value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
    ta.setSelectionRange(s, s);
    insert(prefix);
  };
  async function addImage(file) {
    if (!file) return;
    try {
      const name = await saveImage(file, 1400);
      insert(`\n\n![](media/${name})\n\n`);
    } catch (e) { toast(`No se pudo añadir la imagen: ${e.message}`, 'error'); }
  }
  ta.addEventListener('paste', (e) => {
    const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith('image/'));
    if (f) { e.preventDefault(); addImage(f); }
  });

  const tool = (label, title, fn) => h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title, onclick: fn }, label);
  const toolbar = h('div', { class: 'rd-tools' },
    tool('B', 'Negrita', () => wrapSel('**')),
    tool('I', 'Cursiva', () => wrapSel('_')),
    tool('Título', 'Convertir la línea en título', () => linePrefix('### ')),
    tool('• Lista', 'Convertir la línea en viñeta', () => linePrefix('- ')),
    tool('⏎ Página nueva', 'Empieza una página nueva aquí', () => insert('\n\n---\n\n')),
    tool('🖼 Imagen', 'Insertar una imagen (también puedes pegarla con Ctrl+V)', async () => addImage(await pickFile('image/*'))),
    h('span', { class: 'grow' }),
    tool('↶ Restaurar original', 'Volver al texto original del libro', async () => {
      if (!session.source) { toast('Esta conferencia no tiene texto original.'); return; }
      if (!(await confirmDialog('Se reemplaza TODO el texto actual por el original del libro. ¿Continuar?', { okLabel: 'Restaurar', danger: true }))) return;
      ta.value = session.source;
      onInput();
    }),
  );

  // ---------- Datos de la conferencia ----------
  const titleInput = h('input', { class: 'input', value: session.title });
  titleInput.addEventListener('input', () => { session.title = titleInput.value; save(); });
  const sizeSel = h('select', { class: 'input' }, ...[['normal', 'Normal'], ['grande', 'Grande'], ['enorme', 'Muy grande']].map(([v, l]) => h('option', { value: v, selected: (act.size || 'normal') === v }, l)));
  sizeSel.addEventListener('change', async () => {
    if (hasRecordings() && !isManual() && !(await confirmDialog('Cambiar el tamaño de letra cambia cómo se reparte el texto en páginas y tus grabaciones pueden dejar de coincidir. ¿Continuar?', { okLabel: 'Cambiar' }))) { sizeSel.value = act.size || 'normal'; return; }
    act.size = sizeSel.value; save(); remount();
  });
  const pagSel = h('select', { class: 'input' },
    h('option', { value: 'auto', selected: !isManual() }, 'Automáticas'),
    h('option', { value: 'manual', selected: isManual() }, 'Las separo yo (---)'));
  pagSel.addEventListener('change', async () => {
    if (hasRecordings() && !(await confirmDialog('Cambiar cómo se reparten las páginas puede dejar tus grabaciones sin coincidir. ¿Continuar?', { okLabel: 'Cambiar' }))) { pagSel.value = isManual() ? 'manual' : 'auto'; return; }
    act.pagination = pagSel.value; save(); remount();
  });
  const meta = h('div', { class: 'rd-meta' },
    field('Icono', iconInput(session.icon || '📖', (v) => { session.icon = v; save(); })),
    h('div', { class: 'field grow' }, h('span', { class: 'field-label' }, 'Título'), titleInput),
    field('Letra', sizeSel),
    field('Páginas', pagSel),
    field('La voz lee el texto', toggle(act.narrate !== false, (v) => { act.narrate = v; save(); })),
    field('Bloqueada 🔒', toggle(!!session.locked, (v) => { session.locked = v; save(); })));

  // ---------- Vista de Joel / original ----------
  const previewBox = h('div', { class: 'preview-box kid-preview' });
  const originalBox = h('div', { class: 'rd-original hidden' });
  const frame = h('div', { class: 'preview-frame rd-frame' }, previewBox, originalBox);
  const tabJoel = h('button', { class: 'seg-btn on', type: 'button' }, '👦 Lo que ve Joel');
  const tabOrig = h('button', { class: 'seg-btn', type: 'button' }, '📖 Texto original del libro');
  const setTab = (orig) => {
    showOriginal = orig;
    tabJoel.classList.toggle('on', !orig);
    tabOrig.classList.toggle('on', orig);
    previewBox.classList.toggle('hidden', orig);
    originalBox.classList.toggle('hidden', !orig);
    if (orig) {
      originalBox.replaceChildren(...(session.source
        ? paginate(session.source, 'normal').map((p, i) => h('div', { class: 'rd-orig-page' }, h('small', { class: 'muted' }, `— original, parte ${i + 1} —`), renderPage(p)))
        : [h('p', { class: 'muted' }, 'Esta conferencia no tiene texto original.')]));
      stopSpeech();
    }
  };
  tabJoel.addEventListener('click', () => setTab(false));
  tabOrig.addEventListener('click', () => setTab(true));

  async function remount() {
    if (destroyed) return;
    try { instance?.destroy?.(); } catch { /* nada */ }
    instance = null;
    previewBox.replaceChildren();
    const area = h('div', { class: 'act-root' });
    previewBox.append(area);
    const draft = { ...act, md: ta.value, startPage: currentPage };
    const ctx = { onPage: (i) => { currentPage = i; voice.refresh(); }, preview: true, childName: 'Joel', say: () => {}, speak: () => {}, mascot: () => {}, correct: () => {}, wrong: () => {}, done: () => {}, saveDrawing: async () => {} };
    try { instance = await mountActivity(area, draft, ctx); } catch (e) { area.append(h('div', { class: 'preview-msg' }, `⚠️ ${e.message}`)); }
    const n = instance?.pageCount?.() || 1;
    info.textContent = `${ta.value.trim().length} letras · ${n} página${n === 1 ? '' : 's'}`;
    voice.refresh();
  }
  const remountSoon = debounce(remount, 350);
  const saveSoon = debounce(() => { save(); status.textContent = 'Guardado ✓'; }, 600);

  function onInput() {
    act.md = ta.value;
    status.textContent = 'Guardando…';
    saveSoon();
    if (!showOriginal) { currentPage = instance?.page?.() ?? currentPage; remountSoon(); }
  }
  ta.addEventListener('input', onInput);

  // La vista previa salta a la página donde está el cursor.
  const followCursor = debounce(() => {
    if (!instance || showOriginal) return;
    currentPage = pageAtOffset(pagesNow(), ta.selectionStart);
    instance.goTo?.(currentPage);
  }, 250);
  ta.addEventListener('click', followCursor);
  ta.addEventListener('keyup', (e) => { if (e.key.startsWith('Arrow') || e.key === 'PageUp' || e.key === 'PageDown') followCursor(); });

  const listenFn = () => { setTab(false); instance?.replay?.(); };
  const voice = voicePanel({
    act,
    getPages: pagesNow,
    getIndex: () => instance?.page?.() ?? currentPage,
    goTo: (i) => { currentPage = i; instance?.goTo?.(i); voice.refresh(); },
    listen: listenFn,
    onState: (recording) => { ta.readOnly = recording; frame.classList.toggle('is-recording', recording); },
  });
  const listen = h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { setTab(false); instance?.replay?.(); } }, '🔊 Escuchar esta página');
  const seeAsJoel = h('button', {
    class: 'btn btn-primary', type: 'button',
    onclick: () => { save(); go('player', { sessionId, preview: true, edit: true, returnTo }); },
  }, '▶ Ver como Joel');

  root.append(h('div', { class: 'p-page rd-page-root' },
    h('header', { class: 'p-header' },
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: back }, `← ${returnTo ? 'Volver' : course.title}`),
      h('div', { class: 'p-title' }, h('span', { class: 'type-icon' }, '📖'), 'Editar lectura', h('small', { class: 'muted' }, ` · ${session.title}`)),
      h('div', { class: 'p-actions' }, status, seeAsJoel),
    ),
    h('div', { class: 'editor-grid rd-grid' },
      h('div', { class: 'editor-form rd-left' }, meta, toolbar, ta, h('div', { class: 'row' }, info)),
      h('div', { class: 'editor-preview' },
        h('div', { class: 'preview-head' }, h('div', { class: 'seg' }, tabJoel, tabOrig), listen),
        frame,
        voice.el,
        h('p', { class: 'muted small' }, 'La vista se actualiza mientras escribes. Haz clic en el texto y la vista salta a esa página.'),
      ),
    ),
  ));

  const onKey = (e) => { if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); save(); status.textContent = 'Guardado ✓'; toast('Guardado', 'ok'); } };
  document.addEventListener('keydown', onKey);
  remount();

  return () => {
    destroyed = true;
    document.removeEventListener('keydown', onKey);
    save();
    try { instance?.destroy?.(); } catch { /* nada */ }
    voice.destroy();
    stopSpeech();
  };
}
