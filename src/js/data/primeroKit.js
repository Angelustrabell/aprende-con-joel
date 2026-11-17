// Herramientas para escribir el temario de primero con poco código: tarjetas, preguntas y sesiones.
import { uid, shuffle, pick } from '../core/util.js';
import { card } from '../core/card.js';
import { A, P, sess, take, withCorrect } from './templates.js';

export { take, shuffle, pick };

// ----- tarjetas -----
export const em = (e, t = '', say = '', extra = {}) => card(e, t, say || t, extra);     // dibujo (emoji) con texto opcional
export const tx = (t, say = '', extra = {}) => card('', String(t), say || String(t), extra); // solo texto
export const en = (e, word) => card(e, word, word, { lang: 'en' });                      // inglés: dibujo + palabra
export const enTx = (word) => card('', word, word, { lang: 'en' });                      // inglés: solo la palabra
export const num = (n) => tx(String(n), String(n));

// ----- actividades -----
// choose: toca la correcta. right = tarjeta correcta, wrong = tarjetas incorrectas, target = tarjeta de pregunta (opcional)
export function choose(prompt, right, wrong, target = null) {
  const c = withCorrect(right, wrong);
  return A('choose', { prompt: P(prompt), target, options: c.options, correct: [c.correct] });
}
// listen: suena algo y hay que tocar la tarjeta. sound = { say, lang } si no es lo que dice la tarjeta correcta.
export function listen(prompt, right, wrong, sound = null) {
  const c = withCorrect(right, wrong);
  return A('listen', { prompt: P(prompt), options: c.options, correct: c.correct, sound: sound ? { audio: '', ...sound } : { say: '', audio: '' } });
}
export const view = (say, c) => A('view', { prompt: P(say), card: c, video: '' });
export const order = (prompt, cards) => A('order', { prompt: P(prompt), items: cards });
export const match = (prompt, pairs) => A('match', { prompt: P(prompt), pairs: pairs.map(([a, b]) => ({ a, b })) });
export const memory = (prompt, cards) => A('memory', { prompt: P(prompt), pairs: cards.map((a) => ({ a, b: null })) });
export const sortBy = (prompt, groups) => A('sort', { prompt: P(prompt), groups: groups.map(([label, items]) => ({ label, items })) });
export const count = (prompt, emoji, name, n, op = 'none', second = 1) => A('count', { prompt: P(prompt), item: card(emoji, '', name), number: n, op, second });
export const trace = (prompt, char) => A('trace', { prompt: P(prompt), char });
export const pattern = (prompt, sequence, extra = []) => A('pattern', { prompt: P(prompt), sequence, extra });
export const reading = (md, size = 'grande') => A('reading', { prompt: P(''), md, narrate: true, size });

// ----- sesiones y mundos -----
export const S = (title, icon, acts) => sess(title, icon, acts.filter(Boolean));
export const world = (title, icon, sessions, opts = {}) => ({ id: uid(), title, icon, sessions: sessions.filter(Boolean), ...opts });

// Verdadero/falso con ✅ y ❌
export const YES = em('✅', 'Sí', 'sí');
export const NO = em('❌', 'No', 'no');
export const yesNo = (prompt, truth, target = null) => choose(prompt, truth ? YES : NO, [truth ? NO : YES], target);

// Los números en palabras (para que la voz los lea bien)
const UNITS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];
const TENS = { 20: 'veinte', 30: 'treinta', 40: 'cuarenta', 50: 'cincuenta', 60: 'sesenta', 70: 'setenta', 80: 'ochenta', 90: 'noventa', 100: 'cien' };
export function words(n) {
  if (n <= 20) return UNITS[n];
  if (TENS[n]) return TENS[n];
  if (n < 30) return ['veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'][n - 21];
  return `${TENS[n - (n % 10)]} y ${UNITS[n % 10]}`;
}

// Números cercanos distintos de n (para las opciones incorrectas)
export function near(n, k = 2, lo = 0, hi = 100, spread = 3) {
  const pool = [];
  for (let d = 1; d <= spread; d++) { if (n - d >= lo) pool.push(n - d); if (n + d <= hi) pool.push(n + d); }
  return take(pool, k);
}

export const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
