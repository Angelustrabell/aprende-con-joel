// Voz: texto a voz en español y reproducción de grabaciones.
import { settings } from './store.js';
import { mediaUrl } from './media.js';
import { pick } from './util.js';

let voices = [];
let currentAudio = null;
let token = 0;

function loadVoices() {
  try { voices = window.speechSynthesis.getVoices(); } catch { voices = []; }
}
if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function allVoices() {
  loadVoices();
  return voices;
}

export function spanishVoices() {
  return allVoices().filter((v) => (v.lang || '').toLowerCase().startsWith('es'));
}

// Voz en otro idioma (por ejemplo inglés) para el curso de Inglés. Devuelve null si no hay ninguna instalada.
export function voiceForLang(lang) {
  loadVoices();
  const pre = String(lang || '').toLowerCase();
  const list = voices.filter((v) => (v.lang || '').toLowerCase().startsWith(pre));
  return list.find((v) => /en-US/i.test(v.lang)) || list[0] || null;
}
export const hasVoiceFor = (lang) => !!voiceForLang(lang);

function pickVoice(lang) {
  // Otro idioma: solo una voz de ese idioma (si no hay, se pide el idioma igualmente; nunca se lee con la voz española).
  if (lang && lang !== 'es') return voiceForLang(lang);
  const s = settings();
  let v = voices.find((x) => x.voiceURI === s.voiceURI);
  if (!v) {
    const es = spanishVoices();
    const latam = es.filter((x) => /es-(MX|US|419|CO|AR|PE|CL)/i.test(x.lang));
    const female = /sabina|helena|laura|dalia|elena|paulina|lucia|elvira|ximena|camila/i;
    v = latam.find((x) => female.test(x.name)) || latam[0] || es.find((x) => female.test(x.name)) || es[0];
  }
  return v || null;
}

export function stopSpeech() {
  token++;
  try { window.speechSynthesis.cancel(); } catch { /* nada */ }
  if (currentAudio) {
    try { currentAudio.pause(); } catch { /* nada */ }
    currentAudio = null;
  }
}

export function speak(text, opts = {}) {
  stopSpeech();
  const my = token;
  text = String(text || '').trim();
  if (!text || !('speechSynthesis' in window)) return Promise.resolve();
  return new Promise((resolve) => {
    const s = settings();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(opts.lang);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = opts.lang === 'en' ? 'en-US' : 'es-ES';
    u.rate = opts.rate ?? s.rate ?? 1;
    u.pitch = opts.pitch ?? s.pitch ?? 1;
    u.volume = s.volume ?? 1;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      resolve();
    };
    u.onend = finish;
    u.onerror = finish;
    const timeout = setTimeout(finish, 1500 + (text.length * 120) / u.rate);
    // Pequeña pausa tras cancelar: algunos motores pierden la frase si se habla de inmediato.
    setTimeout(() => {
      if (my !== token) return finish();
      window.speechSynthesis.speak(u);
    }, 40);
  });
}

export function playFile(name) {
  stopSpeech();
  return new Promise((resolve) => {
    const a = new Audio(mediaUrl(name));
    a.volume = settings().volume ?? 1;
    currentAudio = a;
    let done = false;
    // Devuelve true si el audio sonó hasta el final y false si no se pudo reproducir.
    const finish = (ok) => { if (!done) { done = true; resolve(ok); } };
    a.onended = () => finish(true);
    a.onerror = () => finish(false);
    a.play().catch(() => finish(false));
  });
}

// Reproduce lo que "dice" algo: grabación si existe, si no la voz sintética.
export function sayThing(obj) {
  if (!obj) return Promise.resolve();
  if (obj.audio) return playFile(obj.audio);
  return speak(obj.say || obj.text || '', { lang: obj.lang });
}

export function cardSpeech(card) {
  if (!card) return '';
  return card.say || card.text || '';
}

const PRAISE = ['¡Muy bien!', '¡Genial!', '¡Excelente!', '¡Lo lograste!', '¡Fantástico!', '¡Bravo!', '¡Increíble!', '¡Así se hace!'];
const PRAISE_NAMED = ['¡Muy bien, {n}!', '¡Bravo, {n}!', '¡Eres un campeón, {n}!', '¡Qué bien lo haces, {n}!'];
const RETRY = ['¡Casi! Inténtalo otra vez', 'Mmm, prueba con otra', '¡Tú puedes! Otra vez', 'Esa no es. ¡Sigue intentando!'];

export function praiseText(name) {
  if (name && Math.random() < 0.4) return pick(PRAISE_NAMED).replace('{n}', name);
  return pick(PRAISE);
}

export const retryText = () => pick(RETRY);

// Felicitación: usa las grabaciones de papá si hay.
export function sayPraise(name) {
  const rec = settings().praiseAudios || [];
  if (rec.length && Math.random() < 0.7) return { text: '¡Muy bien!', promise: playFile(pick(rec)) };
  const text = praiseText(name);
  return { text, promise: speak(text) };
}

export function sayRetry() {
  const rec = settings().retryAudios || [];
  if (rec.length && Math.random() < 0.7) return { text: '¡Casi!', promise: playFile(pick(rec)) };
  const text = retryText();
  return { text, promise: speak(text) };
}
