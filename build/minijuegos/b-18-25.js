// Fase B · conferencias 18 a 25
// (24 y 25 usan símbolos con significado sexual: aquí solo se tratan las ideas generales, sin nada explícito.)
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-b-18': [
    match('Une cada parte de la palabra «Teosofía»', [
      ['🙏|Teo', '☁️|Dios'],
      ['📚|Sofía', '💡|Sabiduría'],
    ]),
    match('Une cada palabra con lo que es', [
      ['📖|Teosofía', '💡|Sabiduría de Dios'],
      ['👻|Espiritismo', '🗣️|Hablar con los muertos'],
      ['🧑|Médium', '🌉|Sirve de medio'],
    ]),
    yesNo('Estas escuelas enseñan los Tres Factores de la Revolución de la Conciencia. ¿Verdadero?', false),
    yesNo('Quien practica el espiritismo termina creando dependencia. ¿Verdadero?', true),
  ],

  'libros-b-19': [
    choose('¿Qué papel cumple Lucifer en nosotros?', '🏋️|Es nuestro entrenador', ['🎁|Es un regalo', '🧸|Es un juguete']),
    yesNo('Sin tentación no hay virtudes. ¿Verdadero?', true),
    match('Une cada luz con su sombra', [
      ['☀️|Osiris', '🌑|Tifón'],
      ['🎵|Apolo', '🐍|Pitón'],
      ['⚔️|San Jorge', '🐉|Dragón'],
    ]),
    choose('Lo importante es no caer en…', '🚫|La tentación', ['🎁|El regalo', '🛏️|La cama']),
  ],

  'libros-b-20': [
    choose('¿Qué vocal se prolonga para desarrollar la intuición?', '⭕|La O', ['🔺|La A', '🟩|La E']),
    choose('¿En qué lugar nos concentramos al vocalizar?', '❤️|En el corazón', ['👂|En las orejas', '🦶|En los pies']),
    choose('¿Cuántos minutos al día se vocaliza la O?', '🔢|Veinte', ['2️⃣|Dos', '🔢|Doscientos']),
    yesNo('El ego puede usar la intuición. ¿Verdadero?', false),
    yesNo('Ante un aviso de la intuición, debemos actuar sin dudar. ¿Verdadero?', true),
  ],

  'libros-b-21': [
    choose('¿Dónde debe nacer el Cristo para que de verdad nos sirva?', '❤️|En nuestro corazón', ['🏰|En un castillo', '📚|En un libro']),
    choose('¿Qué debe eliminar el Cristo Íntimo?', '💀|Los yoes causa', ['🌳|Los árboles', '🏠|Las casas']),
    match('Une cada cosa con lo que representa', [
      ['🔥|Zarza ardiente', '🧔|Dios y Moisés'],
      ['⛰️|Sinaí', '📜|Los diez mandamientos'],
      ['✝️|INRI', '🔥|El fuego renueva'],
    ]),
    yesNo('No se pueden disolver los yoes causa si el Cristo Íntimo no ha nacido. ¿Verdadero?', true),
  ],

  'libros-b-22': [
    match('Une cada vida con lo que es', [
      ['🏢|Vida pública', '💼|Trabajo y dinero'],
      ['🏠|Vida privada', '👨‍👩‍👧|Mi familia'],
      ['🔒|Vida íntima', '💭|Mi mundo interior'],
    ]),
    sort('¿Es pública, privada o íntima?', [
      ['🏢|Pública', ['💼|Mi trabajo', '💵|El dinero']],
      ['🏠|Privada', ['👨‍👩‍👧|Mi familia', '🛋️|Mi hogar']],
      ['🔒|Íntima', ['💭|Mis experiencias internas', '🌟|Mis avances secretos']],
    ]),
    choose('¿Qué pasa al contar nuestras experiencias íntimas?', '📉|Pierden fuerza', ['📈|Ganan fuerza', '🎉|Hacen fiesta']),
    yesNo('Debemos contar a todos nuestras experiencias internas. ¿Verdadero?', false),
  ],

  'libros-b-23': [
    match('Une cada símbolo con lo que representa', [
      ['🦅|Águila', '🕊️|El Espíritu'],
      ['🐍|Serpiente', '🔥|El Fuego'],
      ['🪶|Serpiente emplumada', '🌟|Quetzalcóatl'],
    ]),
    choose('¿De qué pueblo es el símbolo del águila y la serpiente?', '🏛️|De los aztecas', ['🏜️|De los esquimales', '🏝️|De los piratas']),
    yesNo('Al Absoluto se entra como Unidad. ¿Verdadero?', true),
    yesNo('Basta con despertar la serpiente; no hace falta nada más. ¿Verdadero?', false),
  ],

  'libros-b-24': [
    choose('¿Cuántas cruces se estudian?', '3️⃣|Tres', ['1️⃣|Una', '9️⃣|Nueve']),
    match('Une cada cruz con lo que significa', [
      ['🌱|Cruz de la Vida', '👶|Nacimiento'],
      ['💀|Cruz de la Muerte', '🔓|Muerte psicológica'],
      ['❤️|Cruz del Amor', '🌍|Sacrificio por la humanidad'],
    ]),
    yesNo('La Cruz del Amor es la del Gólgota. ¿Verdadero?', true),
    yesNo('El amor se ve en las obras. ¿Verdadero?', true),
  ],

  'libros-b-25': [
    choose('¿Qué es el templo en nosotros?', '🧍|Nuestro cuerpo físico', ['🏰|Un castillo', '🏫|La escuela']),
    match('Une cada símbolo del templo con su significado', [
      ['🪞|Espejo', '👀|Auto-observación'],
      ['⏰|Reloj', '⌛|Poco tiempo de vida'],
      ['🦁|León', '⚖️|La Ley'],
      ['🌸|Flores', '💎|Virtudes del alma'],
      ['🚩|Bandera', '🎯|Auto-realización'],
    ]),
    choose('¿Qué simboliza el incienso que sube?', '🕊️|Pensamientos puros', ['🍳|Comida', '🌫️|Niebla']),
    yesNo('Existen templos de magia blanca y templos de magia negra. ¿Verdadero?', true),
  ],
};
