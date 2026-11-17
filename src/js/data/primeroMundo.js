// Primero de primaria: Matemáticas, Ciencias, Sociales (Colombia), Valores y Arte/Tecnología.
import {
  COUNT_ITEMS, mathSession, shapeSessions, emotionsSession, routineSession, paintSession, EMOTIONS,
} from './templates.js';
import {
  em, tx, num, choose, listen, view, order, match, memory, sortBy, count, pattern, S, world, take, shuffle, pick, words, near, rnd, yesNo,
} from './primeroKit.js';

const howMany = (g) => (g === 'f' ? 'Cuántas' : 'Cuántos');
const asc = (a, b) => a - b;
const distinct = (n, lo, hi, skip = []) => { let x; let guard = 0; do { x = rnd(lo, hi); guard++; } while ((x === n || skip.includes(x)) && guard < 50); return x; };

// ===================== MATEMÁTICAS =====================
function numGroupSession(lo, hi) {
  const nums = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  const acts = [];
  for (const n of take(nums, 3)) {
    const [e, sing, plur, g] = pick(COUNT_ITEMS);
    acts.push(count(`¿${howMany(g)} ${plur} hay? Tócalos para contar.`, e, sing, n));
  }
  for (const n of take(nums, 2)) acts.push(listen(`Escucha. ¿Cuál es el número ${words(n)}?`, num(n), near(n, 2, 0, hi + 3).map(num)));
  const a = rnd(lo, hi - 1);
  acts.push(choose(`¿Qué número va después del ${a}?`, num(a + 1), near(a + 1, 2, 0, hi + 3).map(num)));
  const b = rnd(lo + 1, hi);
  acts.push(choose(`¿Qué número va antes del ${b}?`, num(b - 1), near(b - 1, 2, 0, hi + 3).map(num)));
  acts.push(order('Ordena los números, del más pequeño al más grande', take(nums, Math.min(4, nums.length)).sort(asc).map(num)));
  acts.push(memory('Encuentra las parejas de números', take(nums, Math.min(4, nums.length)).map(num)));
  return S(`Números del ${lo} al ${hi}`, String(hi), acts);
}

function compareActs(lo, hi, n) {
  const acts = [];
  for (let i = 0; i < n; i++) {
    const a = rnd(lo, hi);
    const b = distinct(a, lo, hi);
    const bigger = i % 2 === 0;
    const right = bigger ? Math.max(a, b) : Math.min(a, b);
    acts.push(choose(bigger ? '¿Cuál es el número mayor?' : '¿Cuál es el número menor?', num(right), [num(right === a ? b : a)]));
  }
  return acts;
}

function skipCount(step, start) {
  const seq = [0, 1, 2, 3, 4].map((i) => num(start + step * i));
  return pattern(`Contamos de ${words(step)} en ${words(step)}. ¿Qué número sigue?`, seq, [num(start + step * 5), num(start + step * 4 + 1)]);
}

function numbers20() {
  return [
    numGroupSession(6, 10), numGroupSession(11, 15), numGroupSession(16, 20),
    S('Antes, después y entre', '↔️', [
      ...take([3, 6, 9, 12, 15, 18], 2).map((a) => choose(`¿Qué número va después del ${a}?`, num(a + 1), near(a + 1, 2, 0, 20).map(num))),
      ...take([4, 7, 10, 13, 16, 19], 2).map((b) => choose(`¿Qué número va antes del ${b}?`, num(b - 1), near(b - 1, 2, 0, 20).map(num))),
      ...take([5, 8, 11, 14, 17], 2).map((a) => choose(`¿Qué número va entre el ${a} y el ${a + 2}?`, num(a + 1), near(a + 1, 2, 0, 22).map(num), tx(`${a} ? ${a + 2}`))),
    ]),
    S('Mayor, menor e igual', '⚖️', compareActs(1, 20, 6)),
    S('Contar de 2 en 2 y de 5 en 5', '🦘', [skipCount(2, 2), skipCount(2, 6), skipCount(5, 5), skipCount(5, 10), skipCount(2, 10)]),
    S('Los números en letras', '🔤', [
      match('Une cada número con su nombre', take([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4).map((n) => [num(n), tx(words(n))])),
      match('Une cada número con su nombre', take([11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 4).map((n) => [num(n), tx(words(n))])),
      ...take([3, 7, 12, 15, 18, 20], 3).map((n) => choose('Lee el nombre y toca el número', num(n), near(n, 2, 0, 20).map(num), tx(words(n)))),
    ]),
  ];
}

function numbers100() {
  const tens = (d, u) => `${'🔟'.repeat(d)}${u ? ' ' : ''}${'🔹'.repeat(u)}`;
  const dec = [2, 3, 4, 5, 6, 7, 8, 9];
  return [
    S('Las decenas', '🔟', [
      choose('Una decena es lo mismo que…', num(10), [num(1), num(100)]),
      ...take(dec, 3).map((d) => choose(`¿Cuántos son ${words(d)} decenas?`, num(d * 10), [num(d * 10 + 10), num(d)], tx(tens(d, 0)))),
      pattern('Contamos de diez en diez. ¿Qué número sigue?', [10, 20, 30, 40, 50].map(num), [num(60), num(45)]),
      pattern('Contamos de diez en diez. ¿Qué número sigue?', [40, 50, 60, 70, 80].map(num), [num(90), num(75)]),
      order('Ordena las decenas', [10, 20, 30, 40, 50].map(num)),
    ]),
    S('Decenas y unidades', '🧱', [
      ...take(Array.from({ length: 80 }, (_, i) => 12 + i).filter((n) => n % 10 !== 0 && Math.floor(n / 10) !== n % 10), 4).map((n) => {
        const d = Math.floor(n / 10); const u = n % 10;
        return choose(`¿Qué número tiene ${words(d)} ${d === 1 ? 'decena' : 'decenas'} y ${words(u)} ${u === 1 ? 'unidad' : 'unidades'}?`, num(n), [num(u * 10 + d), num(n + 10)], tx(tens(d, u)));
      }),
      ...take([23, 45, 67, 38, 52, 74], 3).map((n) => {
        const d = Math.floor(n / 10);
        const wrong = [...new Set([n % 10, d + 1, d - 1, d + 2])].filter((x) => x !== d && x >= 0).slice(0, 2);
        return choose(`¿Cuántas decenas tiene el ${n}?`, num(d), wrong.map(num), tx(String(n)));
      }),
    ]),
    S('Antes, después y entre', '↔️', [
      ...take([24, 39, 48, 57, 63, 76, 88], 2).map((a) => choose(`¿Qué número va después del ${a}?`, num(a + 1), near(a + 1, 2, 0, 100).map(num))),
      ...take([31, 45, 52, 69, 74, 90], 2).map((b) => choose(`¿Qué número va antes del ${b}?`, num(b - 1), near(b - 1, 2, 0, 100).map(num))),
      ...take([28, 41, 55, 66, 79], 2).map((a) => choose(`¿Qué número va entre el ${a} y el ${a + 2}?`, num(a + 1), near(a + 1, 2, 0, 100).map(num), tx(`${a} ? ${a + 2}`))),
    ]),
    S('Mayor y menor', '⚖️', compareActs(10, 99, 8)),
    S('Ordeno números', '📶', [
      ...[0, 1, 2].map(() => order('Ordena los números, del más pequeño al más grande', take(Array.from({ length: 60 }, (_, i) => 10 + i * 1), 5).sort(asc).map(num))),
    ]),
    S('Contar de 2, 5 y 10', '🦘', [skipCount(2, 20), skipCount(2, 40), skipCount(5, 30), skipCount(5, 50), skipCount(10, 20), skipCount(10, 30)]),
    S('Pares e impares', '👯', [
      sortBy('¿Es par o impar?', [[tx('pares'), take([2, 4, 6, 8, 10, 12, 14], 3).map(num)], [tx('impares'), take([1, 3, 5, 7, 9, 11, 13], 3).map(num)]]),
      sortBy('¿Es par o impar?', [[tx('pares'), take([16, 18, 20, 22, 24, 26], 3).map(num)], [tx('impares'), take([15, 17, 19, 21, 23, 25], 3).map(num)]]),
      choose('¿Cuál de estos números es par?', num(pick([4, 8, 12])), [num(pick([3, 7])), num(pick([5, 9]))]),
      choose('¿Cuál de estos números es impar?', num(pick([3, 7, 11])), [num(pick([4, 8])), num(pick([6, 10]))]),
    ]),
    S('Los números en letras', '🔤', [
      match('Une cada número con su nombre', [20, 30, 40, 50].map((n) => [num(n), tx(words(n))])),
      match('Une cada número con su nombre', [60, 70, 80, 90].map((n) => [num(n), tx(words(n))])),
      ...take([25, 34, 47, 58, 69, 83], 3).map((n) => choose('Lee el nombre y toca el número', num(n), near(n, 2, 0, 100).map(num), tx(words(n)))),
    ]),
  ];
}

const NAMES = ['Ana', 'Luis', 'Sofía', 'Mateo', 'Valentina', 'Daniel', 'Camila', 'Juan'];

function calcActs(op, max, n) {
  const acts = [];
  for (let i = 0; i < n; i++) {
    if (op === 'add') {
      const a = rnd(2, max - 2);
      const b = rnd(2, max - a);
      acts.push(choose(`¿Cuánto es ${words(a)} más ${words(b)}?`, num(a + b), near(a + b, 2, 0, max).map(num), tx(`${a} + ${b}`)));
    } else {
      const a = rnd(Math.max(6, Math.floor(max / 2)), max);
      const b = rnd(2, a - 1);
      acts.push(choose(`¿Cuánto es ${words(a)} menos ${words(b)}?`, num(a - b), near(a - b, 2, 0, max).map(num), tx(`${a} − ${b}`)));
    }
  }
  return acts;
}

function storyActs(n) {
  const acts = [];
  for (let i = 0; i < n; i++) {
    const [e, , plur, g] = pick(COUNT_ITEMS);
    const name = pick(NAMES);
    const a = rnd(3, 6);
    const b = rnd(1, 4);
    if (i % 2 === 0) {
      acts.push(choose(`${name} tiene ${words(a)} ${plur} y compra ${words(b)} más. ¿${howMany(g)} ${plur} tiene en total?`, num(a + b), near(a + b, 2, 0, 15).map(num), tx(`${e.repeat(a)} + ${e.repeat(b)}`)));
    } else {
      acts.push(choose(`${name} tiene ${words(a + b)} ${plur} y regala ${words(b)}. ¿${howMany(g)} ${plur} le quedan?`, num(a), near(a, 2, 0, 15).map(num), tx(`${e.repeat(a + b)} − ${e.repeat(b)}`)));
    }
  }
  return acts;
}

function sums() {
  return [
    mathSession('add', 10, 6),
    mathSession('sub', 10, 6),
    S('Sumas hasta 20', '➕', calcActs('add', 20, 7)),
    S('Restas hasta 20', '➖', calcActs('sub', 20, 7)),
    S('Los dobles', '👯', take(Array.from({ length: 10 }, (_, i) => i + 1), 6).map((n) => choose(`¿Cuánto es ${words(n)} más ${words(n)}?`, num(n * 2), near(n * 2, 2, 0, 20).map(num), tx(`${n} + ${n}`)))),
    S('¿Qué número falta?', '❓', take([[3, 8], [4, 9], [5, 10], [6, 10], [7, 12], [8, 14], [2, 7]], 6).map(([a, s]) => choose(`¿Qué número falta? ${words(a)} más cuánto es igual a ${words(s)}`, num(s - a), near(s - a, 2, 0, 12).map(num), tx(`${a} + ? = ${s}`)))),
    S('Problemas con dibujos', '🧮', storyActs(6)),
    S('Sumas y restas mezcladas', '🔀', [...calcActs('add', 20, 3), ...calcActs('sub', 20, 3), ...storyActs(2)]),
  ];
}

const CLOCK = { 1: '🕐', 2: '🕑', 3: '🕒', 4: '🕓', 5: '🕔', 6: '🕕', 7: '🕖', 8: '🕗', 9: '🕘', 10: '🕙', 11: '🕚', 12: '🕛' };
const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function shapesAndMeasures() {
  return [
    ...shapeSessions(['círculo', 'cuadrado', 'triángulo', 'rombo', 'estrella', 'corazón']),
    S('Cuerpos geométricos', '🧊', [
      view('Esta es una esfera. Una pelota tiene forma de esfera.', em('⚽', 'esfera', 'la esfera')),
      view('Este es un cubo. Un dado tiene forma de cubo.', em('🎲', 'cubo', 'el cubo')),
      view('Este es un cilindro. Una lata tiene forma de cilindro.', em('🥫', 'cilindro', 'el cilindro')),
      view('Este es un cono. El cucurucho de un helado tiene forma de cono.', em('🍦', 'cono', 'el cono')),
      choose('¿Cuál tiene forma de esfera?', em('⚽', 'pelota'), [em('🥫', 'lata'), em('🎲', 'dado')]),
      choose('¿Cuál tiene forma de cubo?', em('🎲', 'dado'), [em('⚽', 'pelota'), em('🥫', 'lata')]),
      match('Une cada objeto con su figura', [[em('⚽'), tx('esfera')], [em('🎲'), tx('cubo')], [em('🥫'), tx('cilindro')]]),
    ]),
    S('Grande, mediano y pequeño', '📏', [
      order('Ordena del más pequeño al más grande', [em('🐭', 'ratón'), em('🐶', 'perro'), em('🐘', 'elefante')]),
      order('Ordena del más pequeño al más grande', [em('🐜', 'hormiga'), em('🐱', 'gato'), em('🐴', 'caballo')]),
      choose('¿Cuál es el más grande?', em('🐘', 'elefante'), [em('🐭', 'ratón')]),
      choose('¿Cuál es el más pequeño?', em('🐜', 'hormiga'), [em('🐴', 'caballo')]),
    ]),
    S('Largo, corto, alto y bajo', '🦒', [
      choose('¿Cuál es más alto?', em('🦒', 'jirafa'), [em('🐭', 'ratón')]),
      choose('¿Cuál es más bajo?', em('🐭', 'ratón'), [em('🦒', 'jirafa')]),
      choose('¿Cuál es más largo?', em('🚂', 'tren'), [em('🚗', 'carro')]),
      choose('¿Cuál es más corto?', em('🚗', 'carro'), [em('🚂', 'tren')]),
      sortBy('¿Pesado o liviano?', [[em('🐘', 'pesado'), [em('🐘', 'elefante'), em('🚗', 'carro'), em('🪨', 'piedra')]], [em('🪶', 'liviano'), [em('🪶', 'pluma'), em('🎈', 'globo'), em('🍃', 'hoja')]]]),
    ]),
    S('Los días de la semana', '📅', [
      order('Ordena los días de la escuela', DIAS.slice(0, 5).map((d) => tx(d))),
      ...take([0, 1, 2, 3], 3).map((i) => choose(`¿Qué día viene después del ${DIAS[i]}?`, tx(DIAS[i + 1]), take(DIAS.filter((d) => d !== DIAS[i + 1] && d !== DIAS[i]), 2).map((d) => tx(d)))),
      sortBy('¿Día de escuela o fin de semana?', [[em('🏫', 'escuela'), DIAS.slice(0, 5).slice(0, 3).map((d) => tx(d))], [em('🏡', 'fin de semana'), DIAS.slice(5).map((d) => tx(d))]]),
    ]),
    S('Los meses del año', '🗓️', [
      order('Ordena los meses: de enero a junio', MESES.slice(0, 6).map((m) => tx(m))),
      order('Ordena los meses: de julio a diciembre', MESES.slice(6).map((m) => tx(m))),
      choose('¿Con qué mes empieza el año?', tx('enero'), [tx('junio'), tx('octubre')]),
      choose('¿Con qué mes termina el año?', tx('diciembre'), [tx('marzo'), tx('julio')]),
      choose('¿Qué mes viene después de marzo?', tx('abril'), [tx('febrero'), tx('mayo')]),
    ]),
    S('Las horas', '🕒', take([3, 5, 7, 9, 12, 2, 6], 6).map((h) => choose('¿Qué hora marca el reloj?', tx(`${h}:00`, `las ${words(h)}`), take([1, 2, 4, 6, 8, 10, 11].filter((x) => x !== h), 2).map((x) => tx(`${x}:00`, `las ${words(x)}`)), em(CLOCK[h], '', `las ${words(h)}`)))),
    S('Día y noche', '🌗', [
      sortBy('¿Es de día o de noche?', [[em('☀️', 'día'), [em('🌞', 'sol'), em('⚽', 'jugar'), em('🥣', 'desayuno')]], [em('🌙', 'noche'), [em('⭐', 'estrellas'), em('😴', 'dormir'), em('🦉', 'búho')]]]),
      choose('¿Qué sale de día?', em('🌞', 'el sol'), [em('🌙', 'la luna')]),
      choose('¿Qué vemos en la noche?', em('⭐', 'las estrellas'), [em('🌈', 'el arcoíris')]),
    ]),
  ];
}

export function mateWorlds() {
  const n20 = world('Montaña de los Números', '⛰️', numbers20(), { color: '#ffb347', bossIcon: '🐲', story: 'Escalamos una montaña de números. En cada piso contamos, comparamos y ordenamos hasta el veinte.' });
  const n100 = world('Cumbre de los Números', '🏔️', numbers100(), { color: '#b08bff', bossIcon: '🦅', requires: n20.id, story: 'En la cumbre aprendemos decenas y unidades y contamos hasta cien. ¡Qué vista!' });
  const sumas = world('Valle de las Sumas y Restas', '🧮', sums(), { color: '#7cc8ff', bossIcon: '🤖', requires: n20.id, story: 'Aquí juntamos y quitamos cosas. Con cada suma y cada resta te vuelves más fuerte.' });
  const formas = world('Ciudad de las Formas y el Tiempo', '🏙️', shapesAndMeasures(), { color: '#5fd3c8', bossIcon: '🧙', story: 'En esta ciudad hay figuras, medidas, días, meses y relojes. ¡Vamos a explorarla!' });
  return [n20, n100, sumas, formas];
}

// ===================== CIENCIAS =====================
const Q = (q, right, wrong) => choose(q, tx(right), wrong.map((x) => tx(x)));

function sciences() {
  return [
    S('Seres vivos y cosas sin vida', '🌱', [
      view('Los seres vivos nacen, crecen, comen y mueren. Las plantas y los animales son seres vivos.', em('🌳', 'ser vivo', 'el árbol es un ser vivo')),
      sortBy('¿Es un ser vivo?', [[em('🌱', 'seres vivos'), [em('🐶', 'perro'), em('🌳', 'árbol'), em('🐦', 'pájaro')]], [em('🪨', 'sin vida'), [em('🪨', 'piedra'), em('🚗', 'carro'), em('⚽', 'pelota')]]]),
      sortBy('¿Es un ser vivo?', [[em('🌱', 'seres vivos'), [em('🐟', 'pez'), em('🌻', 'flor'), em('🐛', 'gusano')]], [em('🪨', 'sin vida'), [em('🪑', 'silla'), em('📖', 'libro'), em('🧸', 'osito de peluche')]]]),
      choose('¿Cuál es un ser vivo?', em('🌻', 'girasol'), [em('🪑', 'silla'), em('🚲', 'bicicleta')]),
    ]),
    S('Mis cinco sentidos', '👁️', [
      match('Une cada parte del cuerpo con su sentido', [[em('👁️', 'ojo'), tx('ver')], [em('👂', 'oreja'), tx('oír')], [em('👃', 'nariz'), tx('oler')], [em('✋', 'mano'), tx('tocar')]]),
      choose('¿Con qué parte del cuerpo vemos?', em('👁️', 'los ojos'), [em('👂', 'las orejas'), em('👃', 'la nariz')]),
      choose('¿Con qué parte del cuerpo oímos?', em('👂', 'las orejas'), [em('👁️', 'los ojos'), em('✋', 'las manos')]),
      choose('¿Con qué parte del cuerpo olemos?', em('👃', 'la nariz'), [em('👄', 'la boca'), em('👂', 'las orejas')]),
      choose('¿Con qué probamos los sabores?', em('👅', 'la lengua'), [em('👁️', 'los ojos'), em('👃', 'la nariz')]),
    ]),
    S('Las plantas', '🌻', [
      Q('¿Qué parte de la planta absorbe el agua?', 'la raíz', ['la hoja', 'la flor']),
      Q('¿Qué parte de la planta es verde y recibe la luz del sol?', 'la hoja', ['la raíz', 'el fruto']),
      Q('¿De dónde nace una planta?', 'de una semilla', ['de una piedra', 'de un zapato']),
      Q('¿Qué necesita una planta para crecer?', 'agua y sol', ['juguetes', 'oscuridad']),
      Q('¿Qué parte de la planta es de colores y huele rico?', 'la flor', ['la raíz', 'el tallo']),
      order('Así crece una planta. Ordena de primero a último', [em('🌰', 'semilla'), em('🌱', 'brote'), em('🌿', 'planta'), em('🌻', 'flor')]),
    ]),
    S('Los animales', '🐾', [
      sortBy('¿Cómo se mueven?', [[em('🦅', 'vuelan'), [em('🦅', 'águila'), em('🦋', 'mariposa')]], [em('🐟', 'nadan'), [em('🐟', 'pez'), em('🐬', 'delfín')]], [em('🐾', 'caminan'), [em('🐶', 'perro'), em('🐴', 'caballo')]]]),
      sortBy('¿Domésticos o salvajes?', [[em('🏠', 'domésticos'), [em('🐶', 'perro'), em('🐱', 'gato'), em('🐮', 'vaca')]], [em('🌳', 'salvajes'), [em('🦁', 'león'), em('🐘', 'elefante'), em('🦒', 'jirafa')]]]),
      choose('¿Qué animal nos da leche?', em('🐮', 'la vaca'), [em('🐟', 'el pez'), em('🐢', 'la tortuga')]),
      choose('¿Qué animal pone huevos?', em('🐔', 'la gallina'), [em('🐶', 'el perro'), em('🐱', 'el gato')]),
      choose('¿Qué animal nos da lana?', em('🐑', 'la oveja'), [em('🐴', 'el caballo'), em('🐷', 'el cerdo')]),
    ]),
    S('El agua', '💧', [
      Q('¿Para qué usamos el agua?', 'para beber y bañarnos', ['para volar', 'para escribir']),
      sortBy('El agua cambia de forma', [[em('🧊', 'sólido'), [em('🧊', 'hielo'), em('🪨', 'piedra')]], [em('💧', 'líquido'), [em('💧', 'agua'), em('🥛', 'leche')]], [em('☁️', 'gas'), [em('☁️', 'vapor')]]]),
      choose('¿Qué pasa con el hielo cuando hace calor?', em('💧', 'se derrite'), [em('🧊', 'se hace más duro')]),
      yesNo('¿Debemos cuidar el agua?', true),
      yesNo('¿Es bueno dejar el grifo abierto todo el día?', false),
    ]),
    S('El clima', '⛅', [
      match('Une cada dibujo con el clima', [[em('☀️'), tx('soleado')], [em('🌧️'), tx('lluvioso')], [em('☁️'), tx('nublado')], [em('💨'), tx('ventoso')]]),
      choose('¿Qué usamos cuando llueve?', em('☂️', 'el paraguas'), [em('🕶️', 'las gafas de sol'), em('🧢', 'una gorra')]),
      choose('¿Qué usamos cuando hace mucho sol?', em('🧢', 'una gorra'), [em('☂️', 'el paraguas'), em('🧣', 'una bufanda')]),
      choose('¿Qué nos da luz y calor?', em('🌞', 'el sol'), [em('🌙', 'la luna'), em('☁️', 'una nube')]),
    ]),
    S('Cuidemos el planeta', '♻️', [
      view('En Colombia separamos la basura: bolsa blanca para lo que se puede reciclar, bolsa verde para los restos de comida y bolsa negra para lo demás.', em('♻️', 'reciclar', 'reciclar')),
      sortBy('¿En qué bolsa va?', [[em('⚪', 'blanca'), [em('🧴', 'botella'), em('📰', 'periódico'), em('🥫', 'lata')]], [em('🟢', 'verde'), [em('🍌', 'cáscara de banano'), em('🥬', 'verduras')]], [em('⚫', 'negra'), [em('🧻', 'papel sucio'), em('🩹', 'curita usada')]]]),
      choose('¿Dónde va una botella de plástico?', em('⚪', 'en la bolsa blanca'), [em('🟢', 'en la bolsa verde'), em('⚫', 'en la bolsa negra')]),
      choose('¿Dónde va la cáscara de una fruta?', em('🟢', 'en la bolsa verde'), [em('⚪', 'en la bolsa blanca'), em('⚫', 'en la bolsa negra')]),
      yesNo('¿Debemos tirar la basura al piso?', false),
    ]),
  ];
}

// ===================== SOCIALES (COLOMBIA) =====================
function socials() {
  return [
    S('Mi familia', '👨‍👩‍👧', [
      Q('La mamá de mi mamá es mi…', 'abuela', ['tía', 'prima']),
      Q('El papá de mi papá es mi…', 'abuelo', ['tío', 'primo']),
      Q('El hijo de mis papás, además de mí, es mi…', 'hermano', ['vecino', 'abuelo']),
      Q('La hermana de mi mamá es mi…', 'tía', ['abuela', 'prima']),
      match('Une cada familiar con su dibujo', [[em('👵'), tx('abuela')], [em('👴'), tx('abuelo')], [em('👶'), tx('bebé')], [em('👨'), tx('papá')]]),
      yesNo('¿Debemos querer y respetar a nuestra familia?', true),
    ]),
    S('Mi escuela', '🏫', [
      match('Une cada lugar con lo que hacemos allí', [[em('📚', 'biblioteca'), tx('leer')], [em('⚽', 'cancha'), tx('jugar')], [em('🍽️', 'comedor'), tx('comer')], [em('🏫', 'salón'), tx('aprender')]]),
      choose('¿Dónde leemos libros en la escuela?', em('📚', 'la biblioteca'), [em('⚽', 'la cancha'), em('🍽️', 'el comedor')]),
      choose('¿Quién nos enseña en el salón?', em('👩‍🏫', 'la maestra'), [em('👮', 'el policía'), em('🧑‍🍳', 'el cocinero')]),
      yesNo('¿Debemos cuidar los útiles y los muebles de la escuela?', true),
    ]),
    S('Oficios y lugares', '🏘️', [
      match('Une cada lugar con quien trabaja allí', [[em('🏥', 'hospital'), em('👩‍⚕️', 'doctora')], [em('🏫', 'escuela'), em('👩‍🏫', 'maestra')], [em('🚒', 'estación de bomberos'), em('🧑‍🚒', 'bombero')], [em('🚓', 'estación de policía'), em('👮', 'policía')]]),
      choose('¿Quién apaga los incendios?', em('🧑‍🚒', 'el bombero'), [em('👩‍⚕️', 'la doctora'), em('👩‍🏫', 'la maestra')]),
      choose('¿Quién nos cuida cuando estamos enfermos?', em('👩‍⚕️', 'la doctora'), [em('🧑‍🚒', 'el bombero'), em('🧑‍🌾', 'el agricultor')]),
      choose('¿Quién cultiva los alimentos en el campo?', em('🧑‍🌾', 'el agricultor'), [em('👮', 'el policía'), em('👩‍🏫', 'la maestra')]),
    ]),
    S('Normas de convivencia', '🤝', [
      sortBy('¿Está bien o está mal?', [[em('✅', 'está bien'), [em('🤝', 'ayudar'), em('🙏', 'dar las gracias'), em('🧸', 'compartir')]], [em('❌', 'está mal'), [em('🤜', 'empujar'), em('😡', 'gritar'), em('🗑️', 'tirar basura')]]]),
      sortBy('¿Está bien o está mal?', [[em('✅', 'está bien'), [em('👋', 'saludar'), em('🙋', 'pedir la palabra'), em('🧍', 'esperar el turno')]], [em('❌', 'está mal'), [em('🙊', 'interrumpir'), em('😠', 'quitar cosas'), em('🤥', 'decir mentiras')]]]),
      choose('Si quiero hablar en clase, ¿qué hago?', em('🙋', 'levanto la mano'), [em('😡', 'grito'), em('🏃', 'salgo corriendo')]),
    ]),
    S('Símbolos patrios', '🚩', [
      view('Colombia es nuestro país. Su bandera tiene tres colores.', em('🟡🔵🔴', 'la bandera de Colombia', 'la bandera de Colombia')),
      order('Los colores de la bandera, de arriba hacia abajo', [em('🟡', 'amarillo'), em('🔵', 'azul'), em('🔴', 'rojo')]),
      Q('Los símbolos patrios de Colombia son…', 'la bandera, el escudo y el himno', ['el balón, la pelota y el carro', 'la mesa, la silla y la cama']),
      Q('¿Cuál es la capital de Colombia?', 'Bogotá', ['Cali', 'Medellín']),
      Q('¿Cuál es el ave nacional de Colombia?', 'el cóndor de los Andes', ['el pingüino', 'el pato']),
      Q('¿Qué día celebramos la Independencia de Colombia?', 'el 20 de julio', ['el 25 de diciembre', 'el 1 de enero']),
    ]),
  ];
}

// ===================== VALORES Y EMOCIONES =====================
function values() {
  const emo = emotionsSession(EMOTIONS.map((x) => x.name));
  return [
    emo,
    S('¿Qué hago si…?', '💭', [
      Q('Un compañero se cayó. ¿Qué hago?', 'lo ayudo', ['me río', 'me voy']),
      Q('Quiero el juguete de mi amigo. ¿Qué hago?', 'se lo pido por favor', ['se lo quito', 'lo escondo']),
      Q('Me regalan algo. ¿Qué digo?', 'gracias', ['nada', 'dámelo']),
      Q('Llego al salón. ¿Qué digo?', 'buenos días', ['chao', 'nada']),
      Q('Estoy muy enojado. ¿Qué hago?', 'respiro hondo', ['pego a alguien', 'grito fuerte']),
      Q('Rompí algo sin querer. ¿Qué hago?', 'digo la verdad y pido perdón', ['lo escondo', 'culpo a otro']),
    ]),
    S('Valores', '💛', [
      match('Une cada valor con su dibujo', [[em('🙏'), tx('gratitud')], [em('🤝'), tx('respeto')], [em('🧸'), tx('compartir')], [em('✅'), tx('honestidad')]]),
      yesNo('¿Decir la verdad es ser honesto?', true),
      yesNo('¿Compartir con los demás es un valor?', true),
      yesNo('¿Burlarse de otros está bien?', false),
    ]),
    routineSession('Lavo mis manos', '💦 mojo mis manos\n🧼 uso jabón\n🙌 froto bien\n🚿 enjuago\n🧻 las seco'),
    routineSession('Mi rutina del colegio', '🛏️ me despierto\n🪥 me lavo los dientes\n👕 me visto\n🥣 desayuno\n🎒 voy a la escuela'),
  ];
}

// ===================== ARTE Y TECNOLOGÍA =====================
function artTech() {
  return [
    paintSession('Colorear 1', ['sol', 'casa', 'pez']),
    paintSession('Colorear 2', ['mariposa', 'carro', 'flor']),
    paintSession('Colorear 3', ['helado', 'cohete', 'libre']),
    S('El computador', '💻', [
      match('Une cada parte con su nombre', [[em('🖥️'), tx('pantalla')], [em('⌨️'), tx('teclado')], [em('🖱️'), tx('ratón')], [em('🎧'), tx('audífonos')]]),
      choose('¿Con qué escribimos en el computador?', em('⌨️', 'el teclado'), [em('🖱️', 'el ratón'), em('🖥️', 'la pantalla')]),
      choose('¿Dónde vemos lo que hace el computador?', em('🖥️', 'la pantalla'), [em('⌨️', 'el teclado'), em('🎧', 'los audífonos')]),
    ]),
    S('Uso responsable', '🛡️', [
      sortBy('¿Está bien o está mal?', [[em('✅', 'está bien'), [em('🙋', 'pedir permiso'), em('⏰', 'usarlo poco tiempo'), em('👨‍👩‍👧', 'usarlo con mis papás')]], [em('❌', 'está mal'), [em('🕶️', 'hablar con desconocidos'), em('🌙', 'usarlo toda la noche')]]]),
      yesNo('Si algo en la pantalla me asusta, ¿se lo cuento a mis papás?', true),
    ]),
  ];
}

export function cienciasWorld() {
  return world('Bosque de las Ciencias', '🌲', sciences(), { color: '#8be28b', bossIcon: '🦉', story: 'En este bosque vive todo lo que nos rodea: plantas, animales, agua y clima. ¡Vamos a descubrirlo!' });
}
export function socialesWorld() {
  return world('Colombia, tierra mía', '🌎', socials(), { color: '#ffd23f', bossIcon: '🦅', story: 'Viajamos por Colombia y por nuestra comunidad. Conocemos a quienes nos ayudan y las reglas para vivir juntos.' });
}
export function valoresWorld() {
  return world('Jardín de los Valores', '💛', values(), { color: '#ff8fb8', bossIcon: '🦄', story: 'En este jardín florecen las emociones y los buenos valores. ¡Vamos a cultivarlos!' });
}
export function arteWorld() {
  return world('Taller de Arte y Tecnología', '🎨', artTech(), { color: '#b08bff', bossIcon: '🤖', story: 'Aquí coloreamos, creamos y conocemos el computador. ¡Un taller lleno de ideas!' });
}
