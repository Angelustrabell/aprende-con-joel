// Fase A · conferencias 08, 09 y 10
// (En la 09 y la 10 los juegos usan solo las ideas generales; no se hacen juegos con las prácticas sexuales.)
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-a-08': [
    order('Ordena los reinos de la naturaleza, del primero al cuarto', ['🪨|Mineral', '🌿|Vegetal', '🐾|Animal', '🧍|Humano']),
    match('Une cada reino con el nombre de su alma', [
      ['🪨|Mineral', '⛏️|Gnomo'],
      ['🌿|Vegetal', '🧚|Elemental'],
      ['🐾|Animal', '🐕|Ánima'],
      ['🧍|Humano', '💎|Alma'],
    ]),
    choose('¿Cuántas existencias humanas tiene cada alma?', '🔢|108', ['🔢|12', '🔢|54']),
    choose('¿Cuál es uno de los tres factores de la Revolución de la Conciencia?', '🌍|Sacrificio por la humanidad', ['📺|Ver televisión', '😴|Dormir todo el día']),
    yesNo('La Ley de Evolución es completamente mecánica. ¿Verdadero?', true),
  ],

  'libros-a-09': [
    choose('¿Cuántas infradimensiones se estudian en la conferencia?', '9️⃣|Nueve', ['3️⃣|Tres', '7️⃣|Siete']),
    match('Une cada esfera con el defecto que encontramos', [
      ['🌙|Luna', '😴|Pereza'],
      ['💖|Venus', '🍬|Deseos y placeres'],
      ['☀️|Sol', '💸|Derrochadores y avaros'],
      ['🔴|Marte', '😡|Ira'],
      ['🪐|Júpiter', '👑|Yoes tiranos'],
    ]),
    choose('¿Contra qué defecto es el primer trabajo, en la esfera de la Luna?', '😴|La pereza', ['😡|La ira', '🎁|La generosidad']),
    order('Ordena las cuatro primeras esferas', ['🌙|Luna', '💧|Mercurio', '💖|Venus', '☀️|Sol']),
    yesNo('El 97% de nuestra energía está atrapada en los defectos. ¿Verdadero?', true),
  ],

  'libros-a-10': [
    order('Ordena los primeros cinco cuerpos', ['🧍|Físico', '💧|Etérico o vital', '🔥|Astral', '💭|Mental', '⚡|Causal']),
    match('Une cada cuerpo con su nota musical', [
      ['🧍|Físico', '🎵|Do'],
      ['💧|Etérico', '🎶|Re'],
      ['🔥|Astral', '🎼|Mi'],
      ['💭|Mental', '🎹|Fa'],
      ['⚡|Causal', '🎺|Sol'],
    ]),
    match('Une cada cuerpo con su elemento', [
      ['🧍|Físico', '🌍|Tierra'],
      ['💧|Etérico', '🌊|Agua'],
      ['🔥|Astral', '🔥|Fuego'],
      ['💭|Mental', '🌬️|Aire'],
    ]),
    choose('¿Cuál cuerpo está levantado en todos los seres humanos?', '🕊️|Búdhico', ['🔥|Astral', '💭|Mental']),
    yesNo('Ya poseemos el cuerpo físico y el cuerpo vital. ¿Verdadero?', true),
  ],
};
