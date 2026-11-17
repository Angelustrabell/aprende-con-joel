// Tipos de actividad: nombre, descripción, valores iniciales, validación y resumen.
import { uid } from '../core/util.js';
import { card, cardLabel, cardIsEmpty } from '../core/card.js';

const prompt = (say) => ({ say, audio: '' });

export const ACTIVITY_TYPES = {
  choose: {
    name: 'Toca la correcta', icon: '👆',
    desc: 'Varias opciones y una (o más) correctas. Puede mostrar una imagen o letra arriba.',
    create: () => ({
      prompt: prompt('¿Dónde está el perro?'),
      target: null,
      options: [card('🐶', 'perro', 'el perro'), card('🐱', 'gato', 'el gato'), card('🐮', 'vaca', 'la vaca')],
      correct: [0],
    }),
    validate: (a) => {
      if ((a.options || []).filter((c) => !cardIsEmpty(c)).length < 2) return 'Pon al menos 2 opciones.';
      if (!(a.correct || []).length) return 'Marca al menos una opción correcta (✓).';
      if (a.correct.some((i) => i >= a.options.length)) return 'Revisa las respuestas correctas.';
      return null;
    },
    summary: (a) => `${a.options.length} opciones · correcta: ${a.correct.map((i) => cardLabel(a.options[i])).join(', ')}`,
    cards: (a) => [a.target, ...a.options].filter(Boolean),
  },
  listen: {
    name: 'Escucha y elige', icon: '👂',
    desc: 'Suena una palabra o sonido y hay que tocar la imagen que corresponde.',
    create: () => ({
      prompt: prompt('Escucha y toca el que suena'),
      options: [card('🐶', 'perro', 'perro'), card('🐱', 'gato', 'gato'), card('🐷', 'cerdo', 'cerdo')],
      correct: 0,
      sound: { say: '', audio: '' },
    }),
    validate: (a) => {
      if ((a.options || []).filter((c) => !cardIsEmpty(c)).length < 2) return 'Pon al menos 2 opciones.';
      if (a.correct == null || a.correct >= a.options.length) return 'Elige cuál es la que suena (✓).';
      return null;
    },
    summary: (a) => `${a.options.length} opciones · suena: ${a.sound?.say || cardLabel(a.options[a.correct])}`,
    cards: (a) => a.options,
  },
  match: {
    name: 'Arrastra y une', icon: '🔗',
    desc: 'Parejas: arrastra cada ficha de arriba hasta su pareja de abajo.',
    create: () => ({
      prompt: prompt('Une cada animal con su comida'),
      pairs: [
        { a: card('🐰', '', 'conejo'), b: card('🥕', '', 'zanahoria') },
        { a: card('🐵', '', 'mono'), b: card('🍌', '', 'plátano') },
        { a: card('🐭', '', 'ratón'), b: card('🧀', '', 'queso') },
      ],
    }),
    validate: (a) => ((a.pairs || []).filter((p) => !cardIsEmpty(p.a) && !cardIsEmpty(p.b)).length < 2 ? 'Pon al menos 2 parejas completas.' : null),
    summary: (a) => `${a.pairs.length} parejas`,
    cards: (a) => a.pairs.flatMap((p) => [p.a, p.b]),
  },
  count: {
    name: 'Cuenta', icon: '🔢',
    desc: 'Aparecen cosas para contar y se elige el número. También sumas y restas sencillas.',
    create: () => ({
      prompt: prompt('¿Cuántas manzanas hay?'),
      item: card('🍎', '', 'manzana'),
      number: 3,
      op: 'none',
      second: 1,
    }),
    validate: (a) => {
      if (cardIsEmpty(a.item)) return 'Elige qué se cuenta.';
      if (!(a.number >= 1 && a.number <= 20)) return 'El número debe estar entre 1 y 20.';
      if (a.op === 'sub' && a.second > a.number) return 'No se pueden quitar más de los que hay.';
      if (a.op === 'add' && a.number + a.second > 20) return 'La suma no debe pasar de 20.';
      return null;
    },
    summary: (a) => (a.op === 'add' ? `${a.number} + ${a.second}` : a.op === 'sub' ? `${a.number} − ${a.second}` : `contar ${a.number}`),
    cards: (a) => [a.item],
  },
  order: {
    name: 'Ordena', icon: '🪜',
    desc: 'Toca (o arrastra) las tarjetas en el orden correcto: números, tamaños, pasos de una rutina…',
    create: () => ({
      prompt: prompt('Ordena del más pequeño al más grande'),
      items: [card('🐭', '', 'ratón'), card('🐶', '', 'perro'), card('🐴', '', 'caballo'), card('🐘', '', 'elefante')],
    }),
    validate: (a) => ((a.items || []).filter((c) => !cardIsEmpty(c)).length < 2 ? 'Pon al menos 2 tarjetas.' : null),
    summary: (a) => a.items.map(cardLabel).join(' → '),
    cards: (a) => a.items,
  },
  trace: {
    name: 'Traza', icon: '✍️',
    desc: 'Repasar con el dedo o el ratón una letra o número.',
    create: () => ({ prompt: prompt('Traza la letra A'), char: 'A' }),
    validate: (a) => (!a.char || !a.char.trim() ? 'Escribe la letra o número a trazar.' : [...a.char.trim()].length > 3 ? 'Máximo 3 caracteres.' : null),
    summary: (a) => `trazar «${a.char}»`,
    cards: (a) => [card('', a.char)],
  },
  memory: {
    name: 'Memoria', icon: '🃏',
    desc: 'Juego de parejas con cartas boca abajo. Las parejas pueden ser iguales o distintas (letra y dibujo).',
    create: () => ({
      prompt: prompt('Encuentra las parejas'),
      pairs: [{ a: card('🐶', '', 'perro'), b: null }, { a: card('🐱', '', 'gato'), b: null }, { a: card('🐸', '', 'rana'), b: null }],
    }),
    validate: (a) => ((a.pairs || []).filter((p) => !cardIsEmpty(p.a)).length < 2 ? 'Pon al menos 2 parejas.' : (a.pairs.length > 8 ? 'Máximo 8 parejas.' : null)),
    summary: (a) => `${a.pairs.length} parejas`,
    cards: (a) => a.pairs.map((p) => p.a),
  },
  pattern: {
    name: 'Patrones', icon: '🔁',
    desc: '¿Qué viene después? Una serie que se repite; la última tarjeta es la respuesta.',
    create: () => ({
      prompt: prompt('¿Qué viene después?'),
      sequence: [card('🔴', '', 'rojo'), card('🔵', '', 'azul'), card('🔴', '', 'rojo'), card('🔵', '', 'azul'), card('🔴', '', 'rojo'), card('🔵', '', 'azul')],
      extra: [card('🟡', '', 'amarillo')],
    }),
    validate: (a) => ((a.sequence || []).filter((c) => !cardIsEmpty(c)).length < 3 ? 'La serie necesita al menos 3 tarjetas.' : null),
    summary: (a) => `${a.sequence.slice(0, -1).map(cardLabel).join(' ')} → ?`,
    cards: (a) => a.sequence.slice(0, 4),
  },
  sort: {
    name: 'Clasifica', icon: '🧺',
    desc: 'Arrastra cada cosa a su cesta (animales y comida, grande y pequeño, colores…).',
    create: () => ({
      prompt: prompt('¿Vuela o nada? Ponlos en su lugar'),
      groups: [
        { label: card('☁️', 'vuela', 'los que vuelan'), items: [card('🐦', '', 'pájaro'), card('🦋', '', 'mariposa'), card('🐝', '', 'abeja')] },
        { label: card('🌊', 'nada', 'los que nadan'), items: [card('🐟', '', 'pez'), card('🐬', '', 'delfín'), card('🐙', '', 'pulpo')] },
      ],
    }),
    validate: (a) => {
      const g = (a.groups || []).filter((x) => !cardIsEmpty(x.label));
      if (g.length < 2) return 'Pon al menos 2 cestas.';
      if (g.some((x) => !x.items.filter((c) => !cardIsEmpty(c)).length)) return 'Cada cesta necesita al menos una cosa.';
      return null;
    },
    summary: (a) => a.groups.map((g) => `${cardLabel(g.label)} (${g.items.length})`).join(' · '),
    cards: (a) => a.groups.map((g) => g.label),
  },
  view: {
    name: 'Lámina o video', icon: '🖼️',
    desc: 'Para presentar algo nuevo: una imagen grande (o un video) con explicación hablada.',
    create: () => ({ prompt: prompt('Este es el sol. El sol nos da luz y calor.'), card: card('☀️', 'sol', 'el sol'), video: '' }),
    validate: (a) => (cardIsEmpty(a.card) && !a.video ? 'Pon una imagen, emoji o video.' : null),
    summary: (a) => (a.video ? 'video' : cardLabel(a.card)),
    cards: (a) => [a.card],
  },
  paint: {
    name: 'Colorear', icon: '🖍️',
    desc: 'Dibujo libre o una lámina para colorear (con cubeta de pintura). Los dibujos se guardan.',
    create: () => ({ prompt: prompt('¡Vamos a colorear!'), builtin: 'sol', image: '' }),
    validate: () => null,
    summary: (a) => (a.image ? 'lámina propia' : a.builtin ? `lámina: ${a.builtin}` : 'dibujo libre'),
    cards: () => [card('🎨')],
  },
};

ACTIVITY_TYPES.reading = {
  name: 'Lectura', icon: '📖',
  desc: 'Páginas de texto con imágenes y tablas que la voz va leyendo. Ideal para las conferencias.',
  create: () => ({ prompt: prompt(''), md: '', narrate: true, size: 'normal' }),
  validate: (a) => (!String(a.md || '').trim() ? 'Escribe el texto de la lectura.' : null),
  summary: (a) => {
    const t = String(a.md || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/[#*_|>-]/g, ' ').replace(/\s+/g, ' ').trim();
    return `${t.length} letras · ${t.slice(0, 60)}${t.length > 60 ? '…' : ''}`;
  },
  cards: () => [card('📖')],
};

export const TYPE_ORDER = ['choose', 'listen', 'match', 'count', 'order', 'trace', 'memory', 'pattern', 'sort', 'view', 'paint', 'reading'];

export function newActivity(type) {
  return { id: uid(), type, ...ACTIVITY_TYPES[type].create() };
}

export function validateActivity(a) {
  const t = ACTIVITY_TYPES[a.type];
  if (!t) return 'Tipo de actividad desconocido.';
  return t.validate(a);
}

export function activitySummary(a) {
  const t = ACTIVITY_TYPES[a.type];
  try { return t ? t.summary(a) : ''; } catch { return ''; }
}

export function activityCards(a) {
  const t = ACTIVITY_TYPES[a.type];
  try { return (t ? t.cards(a) : []).filter(Boolean); } catch { return []; }
}

// Las láminas para colorear incluidas en la app.
export const COLORING_PAGES = [
  { id: 'sol', name: 'Sol' }, { id: 'casa', name: 'Casa' }, { id: 'pez', name: 'Pez' },
  { id: 'mariposa', name: 'Mariposa' }, { id: 'carro', name: 'Carro' }, { id: 'flor', name: 'Flor' },
  { id: 'helado', name: 'Helado' }, { id: 'cohete', name: 'Cohete' },
];
export const coloringUrl = (id) => `assets/coloring/${id}.svg`;
