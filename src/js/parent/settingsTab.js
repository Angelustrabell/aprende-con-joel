// Pestaña de ajustes.
import { h } from '../core/dom.js';
import { settings, save, store } from '../core/store.js';
import { hashPin } from '../core/util.js';
import { speak, spanishVoices, allVoices, playFile, hasVoiceFor } from '../core/speech.js';
import { openModal, toast, confirmDialog } from '../core/modal.js';
import { toggle, field, stepper, recorderWidget } from './widgets.js';
import { pinPad } from './pinPad.js';
import { exportBackup, restoreBackup, cleanUnusedMedia } from './transfer.js';

function section(title, ...children) {
  return h('section', { class: 'panel settings-section' }, h('h3', title), ...children);
}

function settingRow(label, control, hint = '') {
  return h('div', { class: 'setting-row' }, h('div', { class: 'sr-text' }, h('b', label), hint ? h('small', { class: 'muted' }, hint) : null), h('div', { class: 'sr-control' }, control));
}

function changePin() {
  let step = 0;
  let first = '';
  let pad = null;
  const m = openModal({ title: 'Cambiar PIN', content: h('div'), onClose: () => pad?.destroy() });
  pad = pinPad({
    title: 'PIN actual',
    subtitle: 'Escribe tu PIN actual',
    onComplete: async (pin) => {
      if (step === 0) {
        if ((await hashPin(pin)) !== settings().pinHash) { pad.setMessage('PIN incorrecto'); return false; }
        step = 1; pad.setTitle('PIN nuevo'); pad.setMessage('Escribe 4 números'); pad.reset(); return true;
      }
      if (step === 1) { first = pin; step = 2; pad.setTitle('Repite el PIN nuevo'); pad.setMessage(''); pad.reset(); return true; }
      if (pin !== first) { step = 1; pad.setTitle('PIN nuevo'); pad.setMessage('No coinciden. Otra vez.'); return false; }
      settings().pinHash = await hashPin(pin);
      save();
      m.close();
      toast('✔ PIN cambiado', 'ok');
      return true;
    },
  });
  m.body.replaceChildren(pad.el);
}

function audioList(key, title, hint) {
  const wrap = h('div', { class: 'audio-list' });
  const draw = () => {
    const list = settings()[key];
    wrap.replaceChildren(
      ...list.map((name, i) => h('div', { class: 'audio-item' },
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => playFile(name) }, `▶ Frase ${i + 1}`),
        h('button', { class: 'btn btn-ghost btn-icon', type: 'button', onclick: () => { list.splice(i, 1); save(); draw(); } }, '🗑'))),
      list.length < 8 ? recorderWidget('', (name) => { if (name) { list.push(name); save(); draw(); } }, { label: 'Grabar una frase', maxSeconds: 6 }) : null,
    );
  };
  draw();
  return settingRow(title, wrap, hint);
}

export function renderSettingsTab(el) {
  const s = settings();
  const draw = () => {
    // Voces
    const voices = spanishVoices();
    const voiceSel = h('select', { class: 'input' },
      h('option', { value: '', selected: !s.voiceURI }, 'Automática (la mejor en español)'),
      ...voices.map((v) => h('option', { value: v.voiceURI, selected: v.voiceURI === s.voiceURI }, `${v.name} (${v.lang})`)));
    voiceSel.addEventListener('change', () => { s.voiceURI = voiceSel.value; save(); speak(`Hola, soy la voz de ${store.data.students[0]?.name || 'Joel'}`); });
    const range = (key, min, max, stepV, fmt) => {
      const out = h('span', { class: 'range-val' }, fmt(s[key]));
      const r = h('input', { type: 'range', min, max, step: stepV, value: String(s[key]) });
      r.addEventListener('input', () => { s[key] = Number(r.value); out.textContent = fmt(s[key]); save(); });
      r.addEventListener('change', () => speak('¡Muy bien!'));
      return h('div', { class: 'row' }, r, out);
    };

    const minutesSel = h('select', { class: 'input auto' },
      ...[[0, 'Sin límite'], [10, '10 min'], [15, '15 min'], [20, '20 min'], [30, '30 min'], [45, '45 min'], [60, '1 hora']]
        .map(([v, l]) => h('option', { value: String(v), selected: s.dailyMinutes === v }, l)));
    minutesSel.addEventListener('change', () => { s.dailyMinutes = Number(minutesSel.value); save(); });

    el.replaceChildren(
      h('div', { class: 'section-head' }, h('h2', 'Ajustes')),
      section('🔒 Seguridad',
        settingRow('PIN del modo papá', h('button', { class: 'btn btn-ghost', type: 'button', onclick: changePin }, 'Cambiar PIN')),
        settingRow('Modo kiosco', toggle(s.kiosk, (v) => { s.kiosk = v; save(); }), 'En el modo alumno la app ocupa toda la pantalla y no se puede cerrar sin el PIN (botón 🔒, mantener 2 s).'),
        settingRow('Pantalla completa', toggle(s.fullscreen, (v) => { s.fullscreen = v; save(); }), 'Si el kiosco está apagado, al menos usar pantalla completa en el modo alumno.'),
      ),
      section('⏱ Tiempo de juego',
        settingRow('Tiempo máximo al día', minutesSel, 'Al llegar al límite termina la sesión en curso y luego aparece "¡Por hoy terminamos!". Puedes dar más tiempo con el PIN.'),
        settingRow('Sesiones máximas al día', stepper(s.maxSessionsPerDay, { min: 0, max: 20, onChange: (v) => { s.maxSessionsPerDay = v; save(); } }), '0 = sin límite.'),
      ),
      section('🧠 Aprendizaje',
        settingRow('Misión del día (sesiones)', stepper(s.dailyGoal || 2, { min: 1, max: 6, onChange: (v) => { s.dailyGoal = v; save(); } }), 'Cuántas sesiones hay que completar para cumplir la misión diaria y ganar un cofre.'),
        settingRow('Desbloquear en orden', toggle(s.sequentialUnlock, (v) => { s.sequentialUnlock = v; save(); }), 'En cada unidad, una sesión se abre al terminar la anterior.'),
        settingRow('Actividades de repaso', stepper(s.reviewCount, { min: 0, max: 5, onChange: (v) => { s.reviewCount = v; save(); } }), 'Al empezar cada sesión se repasan actividades anteriores, sobre todo las que le costaron.'),
        settingRow('Ayuda si se queda quieto', toggle(s.idleHelp, (v) => { s.idleHelp = v; save(); }), 'Tras unos segundos sin tocar nada repite la instrucción y luego da una pista.'),
        settingRow('Mostrar palabras bajo los dibujos', toggle(s.showCaptions, (v) => { s.showCaptions = v; save(); }), 'Útil para empezar a leer. Apágalo si prefieres solo dibujos.'),
      ),
      section('🔊 Voz y sonido',
        voices.length ? settingRow('Voz', voiceSel) : settingRow('Voz', h('div', { class: 'form-col' },
          h('p', { class: 'form-error' }, `No encontré voces en español (hay ${allVoices().length} voces instaladas).`),
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => window.api.openSpeechSettings() }, 'Abrir ajustes de voz de Windows')),
        'Windows: Configuración → Hora e idioma → Voz → Agregar voces → Español.'),
        settingRow('Voz en inglés', hasVoiceFor('en')
          ? h('span', { class: 'muted' }, '✔ Instalada: el curso de Inglés se oirá bien')
          : h('div', { class: 'form-col' },
            h('p', { class: 'form-error' }, 'No hay una voz en inglés instalada: las palabras en inglés se oirán con acento español.'),
            h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => window.api.openSpeechSettings() }, 'Abrir ajustes de voz de Windows')),
        'Windows: Configuración → Hora e idioma → Voz → Agregar voces → Inglés (Estados Unidos).'),
        settingRow('Velocidad de la voz', range('rate', 0.6, 1.3, 0.05, (v) => `${v.toFixed(2)}×`)),
        settingRow('Tono de la voz', range('pitch', 0.6, 1.6, 0.05, (v) => v.toFixed(2))),
        settingRow('Volumen', range('volume', 0.1, 1, 0.05, (v) => `${Math.round(v * 100)}%`)),
        settingRow('Efectos de sonido', toggle(s.sounds, (v) => { s.sounds = v; save(); })),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => speak('¡Hola! ¿Jugamos a aprender?') }, '🔊 Probar voz'),
      ),
      section('🎙️ Tu voz animando',
        h('p', { class: 'muted' }, 'Graba frases cortas con tu voz. La app las usará al azar en lugar de la voz automática.'),
        audioList('praiseAudios', 'Felicitaciones', 'Ej.: "¡Muy bien, Joel!", "¡Eres un campeón!"'),
        audioList('retryAudios', 'Ánimo al equivocarse', 'Ej.: "¡Casi! Inténtalo otra vez".'),
      ),
      section('✨ Inteligencia artificial (opcional)',
        h('p', { class: 'muted' }, 'Para "Crear con IA" en los cursos. Necesita una clave de API de Anthropic (console.anthropic.com). Solo se envía el tema que escribes.'),
        settingRow('Modelo', (() => {
          const sel = h('select', { class: 'input auto' },
            ...[['claude-opus-5-5', 'Claude Opus 5.5 (mejor calidad)'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 (más rápido y económico)'], ['claude-haiku-4-5', 'Claude Haiku 4.5 (el más económico)']]
              .map(([v, l]) => h('option', { value: v, selected: s.aiModel === v }, l)));
          sel.addEventListener('change', () => { s.aiModel = sel.value; save(); });
          return sel;
        })()),
        settingRow('Clave de API', (() => {
          const box = h('div', { class: 'row' });
          window.api.aiHasKey().then((has) => {
            const input = h('input', { class: 'input', type: 'password', placeholder: has ? '•••••••• (guardada)' : 'sk-ant-…', autocomplete: 'off' });
            box.replaceChildren(input,
              h('button', { class: 'btn btn-ghost', type: 'button', onclick: async () => { if (!input.value.trim()) return; await window.api.aiSetKey(input.value.trim()); toast('✔ Clave guardada (cifrada)', 'ok'); draw(); } }, 'Guardar'),
              has ? h('button', { class: 'btn btn-ghost danger', type: 'button', onclick: async () => { await window.api.aiSetKey(''); toast('Clave borrada'); draw(); } }, 'Borrar') : null);
          });
          return box;
        })()),
      ),
      section('💾 Datos',
        settingRow('Copia de seguridad', h('div', { class: 'row' },
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: exportBackup }, '📤 Guardar copia'),
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: restoreBackup }, '📥 Restaurar copia')),
        'Incluye cursos, imágenes, grabaciones, progreso y ajustes. La app además guarda sola una copia diaria.'),
        settingRow('Carpeta de datos', h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => window.api.openDataFolder() }, '📂 Abrir carpeta')),
        settingRow('Liberar espacio', h('button', { class: 'btn btn-ghost', type: 'button', onclick: cleanUnusedMedia }, '🧹 Borrar archivos sin usar')),
        settingRow('Empezar de cero', h('button', {
          class: 'btn btn-ghost danger', type: 'button',
          onclick: async () => {
            if (!(await confirmDialog('Se borrarán TODOS los cursos, alumnos, progreso y ajustes de esta app. Te recomiendo guardar antes una copia. ¿Seguro?', { okLabel: 'Borrar todo', danger: true }))) return;
            if (!(await confirmDialog('¿De verdad? Esta acción no se puede deshacer.', { okLabel: 'Sí, borrar todo', danger: true }))) return;
            store.data = { version: 1, createdAt: Date.now(), settings: {}, students: [], courses: [], progress: {} };
            await window.api.saveData(JSON.stringify(store.data));
            location.reload();
          },
        }, '⚠️ Borrar todo')),
      ),
      h('p', { class: 'muted small center' }, 'Aprende con Joel · hecho con cariño para Joel 💜'),
    );
  };
  draw();
  // Las voces del sistema a veces cargan tarde.
  const t = setTimeout(() => { if (!spanishVoices().length) return; if (!el.querySelector('select option[value=""]')) draw(); }, 800);
  return () => clearTimeout(t);
}
