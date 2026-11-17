// Curso "Camino a primero": temario de primero de primaria para llegar adelantado, a su propio ritmo.
// Mundos por materia (Español, Matemáticas, Inglés, Ciencias, Sociales, Valores, Arte y Tecnología).
// Algunos mundos piden vencer al jefe de otro antes (requires); papá puede abrirlos desde el modo edición.
import { seedCourse } from './templates.js';
import {
  em, tx, num, enTx, choose, listen, order, count, pattern, S, world, yesNo, rnd,
} from './primeroKit.js';
import { lenguaWorlds, inglesWorlds } from './primeroLengua.js';
import { mateWorlds, cienciasWorld, socialesWorld, valoresWorld, arteWorld } from './primeroMundo.js';

export const PRIMERO_COURSE_ID = 'curso-camino-a-primero';

// Misión de exploración: tres sesiones cortas para ver qué sabe hoy (no tiene jefe ni pide nada antes).
function diagnostic() {
  const espanol = S('Explorando: Español', '📚', [
    listen('Escucha. ¿Cuál es la letra m?', tx('m'), [tx('p'), tx('s')]),
    listen('Escucha. ¿Cuál dice ma?', tx('ma'), [tx('me'), tx('mo')]),
    choose('¿Cuál es la palabra de este dibujo?', tx('sol'), [tx('sal'), tx('sed')], em('🌞', '', 'el sol')),
    choose('Lee la frase y toca el dibujo', em('🐱'), [em('🐶'), em('🐟')], tx('El gato duerme.')),
    order('Ordena las palabras para formar la frase', ['La', 'niña', 'lee'].map((w) => tx(w))),
    choose('¿Qué palabra rima con gato?', tx('pato'), [tx('luna'), tx('casa')], tx('gato')),
  ]);
  const mate = S('Explorando: Matemáticas', '🔢', [
    count('¿Cuántas manzanas hay? Tócalas para contar.', '🍎', 'manzana', rnd(6, 9)),
    choose('¿Qué número va después del 9?', num(10), [num(8), num(11)]),
    choose('¿Cuánto es cuatro más tres?', num(7), [num(6), num(8)], tx('4 + 3')),
    choose('¿Cuánto es nueve menos cuatro?', num(5), [num(4), num(6)], tx('9 − 4')),
    choose('¿Cuál es el número mayor?', num(41), [num(14)]),
    pattern('Contamos de dos en dos. ¿Qué número sigue?', [2, 4, 6, 8, 10].map(num), [num(9), num(12)]),
  ]);
  const ingles = S('Explorando: Inglés', '🗣️', [
    listen('Escucha y toca el dibujo', em('🔴'), [em('🔵'), em('🟢')], { say: 'red', lang: 'en' }),
    listen('Escucha y toca el dibujo', em('🐱'), [em('🐶'), em('🐟')], { say: 'cat', lang: 'en' }),
    choose('¿Cuál es el dibujo de esta palabra?', em('3️⃣'), [em('1️⃣'), em('5️⃣')], enTx('three')),
    yesNo('¿Sabes decir hello?', true),
  ]);
  return world('Misión de exploración', '🧭', [espanol, mate, ingles], {
    color: '#2ec4ff', boss: false, bossIcon: '🧭',
    story: 'Antes de despegar, exploramos qué sabes hoy. No te preocupes si algo no lo sabes todavía: ¡para eso viajamos juntos!',
  });
}

// Calentamiento: lo de transición (vocales, números del 1 al 5, colores y formas).
function warmup() {
  const seed = seedCourse();
  const sessions = [0, 1, 2, 4].flatMap((i) => seed.units[i].sessions);
  return world('Calentamiento: repaso de transición', '🌟', sessions, {
    color: '#ffd23f', bossIcon: '🤸',
    story: 'Un buen viaje empieza calentando motores. Repasamos vocales, números, colores y formas.',
  });
}

export function primeroCourse() {
  const lengua = lenguaWorlds();
  const mate = mateWorlds();
  const ingles = inglesWorlds();
  const units = [
    diagnostic(),
    warmup(),
    ...lengua,
    ...mate,
    ...ingles,
    cienciasWorld(),
    socialesWorld(),
    valoresWorld(),
    arteWorld(),
  ];
  return {
    id: PRIMERO_COURSE_ID,
    title: 'Camino a primero',
    icon: '🚀',
    color: '#2ec4ff',
    visible: true,
    freeOrder: true, // dentro de un mundo, las misiones se pueden hacer en el orden que quiera; los mundos sí se abren al vencer al jefe
    mascot: { kind: 'svg:cosmo', name: 'Cosmo' },
    story: '¡Hola, soy Cosmo, tu guía espacial! Vamos a viajar por mundos de letras, números, inglés y mucho más para que llegues a primero súper preparado. ¡Despegamos!',
    units: units.filter((u) => u.sessions.length),
  };
}
