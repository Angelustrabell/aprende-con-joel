// Primero de primaria: Español (lectoescritura) e Inglés.
import { letterSessions, vocabSessions, parseVocab } from './templates.js';
import {
  em, tx, en, enTx, choose, listen, view, order, match, memory, reading, yesNo, S, world, take, shuffle, pick,
} from './primeroKit.js';

// ===================== ESPAÑOL =====================
const WORDS = [
  ['🏠', 'casa', ['ca', 'sa']], ['🐱', 'gato', ['ga', 'to']], ['🦆', 'pato', ['pa', 'to']], ['🌙', 'luna', ['lu', 'na']],
  ['🐸', 'rana', ['ra', 'na']], ['🗺️', 'mapa', ['ma', 'pa']], ['🐶', 'perro', ['pe', 'rro']], ['🐮', 'vaca', ['va', 'ca']],
  ['🛏️', 'cama', ['ca', 'ma']], ['🪑', 'silla', ['si', 'lla']], ['🚪', 'puerta', ['puer', 'ta']], ['🚗', 'carro', ['ca', 'rro']],
  ['📖', 'libro', ['li', 'bro']], ['🌳', 'árbol', ['ár', 'bol']], ['☁️', 'nube', ['nu', 'be']], ['🚢', 'barco', ['bar', 'co']],
  ['⚽', 'pelota', ['pe', 'lo', 'ta']], ['🍅', 'tomate', ['to', 'ma', 'te']], ['🍌', 'plátano', ['plá', 'ta', 'no']], ['🍦', 'helado', ['he', 'la', 'do']],
  ['👕', 'camisa', ['ca', 'mi', 'sa']], ['🦊', 'zorro', ['zo', 'rro']], ['🐰', 'conejo', ['co', 'ne', 'jo']], ['🐴', 'caballo', ['ca', 'ba', 'llo']],
  ['🐢', 'tortuga', ['tor', 'tu', 'ga']], ['🎒', 'mochila', ['mo', 'chi', 'la']], ['✏️', 'lápiz', ['lá', 'piz']], ['⭐', 'estrella', ['es', 'tre', 'lla']],
  ['🦋', 'mariposa', ['ma', 'ri', 'po', 'sa']], ['🍎', 'manzana', ['man', 'za', 'na']], ['🍊', 'naranja', ['na', 'ran', 'ja']], ['🚲', 'bicicleta', ['bi', 'ci', 'cle', 'ta']],
];

function wordSession(i, group) {
  const acts = [];
  for (const [e, w] of group) {
    const others = take(WORDS.filter((x) => x[1] !== w), 2).map((x) => tx(x[1]));
    acts.push(choose('¿Cuál es la palabra de este dibujo?', tx(w), others, em(e, '', w)));
  }
  for (const [, w, syl] of take(group, 2)) {
    if (syl.length >= 2) acts.push(order(`Ordena las sílabas para formar la palabra ${w}`, syl.map((s) => tx(s))));
  }
  const [e3, w3, syl3] = pick(group);
  const options = [1, 2, 3, 4].filter((n) => n !== syl3.length);
  acts.push(choose(`¿Cuántas sílabas tiene la palabra ${w3}?`, tx(String(syl3.length)), take(options, 2).map((n) => tx(String(n))), em(e3, '', w3)));
  return S(`Palabras ${i + 1}`, group[0][0], acts);
}

const RIMAS = [['gato', 'pato', ['luna', 'casa']], ['luna', 'cuna', ['sol', 'mesa']], ['mesa', 'fresa', ['perro', 'gato']], ['pelota', 'bota', ['carro', 'nube']], ['sol', 'col', ['luna', 'flor']]];

function rhymeSession() {
  return S('Juego con rimas', '🎵', RIMAS.map(([a, b, wrong]) => choose(`¿Qué palabra rima con ${a}?`, tx(b), wrong.map((x) => tx(x)), tx(a))));
}

const FRASES = [
  ['🐱', 'El gato duerme.'], ['🐶', 'El perro come.'], ['👧', 'La niña lee un libro.'], ['🌞', 'El sol brilla.'],
  ['🌧️', 'Llueve mucho.'], ['🚗', 'El carro es rojo.'], ['🍎', 'Mamá compra manzanas.'], ['🐟', 'El pez nada.'],
  ['🐦', 'El pájaro vuela.'], ['⚽', 'Juan juega con la pelota.'], ['🌙', 'La luna sale de noche.'], ['🏠', 'Mi casa es bonita.'],
];

const wordsOf = (frase) => frase.replace(/[.,]/g, '').split(' ');

function sentenceSession(i, group) {
  const acts = [];
  for (const [e, f] of group) {
    const others = take(FRASES.filter((x) => x[1] !== f), 2).map((x) => em(x[0]));
    acts.push(choose('Lee la frase y toca el dibujo', em(e), others, tx(f)));
  }
  for (const [, f] of take(group, 3)) {
    const w = wordsOf(f);
    if (new Set(w).size === w.length && w.length >= 3) acts.push(order('Ordena las palabras para formar la frase', w.map((x) => tx(x))));
  }
  return S(`Leo frases ${i + 1}`, '📝', acts);
}

function completeSession() {
  const pool = FRASES.map(([, f]) => f);
  const acts = take(pool, 6).map((f) => {
    const w = wordsOf(f);
    const idx = w.findIndex((x, k) => k > 0 && x.length > 3) >= 0 ? w.findIndex((x, k) => k > 0 && x.length > 3) : w.length - 1;
    const miss = w[idx];
    const shown = w.map((x, k) => (k === idx ? '____' : x)).join(' ');
    const wrong = take(pool.flatMap(wordsOf).filter((x) => x.toLowerCase() !== miss.toLowerCase() && x.length > 2 && x[0] === x[0].toLowerCase()), 2);
    return choose('Completa la frase', tx(miss), wrong.map((x) => tx(x)), tx(`${shown}.`));
  });
  return S('Completo frases', '🧩', acts);
}

const VERDAD = [
  ['El sol sale de noche.', false], ['Los peces nadan.', true], ['El gato dice guau.', false], ['La vaca da leche.', true],
  ['Los pájaros vuelan.', true], ['El hielo es caliente.', false], ['Los perros ladran.', true], ['Las manzanas son frutas.', true],
  ['Los carros vuelan.', false], ['La luna brilla en la noche.', true],
];

const CUENTOS = [
  {
    title: 'El gato Michi', icon: '🐱',
    md: 'Michi es un gato pequeño.\n\nMichi tiene el pelo gris y los ojos verdes.\n\nA Michi le gusta jugar con una pelota roja.\n\nCuando termina de jugar, Michi duerme en su cama.',
    qs: [['¿De qué color es la pelota de Michi?', 'roja', ['azul', 'verde']], ['¿Dónde duerme Michi?', 'en su cama', ['en el jardín', 'en el carro']]],
  },
  {
    title: 'Mi día en la escuela', icon: '🎒',
    md: 'Me llamo Sofía y tengo seis años.\n\nTodos los días voy a la escuela con mi mochila.\n\nEn el salón leo, escribo y dibujo con mis amigos.\n\nMe gusta mucho mi escuela.',
    qs: [['¿Cuántos años tiene Sofía?', 'seis', ['cuatro', 'diez']], ['¿Qué lleva Sofía a la escuela?', 'su mochila', ['su bicicleta', 'su gato']]],
  },
  {
    title: 'La semilla', icon: '🌱',
    md: 'Pablo planta una semilla en una maceta.\n\nTodos los días la riega con agua.\n\nPoco a poco sale una hojita verde.\n\nPronto la semilla se convierte en una linda flor.',
    qs: [['¿Qué planta Pablo?', 'una semilla', ['una piedra', 'un zapato']], ['¿Qué necesita la planta para crecer?', 'agua', ['pelotas', 'juguetes']]],
  },
];

const cuentoSession = (c) => S(c.title, c.icon, [reading(c.md), ...c.qs.map(([q, right, wrong]) => choose(q, tx(right), wrong.map((x) => tx(x))))]);

const THEMES = [
  ['La familia', '👩 la mamá\n👨 el papá\n👧 la niña\n🧒 el niño\n👵 la abuela\n👴 el abuelo\n👶 el bebé'],
  ['Mi cuerpo', '👁️ el ojo\n👂 la oreja\n👃 la nariz\n👄 la boca\n✋ la mano\n🦶 el pie\n🦷 el diente'],
  ['La escuela', '📖 el libro\n✏️ el lápiz\n🎒 la mochila\n🏫 la escuela\n📏 la regla\n✂️ las tijeras\n🖍️ el crayón'],
];

export function lenguaWorlds() {
  const letters1 = letterSessions(['M', 'P', 'S', 'L', 'T', 'N', 'D'], { lowercase: true, syllables: true, review: true });
  const letters2 = letterSessions(['C', 'B', 'R', 'F', 'G', 'H', 'J'], { lowercase: true, syllables: true, review: true });
  const letters3 = letterSessions(['Ñ', 'V', 'Z', 'Y', 'Q', 'K', 'W', 'X'], { lowercase: true, syllables: true, review: true });

  const wordGroups = [];
  for (let i = 0; i < WORDS.length; i += 4) wordGroups.push(WORDS.slice(i, i + 4));
  const palabras = [
    ...wordGroups.map((g, i) => wordSession(i, g)),
    ...THEMES.flatMap(([t, v]) => vocabSessions(t, parseVocab(v), { reading: true })),
    rhymeSession(),
  ];

  const sentenceGroups = [FRASES.slice(0, 4), FRASES.slice(4, 8), FRASES.slice(8, 12)];
  const verdad = take(VERDAD, 6).map(([f, v]) => yesNo('¿Es verdad lo que dice la frase?', v, tx(f)));
  const frases = [
    ...sentenceGroups.map((g, i) => sentenceSession(i, g)),
    completeSession(),
    S('¿Verdad o mentira?', '🤔', verdad),
    ...CUENTOS.map(cuentoSession),
  ];

  const letras1 = world('Isla de las Letras 1', '🏝️', letters1, { color: '#7cc8ff', bossIcon: '🐙', story: 'Aquí viven las primeras letras: m, p, s, l, t, n y d. ¡Vamos a encontrarlas y a leer sílabas!' });
  const letras2 = world('Isla de las Letras 2', '🌴', letters2, { color: '#8be28b', bossIcon: '🦜', requires: letras1.id, story: 'Llegamos a una isla con letras nuevas: c, b, r, f, g, h y j. ¡Cada vez leemos más!' });
  const letras3 = world('Isla de las Letras 3', '🗻', letters3, { color: '#ffb347', bossIcon: '🦅', requires: letras2.id, story: 'Estas son las letras más curiosas del abecedario. ¡Con ellas completamos todo el alfabeto!' });
  const valle = world('Valle de las Palabras', '📚', palabras, { color: '#ff8fb8', bossIcon: '🐉', requires: letras2.id, story: 'En este valle las letras se juntan en sílabas y las sílabas forman palabras. ¡Vamos a armarlas!' });
  const pueblo = world('Pueblo de las Frases', '🏘️', frases, { color: '#b08bff', bossIcon: '🦄', requires: valle.id, story: 'Las palabras se unen para contar cosas. ¡Aquí leemos frases y pequeños cuentos!' });
  return [letras1, letras2, letras3, valle, pueblo];
}

// ===================== INGLÉS =====================
// Los dibujos y las palabras en inglés se oyen con una voz en inglés (si Windows tiene una instalada).
const chunk = (arr, n = 4) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  if (out.length > 1 && out[out.length - 1].length === 1) out[out.length - 2].push(out.pop()[0]);
  return out;
};

function engSession(title, icon, group, all) {
  const acts = [];
  for (const [e, w, es] of group) acts.push(view(`Esto es ${es}, en inglés. Toca la palabra para escucharla.`, en(e, w)));
  for (const [e, w] of shuffle(group)) {
    const others = take(all.filter((x) => x[1] !== w), 2).map((x) => em(x[0]));
    acts.push(listen('Escucha y toca el dibujo', em(e), others, { say: w, lang: 'en' }));
  }
  for (const [e, w] of take(group, 2)) {
    const others = take(all.filter((x) => x[1] !== w), 2).map((x) => em(x[0]));
    acts.push(choose('¿Cuál es el dibujo de esta palabra?', em(e), others, enTx(w)));
  }
  if (group.length >= 2) acts.push(match('Une cada dibujo con su palabra en inglés', group.map(([e, w]) => [em(e), enTx(w)])));
  return S(title, icon, acts);
}

function engSessions(theme, items) {
  const groups = chunk(items);
  const out = groups.map((g, i) => engSession(groups.length > 1 ? `${theme} ${i + 1}` : theme, g[0][0], g, items));
  if (items.length > 4) {
    const acts = take(items, 4).map(([e, w]) => listen('Escucha y toca el dibujo', em(e), take(items.filter((x) => x[1] !== w), 2).map((x) => em(x[0])), { say: w, lang: 'en' }));
    acts.push(memory('Encuentra las parejas', take(items, 4).map(([e, w]) => en(e, w))));
    out.push(S(`Repaso: ${theme}`, '⭐', acts));
  }
  return out;
}

const EN_GREET = [['👋', 'hello', 'hola'], ['🌅', 'good morning', 'buenos días'], ['🌙', 'good night', 'buenas noches'], ['🙏', 'thank you', 'gracias']];
const EN_COLORS = [['🔴', 'red', 'el color rojo'], ['🔵', 'blue', 'el color azul'], ['🟡', 'yellow', 'el color amarillo'], ['🟢', 'green', 'el color verde'], ['🟠', 'orange', 'el color naranja'], ['🟣', 'purple', 'el color morado'], ['⚫', 'black', 'el color negro'], ['⚪', 'white', 'el color blanco']];
const EN_NUMS = [['1️⃣', 'one', 'el uno'], ['2️⃣', 'two', 'el dos'], ['3️⃣', 'three', 'el tres'], ['4️⃣', 'four', 'el cuatro'], ['5️⃣', 'five', 'el cinco'], ['6️⃣', 'six', 'el seis'], ['7️⃣', 'seven', 'el siete'], ['8️⃣', 'eight', 'el ocho'], ['9️⃣', 'nine', 'el nueve'], ['🔟', 'ten', 'el diez']];
const EN_ANIMALS = [['🐱', 'cat', 'un gato'], ['🐶', 'dog', 'un perro'], ['🐦', 'bird', 'un pájaro'], ['🐟', 'fish', 'un pez'], ['🐮', 'cow', 'una vaca'], ['🐴', 'horse', 'un caballo'], ['🦆', 'duck', 'un pato'], ['🐷', 'pig', 'un cerdo']];
const EN_FAMILY = [['👩', 'mom', 'mamá'], ['👨', 'dad', 'papá'], ['👧', 'sister', 'la hermana'], ['👦', 'brother', 'el hermano'], ['👵', 'grandma', 'la abuela'], ['👴', 'grandpa', 'el abuelo'], ['👶', 'baby', 'el bebé']];
const EN_SCHOOL = [['📖', 'book', 'un libro'], ['✏️', 'pencil', 'un lápiz'], ['🎒', 'bag', 'una mochila'], ['🪑', 'chair', 'una silla'], ['⚽', 'ball', 'una pelota'], ['👩‍🏫', 'teacher', 'la maestra']];
const EN_FRUIT = [['🍎', 'apple', 'una manzana'], ['🍌', 'banana', 'un banano'], ['🍊', 'orange', 'una naranja'], ['🍇', 'grapes', 'las uvas'], ['🍓', 'strawberry', 'una fresa'], ['🍉', 'watermelon', 'una sandía']];
const EN_BODY = [['👁️', 'eye', 'el ojo'], ['👂', 'ear', 'la oreja'], ['👃', 'nose', 'la nariz'], ['👄', 'mouth', 'la boca'], ['✋', 'hand', 'la mano'], ['🦶', 'foot', 'el pie']];

export function inglesWorlds() {
  const w1 = world('Isla del Inglés 1', '🗣️', [
    ...engSessions('Hello!', EN_GREET), ...engSessions('Colors', EN_COLORS), ...engSessions('Numbers', EN_NUMS),
  ], { color: '#ff8fb8', bossIcon: '🦄', story: 'Hello! Hoy aprendemos palabras en inglés. Escucha con atención y repite en voz alta.' });
  const w2 = world('Isla del Inglés 2', '🏝️', [...engSessions('Animals', EN_ANIMALS), ...engSessions('Family', EN_FAMILY)], { color: '#7cc8ff', bossIcon: '🐙', requires: w1.id, story: 'Ahora hablamos de los animales y de la familia. ¡Tú puedes!' });
  const w3 = world('Isla del Inglés 3', '🌴', [...engSessions('School', EN_SCHOOL), ...engSessions('Fruits', EN_FRUIT), ...engSessions('Body', EN_BODY)], { color: '#8be28b', bossIcon: '🦜', requires: w2.id, story: 'Última isla: la escuela, las frutas y el cuerpo. ¡Casi hablas inglés!' });
  return [w1, w2, w3];
}
