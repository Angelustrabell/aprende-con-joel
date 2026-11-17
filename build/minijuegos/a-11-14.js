// Fase A · conferencias 11 a 14
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-a-11': [
    match('Une cada palabra con un ejemplo', [
      ['🌈|Virtudes', '🍯|La ira se vuelve dulzura'],
      ['⚡|Poderes', '🧚|Gobernar a los elementales'],
      ['👁️|Facultades', '🔮|Clarividencia'],
      ['💪|Fuerzas', '🏆|Hacer lo que mil no harían'],
    ]),
    match('Cuando eliminamos un defecto, ¿en qué virtud se convierte?', [
      ['😡|Ira', '🍯|Dulzura'],
      ['🤥|Traición', '🤝|Fidelidad'],
      ['🦹|Yo ladrón', '😇|Honradez'],
    ]),
    choose('¿Qué factor es entregar el conocimiento a los demás sin cobrar?', '🌍|Sacrificio por la humanidad', ['💀|Muerte psicológica', '🌱|Nacimiento espiritual']),
    choose('¿Cuánto tiempo, más o menos, tarda en crearse un cuerpo?', '⏳|Dos años y medio', ['⚡|Un día', '🕰️|Diez años']),
    yesNo('Al terminar la quinta iniciación, quedamos convertidos en Hombres Verdaderos. ¿Verdadero?', true),
  ],

  'libros-a-12': [
    choose('¿Cómo se llama la ley que dice que las escenas de la vida se repiten?', '🔁|Ley de Recurrencia', ['🤫|Ley del Silencio', '🎲|Ley del Juego']),
    choose('¿Quiénes son los actores de las escenas que se repiten?', '🎭|Los yoes', ['🐶|Los perros', '🚀|Los astronautas']),
    yesNo('La vida es como una película que nos llevamos y volvemos a proyectar. ¿Verdadero?', true),
    match('Une cada palabra con su significado', [
      ['🔄|Retorno', '👶|Volver a nacer'],
      ['🔁|Recurrencia', '🎬|Repetir las escenas'],
      ['🎭|Yo', '🧑‍🎤|Un actor interior'],
    ]),
    yesNo('Si el germen no muere, la planta no nace. ¿Verdadero?', true),
  ],

  'libros-a-13': [
    match('Une cada palabra con lo que significa', [
      ['⚖️|Karma', '💳|Lo que debemos pagar'],
      ['🌟|Dharma', '🪙|Dinero cósmico'],
      ['🏛️|Tribunal', '🔎|Justicia Objetiva'],
      ['🤲|Ley de Igualdad', '🔄|Lo que doy, lo recibo'],
    ]),
    sort('¿Karma o Dharma?', [
      ['⚖️|Karma', ['😠|Una mala obra', '💳|Una deuda']],
      ['🌟|Dharma', ['💝|Una obra buena', '🪙|Dinero cósmico']],
    ]),
    choose('¿Qué produce karma?', '🗣️|Obras, palabras y omisiones', ['🌧️|La lluvia', '🌞|El sol']),
    choose('¿Cómo se domina al León de la Ley?', '💗|Con caridad', ['😡|Con gritos', '🙈|Con miedo']),
    yesNo('No hay deuda que no se pague ni plazo que no se cumpla. ¿Verdadero?', true),
  ],

  'libros-a-14': [
    choose('¿Qué nos hace daño y debemos eliminar?', '🚫|El alcohol y las drogas', ['🥦|Las verduras', '💧|El agua']),
    sort('¿Qué hace bien y qué hace daño?', [
      ['👍|Hace bien', ['💧|Tomar agua', '🥗|Comer sano']],
      ['👎|Hace daño', ['🍺|Alcohol', '💊|Drogas']],
    ]),
    order('Ordena los pasos para eliminar un defecto', ['👀|Auto-observarlo', '🤔|Comprenderlo', '🙏|Pedir que se elimine']),
    yesNo('El alcohol impide la concentración. ¿Verdadero?', true),
    choose('Para dejar un mal hábito, ¿qué ayuda?', '🤝|Unirse a un grupo nuevo', ['🔁|Seguir igual', '🙈|No pensar en eso']),
  ],
};
