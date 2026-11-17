// Plantillas rápidas: generan sesiones completas a partir de unos pocos datos.
import { uid, shuffle, shuffleChanged, pick, range, stripArticle, numberWord } from '../core/util.js';
import { card } from '../core/card.js';
import { emojiName } from './emoji.js';

export const A = (type, data) => ({ id: uid(), type, ...data });
export const P = (say) => ({ say, audio: '' });
export const sess = (title, icon, activities) => ({ id: uid(), title, icon, activities });
export const unitOf = (title, icon, sessions) => ({ id: uid(), title, icon, sessions });

export const take = (arr, n) => shuffle(arr).slice(0, n);

// Opciones mezcladas con la correcta: devuelve { options, correct }.
export function withCorrect(right, wrong) {
  const options = shuffle([right, ...wrong]);
  return { options, correct: options.indexOf(right) };
}

// ======================= LETRAS =======================
export const LETTER_WORDS = {
  A: [['🐝', 'abeja'], ['🌳', 'árbol'], ['✈️', 'avión'], ['💧', 'agua']],
  B: [['🚢', 'barco'], ['🐋', 'ballena'], ['🚲', 'bicicleta'], ['🦉', 'búho']],
  C: [['🏠', 'casa'], ['🐴', 'caballo'], ['🦀', 'cangrejo'], ['🥥', 'coco'], ['🐰', 'conejo']],
  D: [['🐬', 'delfín'], ['🦖', 'dinosaurio'], ['🦷', 'diente'], ['🍩', 'dona']],
  E: [['🐘', 'elefante'], ['⭐', 'estrella'], ['🦔', 'erizo'], ['🧹', 'escoba']],
  F: [['🍓', 'fresa'], ['🔥', 'fuego'], ['🦩', 'flamenco'], ['🌸', 'flor'], ['🦭', 'foca']],
  G: [['🐱', 'gato'], ['🎈', 'globo'], ['🐔', 'gallina'], ['🍪', 'galleta'], ['🐛', 'gusano']],
  H: [['🍦', 'helado'], ['🐜', 'hormiga'], ['🍄', 'hongo'], ['🥚', 'huevo']],
  I: [['🏝️', 'isla'], ['🦎', 'iguana'], ['⛪', 'iglesia'], ['🧲', 'imán']],
  J: [['🦒', 'jirafa'], ['🧃', 'jugo'], ['🧼', 'jabón'], ['🐆', 'jaguar']],
  K: [['🥝', 'kiwi'], ['🐨', 'koala'], ['🛶', 'kayak']],
  L: [['🦁', 'león'], ['🌙', 'luna'], ['📚', 'libro'], ['🍋', 'limón'], ['✏️', 'lápiz']],
  M: [['🍎', 'manzana'], ['🐒', 'mono'], ['🦋', 'mariposa'], ['🏍️', 'moto'], ['🍯', 'miel']],
  N: [['👃', 'nariz'], ['🍊', 'naranja'], ['☁️', 'nube'], ['❄️', 'nieve']],
  Ñ: [['🐃', 'ñu']],
  O: [['🐻', 'oso'], ['👁️', 'ojo'], ['🐑', 'oveja'], ['🌊', 'ola'], ['👂', 'oreja']],
  P: [['🐶', 'perro'], ['🐟', 'pez'], ['🍕', 'pizza'], ['🐧', 'pingüino'], ['⚽', 'pelota'], ['🐙', 'pulpo']],
  Q: [['🧀', 'queso']],
  R: [['🐭', 'ratón'], ['🌹', 'rosa'], ['🤖', 'robot'], ['🐸', 'rana'], ['⌚', 'reloj'], ['🎁', 'regalo']],
  S: [['☀️', 'sol'], ['🐍', 'serpiente'], ['🍉', 'sandía'], ['🪑', 'silla'], ['🎩', 'sombrero']],
  T: [['🐯', 'tigre'], ['🍅', 'tomate'], ['🚂', 'tren'], ['🐢', 'tortuga'], ['🦈', 'tiburón']],
  U: [['🍇', 'uvas'], ['🦄', 'unicornio'], ['1️⃣', 'uno']],
  V: [['🐮', 'vaca'], ['⛵', 'velero'], ['🎻', 'violín'], ['👗', 'vestido'], ['🌋', 'volcán']],
  W: [['🧇', 'waffle']],
  X: [['🎷', 'saxofón']],
  Y: [['🪀', 'yoyó'], ['🛥️', 'yate']],
  Z: [['🦊', 'zorro'], ['🥕', 'zanahoria'], ['👞', 'zapato']],
};
const ALPHABET = Object.keys(LETTER_WORDS);
const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const NO_SYLLABLES = new Set(['H', 'K', 'Q', 'W', 'X', 'Y']);

export function parseLetters(str) {
  const out = [];
  for (const ch of String(str || '').toUpperCase()) {
    if (/[A-ZÑ]/.test(ch) && !out.includes(ch)) out.push(ch);
  }
  return out;
}

function otherLetters(L, pool, n) {
  let cands = pool.filter((x) => x !== L);
  if (cands.length < n) cands = cands.concat(take(ALPHABET.filter((x) => x !== L && !cands.includes(x)), n - cands.length));
  return take(cands, n);
}

function otherWords(L, n) {
  const letters = take(ALPHABET.filter((x) => x !== L && x !== 'X' && LETTER_WORDS[x].length), n);
  const forbidden = new Set((LETTER_WORDS[L] || []).map((w) => w[0]));
  return letters.map((x) => {
    const ok = LETTER_WORDS[x].filter((w) => !forbidden.has(w[0]));
    return pick(ok.length ? ok : LETTER_WORDS[x]);
  });
}

const wordCard = ([e, w]) => card(e, w, w);
const letterCard = (x) => card('', x, x);

function letterSession(L, all, opts) {
  const lower = L.toLowerCase();
  const words = LETTER_WORDS[L] || [];
  const w0 = words[0];
  const acts = [];
  const intro = L === 'X'
    ? 'Esta es la letra X. Suena en saxofón.'
    : `Esta es la letra ${L}.${w0 ? ` ${L}, de ${w0[1]}.` : ''}`;
  acts.push(A('view', { prompt: P(intro), card: card('', `${L} ${lower}`, L), video: '' }));

  const l1 = withCorrect(L, otherLetters(L, all, 2));
  acts.push(A('listen', { prompt: P(`Escucha. ¿Cuál es la ${L}?`), options: l1.options.map(letterCard), correct: l1.correct, sound: { say: '', audio: '' } }));

  if (words.length && L !== 'X') {
    const right = pick(words);
    const c = withCorrect(right, otherWords(L, 2));
    acts.push(A('choose', { prompt: P(`¿Qué empieza con ${L}?`), target: letterCard(L), options: c.options.map(wordCard), correct: [c.correct] }));
  }

  acts.push(A('trace', { prompt: P(`Traza la ${L} grande`), char: L }));
  if (opts.lowercase !== false && lower !== L) acts.push(A('trace', { prompt: P(`Ahora traza la ${L} pequeña`), char: lower }));

  if (opts.syllables && !VOWELS.includes(L) && !NO_SYLLABLES.has(L)) {
    const syl = ['a', 'e', 'i', 'o', 'u'].map((v) => lower + v);
    const target = pick(syl);
    const s = withCorrect(target, take(syl.filter((x) => x !== target), 2));
    acts.push(A('listen', { prompt: P(`¿Cuál dice ${target}?`), options: s.options.map((x) => card('', x, x)), correct: s.correct, sound: { say: '', audio: '' } }));
  }

  const known = all.slice(0, all.indexOf(L) + 1).filter((x) => x !== L && x !== 'X' && LETTER_WORDS[x]?.length);
  if (known.length >= 1 && L !== 'X' && words.length) {
    const set = [L, ...take(known, 2)];
    acts.push(A('match', {
      prompt: P('Une cada letra con su dibujo'),
      pairs: set.map((x) => ({ a: letterCard(x), b: wordCard(LETTER_WORDS[x][0]) })),
    }));
  }
  return sess(`Letra ${L}`, L, acts);
}

function lettersReview(all) {
  const usable = all.filter((x) => x !== 'X' && LETTER_WORDS[x]?.length);
  const acts = [];
  if (all.length <= 6) {
    const sorted = ALPHABET.filter((x) => all.includes(x));
    acts.push(A('order', {
      prompt: P(VOWELS.every((v) => all.includes(v)) && all.length === 5 ? 'Ordena las vocales: a, e, i, o, u' : 'Ordena las letras como en el abecedario'),
      items: sorted.map(letterCard),
    }));
  }
  if (usable.length >= 2) {
    const [g1, g2] = take(usable, 2);
    acts.push(A('sort', {
      prompt: P(`¿Empieza con ${g1} o con ${g2}?`),
      groups: [g1, g2].map((g) => ({ label: letterCard(g), items: take(LETTER_WORDS[g], 2).map(wordCard) })),
    }));
    acts.push(A('memory', {
      prompt: P('Encuentra cada letra con su dibujo'),
      pairs: take(usable, Math.min(4, usable.length)).map((x) => ({ a: letterCard(x), b: wordCard(LETTER_WORDS[x][0]) })),
    }));
  }
  for (const L of take(all, Math.min(2, all.length))) {
    const l = withCorrect(L, otherLetters(L, all, 3));
    acts.push(A('listen', { prompt: P(`¿Dónde está la ${L}?`), options: l.options.map(letterCard), correct: l.correct, sound: { say: '', audio: '' } }));
  }
  return sess('Repaso de letras', '⭐', acts);
}

export function letterSessions(letters, opts = {}) {
  const out = letters.map((L) => letterSession(L, letters, opts));
  if (opts.review !== false && letters.length >= 2) out.push(lettersReview(letters));
  return out;
}

// ======================= NÚMEROS =======================
export const COUNT_ITEMS = [
  ['🍎', 'manzana', 'manzanas', 'f'], ['🐞', 'mariquita', 'mariquitas', 'f'], ['⭐', 'estrella', 'estrellas', 'f'],
  ['🐟', 'pez', 'peces', 'm'], ['🚗', 'carro', 'carros', 'm'], ['🎈', 'globo', 'globos', 'm'],
  ['🍪', 'galleta', 'galletas', 'f'], ['🐥', 'pollito', 'pollitos', 'm'], ['🌸', 'flor', 'flores', 'f'],
  ['⚽', 'pelota', 'pelotas', 'f'], ['🦆', 'pato', 'patos', 'm'], ['🍓', 'fresa', 'fresas', 'f'],
];
const howMany = (g) => (g === 'f' ? 'Cuántas' : 'Cuántos');

function numberDistractors(n, lo, hi, k = 2) {
  const near = range(Math.max(lo, n - 3), Math.min(hi, n + 3)).filter((x) => x !== n);
  const pool = near.length >= k ? near : range(lo, hi).filter((x) => x !== n);
  return take(pool, k);
}

const groupText = (e, n) => e.repeat(n);

function numberSession(n, lo, hi) {
  const [e, sing, plur, g] = pick(COUNT_ITEMS);
  const acts = [];
  acts.push(A('view', { prompt: P(`Este es el número ${n}. ${numberWord(n)}.`), card: card('', String(n), String(n)), video: '' }));
  acts.push(A('count', { prompt: P(`¿${howMany(g)} ${plur} hay? Tócalos para contar.`), item: card(e, '', sing), number: n, op: 'none', second: 1 }));
  const l = withCorrect(n, numberDistractors(n, Math.max(1, lo - 2), Math.max(10, hi)));
  acts.push(A('listen', { prompt: P(`¿Cuál es el número ${n}?`), options: l.options.map((x) => card('', String(x), String(x))), correct: l.correct, sound: { say: '', audio: '' } }));
  acts.push(A('trace', { prompt: P(`Traza el número ${n}`), char: String(n) }));
  if (n <= 6) {
    const [e2] = pick(COUNT_ITEMS);
    const c = withCorrect(n, numberDistractors(n, 1, 7));
    acts.push(A('choose', { prompt: P(`¿Dónde hay ${n}?`), target: card('', String(n), String(n)), options: c.options.map((x) => card('', groupText(e2, x), String(x))), correct: [c.correct] }));
  }
  return sess(`Número ${n}`, String(n), acts);
}

function numbersReview(lo, hi) {
  const acts = [];
  const nums = range(lo, hi);
  const seq = nums.length <= 6 ? nums : (() => { const s = pick(range(lo, hi - 4)); return range(s, s + 4); })();
  acts.push(A('order', { prompt: P('Ordena los números, del más pequeño al más grande'), items: seq.map((x) => card('', String(x), String(x))) }));
  const [e] = pick(COUNT_ITEMS);
  const small = nums.filter((x) => x <= 6);
  if (small.length >= 2) {
    acts.push(A('match', {
      prompt: P('Une cada número con su grupo'),
      pairs: take(small, Math.min(3, small.length)).map((x) => ({ a: card('', String(x), String(x)), b: card('', groupText(e, x), String(x)) })),
    }));
  }
  acts.push(A('memory', {
    prompt: P('Encuentra las parejas de números'),
    pairs: take(nums, Math.min(4, nums.length)).map((x) => ({ a: card('', String(x), String(x)), b: null })),
  }));
  const [e3, s3, p3, g3] = pick(COUNT_ITEMS);
  const n = pick(nums);
  acts.push(A('count', { prompt: P(`¿${howMany(g3)} ${p3} hay?`), item: card(e3, '', s3), number: n, op: 'none', second: 1 }));
  return sess('Repaso de números', '⭐', acts);
}

export function numberSessions(lo, hi, opts = {}) {
  lo = Math.max(0, Math.min(lo, hi));
  hi = Math.min(20, Math.max(lo, hi));
  const out = range(lo, hi).filter((n) => n > 0).map((n) => numberSession(n, lo, hi));
  if (opts.review !== false && hi - lo >= 1) out.push(numbersReview(Math.max(1, lo), hi));
  return out;
}

// ======================= SUMAS Y RESTAS =======================
export function mathSession(op, max = 5, count = 5) {
  const acts = [];
  for (let i = 0; i < count; i++) {
    const [e, sing, plur, g] = pick(COUNT_ITEMS);
    let a;
    let b;
    if (op === 'sub') {
      a = 2 + Math.floor(Math.random() * Math.max(1, max - 1));
      b = 1 + Math.floor(Math.random() * (a - 1));
      acts.push(A('count', { prompt: P(`Hay ${a} ${a === 1 ? sing : plur}. Quitamos ${b}. ¿${howMany(g)} quedan?`), item: card(e, '', sing), number: a, op: 'sub', second: b }));
    } else {
      a = 1 + Math.floor(Math.random() * Math.max(1, max - 1));
      b = 1 + Math.floor(Math.random() * Math.max(1, max - a));
      acts.push(A('count', { prompt: P(`${a} y ${b} más. ¿${howMany(g)} ${plur} hay en total?`), item: card(e, '', sing), number: a, op: 'add', second: b }));
    }
  }
  return sess(op === 'sub' ? `Restas hasta ${max}` : `Sumas hasta ${max}`, op === 'sub' ? '➖' : '➕', acts);
}

// ======================= VOCABULARIO =======================
const segmenter = new Intl.Segmenter('es', { granularity: 'grapheme' });
const EMOJI_RE = /\p{Extended_Pictographic}|\p{Regional_Indicator}|^\d️?⃣/u;

export function parseVocab(text) {
  const out = [];
  for (let line of String(text || '').split(/\r?\n/)) {
    line = line.trim();
    if (!line) continue;
    const first = [...segmenter.segment(line)][0].segment;
    if (EMOJI_RE.test(first)) {
      const phrase = line.slice(first.length).trim() || emojiName(first);
      out.push({ emoji: first, phrase });
    } else {
      out.push({ emoji: '', phrase: line });
    }
  }
  return out;
}

const hasArticle = (p) => /^(el|la|los|las|un|una)\s/i.test(p);
const vocabCard = (v) => card(v.emoji, stripArticle(v.phrase), v.phrase);

export function vocabSessions(theme, items, opts = {}) {
  if (items.length < 2) return [];
  const chunks = [];
  if (items.length <= 6) chunks.push(items);
  else for (let i = 0; i < items.length; i += 4) chunks.push(items.slice(i, i + 4));
  // Evitar un último grupo de una sola palabra.
  if (chunks.length > 1 && chunks[chunks.length - 1].length === 1) chunks[chunks.length - 2].push(chunks.pop()[0]);

  const sessions = chunks.map((chunk, ci) => {
    const acts = [];
    for (const v of chunk) {
      acts.push(A('view', { prompt: P(`¡Mira! ${v.phrase}.`), card: vocabCard(v), video: '' }));
    }
    for (const v of shuffle(chunk)) {
      const others = take(items.filter((x) => x !== v), 2);
      const l = withCorrect(v, others);
      acts.push(A('listen', {
        prompt: P(hasArticle(v.phrase) ? `¿Dónde está ${v.phrase}?` : `Toca: ${v.phrase}`),
        options: l.options.map(vocabCard), correct: l.correct, sound: { say: '', audio: '' },
      }));
    }
    if (opts.reading && chunk.length >= 2) {
      acts.push(A('match', {
        prompt: P('Une cada dibujo con su palabra'),
        pairs: take(chunk, Math.min(4, chunk.length)).map((v) => ({ a: card(v.emoji, '', v.phrase), b: card('', stripArticle(v.phrase), v.phrase) })),
      }));
    }
    if (chunk.length >= 2) {
      acts.push(A('memory', { prompt: P('Encuentra las parejas'), pairs: take(chunk, Math.min(4, chunk.length)).map((v) => ({ a: vocabCard(v), b: null })) }));
    }
    const title = chunks.length > 1 ? `${theme} ${ci + 1}` : theme;
    return sess(title, chunk[0].emoji || '📖', acts);
  });

  if (chunks.length > 1) {
    const acts = [];
    for (const v of take(items, 4)) {
      const l = withCorrect(v, take(items.filter((x) => x !== v), 3));
      acts.push(A('listen', { prompt: P(hasArticle(v.phrase) ? `¿Dónde está ${v.phrase}?` : `Toca: ${v.phrase}`), options: l.options.map(vocabCard), correct: l.correct, sound: { say: '', audio: '' } }));
    }
    acts.push(A('memory', { prompt: P('Encuentra las parejas'), pairs: take(items, 4).map((v) => ({ a: vocabCard(v), b: null })) }));
    sessions.push(sess(`Repaso: ${theme}`, '⭐', acts));
  }
  return sessions;
}

// ======================= COLORES =======================
export const COLOR_DATA = [
  { name: 'rojo', hex: '#e53935', objects: [['🍎', 'la manzana'], ['🍓', 'la fresa'], ['🍅', 'el tomate'], ['🚒', 'el camión de bomberos']] },
  { name: 'azul', hex: '#1e88e5', objects: [['🐳', 'la ballena'], ['🫐', 'los arándanos'], ['💙', 'el corazón azul'], ['🧢', 'la gorra']] },
  { name: 'amarillo', hex: '#fdd835', objects: [['🍌', 'el plátano'], ['🌻', 'el girasol'], ['🐥', 'el pollito'], ['🌽', 'el maíz']] },
  { name: 'verde', hex: '#43a047', objects: [['🐸', 'la rana'], ['🥦', 'el brócoli'], ['🍏', 'la manzana verde'], ['🐢', 'la tortuga']] },
  { name: 'naranja', hex: '#fb8c00', objects: [['🍊', 'la naranja'], ['🥕', 'la zanahoria'], ['🎃', 'la calabaza'], ['🦊', 'el zorro']] },
  { name: 'morado', hex: '#8e24aa', objects: [['🍇', 'las uvas'], ['🍆', 'la berenjena'], ['💜', 'el corazón morado'], ['☂️', 'el paraguas']] },
  { name: 'rosa', hex: '#ec407a', objects: [['🌸', 'la flor'], ['🐷', 'el cerdito'], ['🦩', 'el flamenco'], ['🎀', 'el moño']] },
  { name: 'marrón', hex: '#795548', objects: [['🐻', 'el oso'], ['🍫', 'el chocolate'], ['🌰', 'la castaña'], ['🥔', 'la papa']] },
  { name: 'negro', hex: '#212121', objects: [['🎱', 'la bola'], ['🕷️', 'la araña'], ['🎩', 'el sombrero']] },
  { name: 'blanco', hex: '#ffffff', objects: [['☁️', 'la nube'], ['⛄', 'el muñeco de nieve'], ['🥚', 'el huevo'], ['🐑', 'la oveja']] },
];
const colorByName = (n) => COLOR_DATA.find((c) => c.name === n);
const swatch = (c, withText = false) => card('', withText ? c.name : '', c.name, { color: c.hex });
const objCard = ([e, p]) => card(e, '', p);

function colorSession(c, chosen) {
  const others = chosen.filter((x) => x !== c);
  const pool = others.length >= 2 ? others : COLOR_DATA.filter((x) => x !== c);
  const acts = [];
  const ex = c.objects[0];
  acts.push(A('view', { prompt: P(`Este es el color ${c.name}. Como ${ex[1]}.`), card: swatch(c, true), video: '' }));
  const l = withCorrect(c, take(pool, 2));
  acts.push(A('listen', { prompt: P(`¿Cuál es el ${c.name}?`), options: l.options.map((x) => swatch(x)), correct: l.correct, sound: { say: '', audio: '' } }));
  for (const obj of take(c.objects, 2)) {
    const wrong = take(pool, 2).map((x) => pick(x.objects));
    const ch = withCorrect(obj, wrong);
    acts.push(A('choose', { prompt: P(`Toca algo de color ${c.name}`), target: swatch(c), options: ch.options.map(objCard), correct: [ch.correct] }));
  }
  return sess(`Color ${c.name}`, colorIcon(c), acts);
}

const COLOR_ICONS = { rojo: '🔴', azul: '🔵', amarillo: '🟡', verde: '🟢', naranja: '🟠', morado: '🟣', rosa: '🌸', marrón: '🟤', negro: '⚫', blanco: '⚪' };
const colorIcon = (c) => COLOR_ICONS[c.name] || '🎨';

function colorsReview(chosen) {
  const acts = [];
  const [a, b] = take(chosen, 2);
  acts.push(A('sort', {
    prompt: P(`Pon cada cosa en su color: ${a.name} o ${b.name}`),
    groups: [a, b].map((c) => ({ label: swatch(c, true), items: take(c.objects, 2).map(objCard) })),
  }));
  acts.push(A('memory', { prompt: P('Encuentra las parejas de colores'), pairs: take(chosen, Math.min(4, chosen.length)).map((c) => ({ a: swatch(c), b: null })) }));
  const [x, y] = take(chosen, 2);
  const seq = [x, y, x, y, x, y].map((c) => swatch(c));
  acts.push(A('pattern', { prompt: P('¿Qué color viene después?'), sequence: seq, extra: chosen.length > 2 ? [swatch(chosen.find((c) => c !== x && c !== y))] : [] }));
  for (const c of take(chosen, 2)) {
    const l = withCorrect(c, take(chosen.filter((z) => z !== c), Math.min(3, chosen.length - 1)));
    acts.push(A('listen', { prompt: P(`¿Dónde está el ${c.name}?`), options: l.options.map((z) => swatch(z)), correct: l.correct, sound: { say: '', audio: '' } }));
  }
  return sess('Repaso de colores', '🌈', acts);
}

export function colorSessions(names, opts = {}) {
  const chosen = names.map(colorByName).filter(Boolean);
  const out = chosen.map((c) => colorSession(c, chosen)).filter(Boolean);
  if (opts.review !== false && chosen.length >= 2) out.push(colorsReview(chosen));
  return out;
}

// ======================= FORMAS =======================
export const SHAPES = [
  { name: 'círculo', phrase: 'el círculo', emoji: '🔵', objects: [['⚽', 'la pelota'], ['🍪', 'la galleta'], ['🕐', 'el reloj'], ['🍩', 'la dona']] },
  { name: 'cuadrado', phrase: 'el cuadrado', emoji: '🟥', objects: [['🎁', 'el regalo'], ['🧇', 'el waffle'], ['🖼️', 'el cuadro'], ['🔲', 'el botón']] },
  { name: 'triángulo', phrase: 'el triángulo', emoji: '🔺', objects: [['🍕', 'la pizza'], ['⛺', 'la carpa'], ['📐', 'la escuadra'], ['🔻', 'la señal']] },
  { name: 'estrella', phrase: 'la estrella', emoji: '⭐', objects: [['🌟', 'la estrella brillante'], ['✴️', 'la estrella naranja'], ['🎖️', 'la medalla']] },
  { name: 'corazón', phrase: 'el corazón', emoji: '❤️', objects: [['💝', 'la caja de corazón'], ['💚', 'el corazón verde'], ['💌', 'la carta de amor']] },
  { name: 'rombo', phrase: 'el rombo', emoji: '🔷', objects: [['🪁', 'la cometa'], ['💎', 'el diamante'], ['🔶', 'el rombo naranja']] },
];

export function shapeSessions(names) {
  const chosen = SHAPES.filter((s) => names.includes(s.name));
  if (chosen.length < 2) return [];
  const shapeCard = (s) => card(s.emoji, s.name, s.phrase);
  const acts1 = chosen.map((s) => A('view', { prompt: P(`Este es ${s.phrase}.`), card: shapeCard(s), video: '' }));
  for (const s of chosen) {
    const l = withCorrect(s, take(chosen.filter((x) => x !== s), 2));
    acts1.push(A('listen', { prompt: P(`¿Dónde está ${s.phrase}?`), options: l.options.map((x) => card(x.emoji, '', x.phrase)), correct: l.correct, sound: { say: '', audio: '' } }));
  }
  const acts2 = [];
  for (const s of take(chosen, Math.min(4, chosen.length))) {
    const wrong = take(chosen.filter((x) => x !== s), 2).map((x) => pick(x.objects));
    const c = withCorrect(pick(s.objects), wrong);
    acts2.push(A('choose', { prompt: P(`¿Qué tiene forma de ${s.name}?`), target: card(s.emoji, '', s.phrase), options: c.options.map(objCard), correct: [c.correct] }));
  }
  const [a, b] = take(chosen, 2);
  acts2.push(A('sort', {
    prompt: P(`¿${a.name} o ${b.name}? Ponlos en su lugar`),
    groups: [a, b].map((s) => ({ label: card(s.emoji, s.name, s.phrase), items: take(s.objects, 2).map(objCard) })),
  }));
  acts2.push(A('memory', { prompt: P('Encuentra las parejas de formas'), pairs: take(chosen, Math.min(4, chosen.length)).map((s) => ({ a: card(s.emoji, '', s.phrase), b: null })) }));
  return [sess('Las formas', '🔷', acts1), sess('Formas a mi alrededor', '🔺', acts2)];
}

// ======================= PATRONES =======================
const PATTERN_KINDS = [[0, 1], [0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 2], [0, 0, 1, 1]];

export function patternSession(emojis, count = 5) {
  const items = [...new Set(emojis)].filter(Boolean);
  if (items.length < 2) return null;
  const acts = [];
  for (let i = 0; i < count; i++) {
    const kinds = PATTERN_KINDS.filter((k) => Math.max(...k) < items.length);
    const kind = kinds[Math.min(kinds.length - 1, Math.floor((i / Math.max(1, count - 1)) * (kinds.length - 1) + Math.random() * 1.2))];
    const chosen = take(items, Math.max(...kind) + 1);
    const unit = kind.map((k) => chosen[k]);
    const len = Math.max(6, unit.length + 3) + Math.floor(Math.random() * 2);
    const seq = range(0, len - 1).map((j) => unit[j % unit.length]);
    const unused = items.filter((x) => !chosen.includes(x));
    const extraEmoji = unused.length ? pick(unused) : null;
    acts.push(A('pattern', {
      prompt: P('¿Qué viene después?'),
      sequence: seq.map((e) => card(e, '', emojiName(e))),
      extra: extraEmoji ? [card(extraEmoji, '', emojiName(extraEmoji))] : [],
    }));
  }
  return sess('Patrones', '🔁', acts);
}

// ======================= EMOCIONES =======================
export const EMOTIONS = [
  { e: '😀', name: 'feliz', view: 'Cuando juego con mis amigos, me siento feliz.', scene: 'Te dan un regalo. ¿Cómo te sientes?' },
  { e: '😢', name: 'triste', view: 'Cuando se rompe mi juguete, me siento triste.', scene: 'Se te cayó el helado al suelo. ¿Cómo te sientes?' },
  { e: '😠', name: 'enojado', view: 'Cuando alguien me quita mis cosas, me siento enojado.', scene: 'Alguien rompió tu dibujo. ¿Cómo te sientes?' },
  { e: '😨', name: 'asustado', view: 'Cuando hay una tormenta fuerte, me siento asustado.', scene: 'Escuchas un trueno muy fuerte. ¿Cómo te sientes?' },
  { e: '😲', name: 'sorprendido', view: 'Cuando pasa algo que no esperaba, me siento sorprendido.', scene: 'Un mago saca un conejo de su sombrero. ¿Cómo te sientes?' },
  { e: '😴', name: 'cansado', view: 'Después de correr mucho, me siento cansado.', scene: 'Jugaste todo el día y ya es de noche. ¿Cómo te sientes?' },
];

export function emotionsSession(names) {
  const chosen = EMOTIONS.filter((x) => names.includes(x.name));
  if (chosen.length < 2) return null;
  const face = (x) => card(x.e, x.name, x.name);
  const acts = chosen.map((x) => A('view', { prompt: P(x.view), card: face(x), video: '' }));
  for (const x of take(chosen, Math.min(3, chosen.length))) {
    const l = withCorrect(x, take(chosen.filter((y) => y !== x), Math.min(2, chosen.length - 1)));
    acts.push(A('listen', { prompt: P(`¿Quién está ${x.name}?`), options: l.options.map((y) => card(y.e, '', y.name)), correct: l.correct, sound: { say: '', audio: '' } }));
  }
  for (const x of take(chosen, Math.min(3, chosen.length))) {
    const c = withCorrect(x, take(chosen.filter((y) => y !== x), Math.min(2, chosen.length - 1)));
    acts.push(A('choose', { prompt: P(x.scene), target: null, options: c.options.map((y) => card(y.e, '', y.name)), correct: [c.correct] }));
  }
  acts.push(A('memory', { prompt: P('Encuentra las caras iguales'), pairs: take(chosen, Math.min(4, chosen.length)).map((x) => ({ a: card(x.e, '', x.name), b: null })) }));
  return sess('Mis emociones', '😀', acts);
}

// ======================= RUTINAS (ORDENAR) =======================
export const DEFAULT_ROUTINE = '🛏️ me despierto\n🪥 me lavo los dientes\n👕 me visto\n🥣 desayuno\n🎒 voy a la escuela';

export function routineSession(title, text) {
  const steps = parseVocab(text).slice(0, 6);
  if (steps.length < 2) return null;
  const stepCard = (s) => card(s.emoji, '', s.phrase);
  const acts = [];
  acts.push(A('view', { prompt: P(`Primero, ${steps[0].phrase}. Después, ${steps[1].phrase}.`), card: stepCard(steps[0]), video: '' }));
  acts.push(A('order', { prompt: P('Ordena: ¿qué va primero, qué va después?'), items: steps.map(stepCard) }));
  if (steps.length >= 3) {
    for (const j of take(range(0, steps.length - 2), 2)) {
      const right = steps[j + 1];
      const wrong = take(steps.filter((s, k) => k !== j + 1 && k !== j), 2);
      const c = withCorrect(right, wrong);
      acts.push(A('choose', { prompt: P(`Después de: ${steps[j].phrase}. ¿Qué va?`), target: stepCard(steps[j]), options: c.options.map(stepCard), correct: [c.correct] }));
    }
  }
  return sess(title || 'Mi rutina', steps[0].emoji || '🪜', acts);
}

// ======================= COLOREAR =======================
export function paintSession(title, pages, icon = '🖍️') {
  return sess(title, icon, pages.map((p) => (p === 'libre'
    ? A('paint', { prompt: P('¡Dibuja lo que quieras!'), builtin: '', image: '' })
    : A('paint', { prompt: P('¡Vamos a colorear! Toca un color y luego el dibujo.'), builtin: p, image: '' }))));
}

// ======================= CATÁLOGO PARA LA INTERFAZ =======================
const opt = (list) => list.map((x) => ({ value: x, label: x }));

export const TEMPLATES = [
  {
    id: 'letters', name: 'Letras', icon: '🔤',
    desc: 'Una sesión por letra: presentación, escuchar, ¿qué empieza con…?, trazar, sílabas y unir. Con repaso final.',
    fields: [
      { key: 'letters', label: 'Letras (ej.: A E I O U, o M P S L)', type: 'text', value: 'M P S L' },
      { key: 'lowercase', label: 'Trazar también la minúscula', type: 'check', value: true },
      { key: 'syllables', label: 'Sílabas con vocales (ma, me, mi…)', type: 'check', value: true },
      { key: 'review', label: 'Sesión de repaso al final', type: 'check', value: true },
    ],
    unit: () => ({ title: 'Letras', icon: '🔤' }),
    build: (v) => letterSessions(parseLetters(v.letters), v),
  },
  {
    id: 'numbers', name: 'Números', icon: '🔢',
    desc: 'Una sesión por número: presentarlo, contar, escuchar, trazar y grupos. Con repaso final.',
    fields: [
      { key: 'from', label: 'Desde', type: 'number', value: 1, min: 1, max: 20 },
      { key: 'to', label: 'Hasta', type: 'number', value: 5, min: 1, max: 20 },
      { key: 'review', label: 'Sesión de repaso al final', type: 'check', value: true },
    ],
    unit: (v) => ({ title: `Números del ${v.from} al ${v.to}`, icon: '🔢' }),
    build: (v) => numberSessions(Number(v.from), Number(v.to), v),
  },
  {
    id: 'vocab', name: 'Palabras e imágenes', icon: '📖',
    desc: 'Escribe una palabra por línea con su emoji (ej.: 🐶 el perro). Crea láminas, escuchar, memoria y repaso.',
    fields: [
      { key: 'theme', label: 'Tema', type: 'text', value: 'La granja' },
      { key: 'words', label: 'Palabras (una por línea: emoji + palabra)', type: 'textarea', value: '🐮 la vaca\n🐷 el cerdo\n🐔 la gallina\n🐴 el caballo\n🐑 la oveja\n🦆 el pato' },
      { key: 'reading', label: 'Incluir unir dibujo con palabra escrita (lectura)', type: 'check', value: false },
    ],
    unit: (v) => ({ title: v.theme || 'Vocabulario', icon: '📖' }),
    build: (v) => vocabSessions(v.theme || 'Palabras', parseVocab(v.words), v),
  },
  {
    id: 'colors', name: 'Colores', icon: '🎨',
    desc: 'Una sesión por color con láminas, escuchar y buscar cosas de ese color. Repaso con clasificar, memoria y patrón.',
    fields: [
      { key: 'colors', label: 'Colores', type: 'multi', options: opt(COLOR_DATA.map((c) => c.name)), value: ['rojo', 'azul', 'amarillo', 'verde'] },
      { key: 'review', label: 'Sesión de repaso al final', type: 'check', value: true },
    ],
    unit: () => ({ title: 'Colores', icon: '🎨' }),
    build: (v) => colorSessions(v.colors || [], v),
  },
  {
    id: 'shapes', name: 'Formas', icon: '🔷',
    desc: 'Dos sesiones: conocer las formas y encontrarlas en objetos.',
    fields: [{ key: 'shapes', label: 'Formas', type: 'multi', options: opt(SHAPES.map((s) => s.name)), value: ['círculo', 'cuadrado', 'triángulo', 'estrella'] }],
    unit: () => ({ title: 'Formas', icon: '🔷' }),
    build: (v) => shapeSessions(v.shapes || []),
  },
  {
    id: 'patterns', name: 'Patrones', icon: '🔁',
    desc: 'Series que se repiten (AB, AAB, ABC…) que van subiendo de dificultad.',
    fields: [
      { key: 'emojis', label: 'Emojis a usar (2 o más)', type: 'text', value: '🍎🍌🍇🍓' },
      { key: 'count', label: 'Cuántas actividades', type: 'number', value: 6, min: 2, max: 12 },
    ],
    unit: () => ({ title: 'Patrones', icon: '🔁' }),
    build: (v) => [patternSession([...segmenter.segment(v.emojis || '')].map((s) => s.segment).filter((s) => EMOJI_RE.test(s)), Number(v.count) || 5)].filter(Boolean),
  },
  {
    id: 'math', name: 'Sumas y restas', icon: '➕',
    desc: 'Problemas con dibujos para contar: sumas o restas pequeñas.',
    fields: [
      { key: 'op', label: 'Operación', type: 'select', options: [{ value: 'add', label: 'Sumas' }, { value: 'sub', label: 'Restas' }], value: 'add' },
      { key: 'max', label: 'Número máximo', type: 'number', value: 5, min: 2, max: 10 },
      { key: 'count', label: 'Cuántas actividades', type: 'number', value: 5, min: 2, max: 12 },
    ],
    unit: () => ({ title: 'Sumas y restas', icon: '➕' }),
    build: (v) => [mathSession(v.op, Number(v.max) || 5, Number(v.count) || 5)],
  },
  {
    id: 'emotions', name: 'Emociones', icon: '😀',
    desc: 'Conocer las emociones con caras y situaciones de la vida diaria.',
    fields: [{ key: 'emotions', label: 'Emociones', type: 'multi', options: opt(EMOTIONS.map((x) => x.name)), value: EMOTIONS.map((x) => x.name) }],
    unit: () => ({ title: 'Emociones', icon: '😀' }),
    build: (v) => [emotionsSession(v.emotions || [])].filter(Boolean),
  },
  {
    id: 'routine', name: 'Rutina / secuencia', icon: '🪜',
    desc: 'Pasos en orden (una línea por paso, con emoji). Para rutinas, cuentos o procesos.',
    fields: [
      { key: 'title', label: 'Título', type: 'text', value: 'Mi mañana' },
      { key: 'steps', label: 'Pasos en orden (emoji + texto)', type: 'textarea', value: DEFAULT_ROUTINE },
    ],
    unit: () => ({ title: 'Rutinas', icon: '🪜' }),
    build: (v) => [routineSession(v.title, v.steps)].filter(Boolean),
  },
  {
    id: 'paint', name: 'Colorear', icon: '🖍️',
    desc: 'Láminas para colorear incluidas en la app, y dibujo libre.',
    fields: [{ key: 'pages', label: 'Láminas', type: 'multi', options: [...['sol', 'casa', 'pez', 'mariposa', 'carro', 'flor', 'helado', 'cohete'].map((x) => ({ value: x, label: x })), { value: 'libre', label: 'dibujo libre' }], value: ['sol', 'casa', 'pez'] }],
    unit: () => ({ title: 'Arte', icon: '🖍️' }),
    build: (v) => [paintSession('Colorear', v.pages || [])].filter((s) => s.activities.length),
  },
];

// ======================= CURSO DE EJEMPLO =======================
export function seedCourse() {
  return {
    id: uid(),
    title: 'Mi primer curso',
    icon: '🌟',
    color: '#6c4cf5',
    visible: true,
    units: [
      unitOf('Las vocales', '🔤', letterSessions(VOWELS, { lowercase: true, syllables: false, review: true })),
      unitOf('Números del 1 al 5', '🔢', numberSessions(1, 5, { review: true })),
      unitOf('Colores', '🎨', colorSessions(['rojo', 'azul', 'amarillo', 'verde'], { review: true })),
      unitOf('Animales', '🐾', vocabSessions('Animales', parseVocab('🐶 el perro\n🐱 el gato\n🐮 la vaca\n🐷 el cerdo\n🐔 la gallina\n🐴 el caballo\n🦁 el león\n🐘 el elefante'), {})),
      unitOf('Formas', '🔷', shapeSessions(['círculo', 'cuadrado', 'triángulo', 'estrella'])),
      unitOf('Piensa y juega', '🧩', [
        patternSession(['🍎', '🍌', '🍇', '🍓'], 5),
        emotionsSession(EMOTIONS.map((x) => x.name)),
        routineSession('Mi mañana', DEFAULT_ROUTINE),
        mathSession('add', 5, 5),
      ].filter(Boolean)),
      unitOf('Arte', '🖍️', [
        paintSession('Colorear 1', ['sol', 'casa', 'pez']),
        paintSession('Colorear 2', ['mariposa', 'carro', 'flor']),
        paintSession('Colorear 3', ['helado', 'cohete', 'libre']),
      ]),
    ],
  };
}
