// Fase A · conferencias 15 a 18
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-a-15': [
    match('Une cada palabra con lo que es', [
      ['🎭|Ego o yo', '😈|Defectos'],
      ['🪞|Personalidad', '🧥|Se forma imitando'],
      ['✨|Esencia', '♾️|Real e inmortal'],
    ]),
    sort('¿Es del ego o de la esencia?', [
      ['🎭|Ego', ['😴|Pereza', '😡|Ira']],
      ['✨|Esencia', ['💗|Amor', '🌟|Conciencia']],
    ]),
    choose('¿Cuánta Esencia está libre y despierta?', '3️⃣|El 3%', ['🔢|El 97%', '🔢|El 50%']),
    order('Ordena los pasos para eliminar un yo', ['👀|Descubrirlo', '🔎|Observarlo', '🤔|Comprenderlo', '🙏|Pedir que se elimine']),
    yesNo('La personalidad nace y muere en el tiempo. ¿Verdadero?', true),
  ],

  'libros-a-16': [
    choose('Mirar con atención lo que pasa dentro de mí se llama…', '🔍|Auto-observación', ['🎨|Dibujar', '😴|Dormir']),
    match('Une cada palabra con lo que hace', [
      ['👀|Observar', '🌳|Atención hacia afuera'],
      ['🪞|Auto-observar', '💭|Atención hacia adentro'],
      ['📖|Conocer', '😶|Algo pasivo'],
    ]),
    yesNo('Para auto-observarnos sirven los ojos y los oídos. ¿Verdadero?', false),
    sort('¿Se ve afuera o adentro de mí?', [
      ['🌳|Afuera', ['🚗|Un carro', '🌳|Un árbol']],
      ['💭|Adentro', ['😠|Mis emociones', '💭|Mis pensamientos']],
    ]),
    order('Ordena lo que hacemos con un yo', ['👀|Verlo', '🔦|Descubrirlo', '🤔|Comprenderlo', '😔|Arrepentirnos']),
  ],

  'libros-a-17': [
    match('Une cada factor con lo que es', [
      ['🌱|Nacer', '🧬|Crear los cuerpos del Ser'],
      ['💀|Morir', '🔓|Liberar la Esencia'],
      ['🌍|Sacrificio', '🎁|Dar el conocimiento'],
    ]),
    choose('Para morir psicológicamente, ¿qué debemos aprender primero?', '👀|A auto-observarnos', ['🏃|A correr', '🎤|A cantar']),
    order('Ordena lo que hacemos cuando algo nos altera', ['🚗|Pasa algo que me altera', '👀|Observo mi interior', '🙏|Pido que se elimine el yo']),
    choose('Si alguien nos hace enojar, ¿qué hacemos con ese yo?', '🙏|Observarlo y pedir que se elimine', ['😡|Gritarle', '😈|Vengarnos']),
    yesNo('El Sacrificio por la Humanidad es entregar el conocimiento sin cobrar. ¿Verdadero?', true),
  ],

  'libros-a-18': [
    choose('¿Qué es la charla interior?', '💭|Lo que me digo por dentro', ['🎵|Una canción', '🎲|Un juego']),
    choose('¿Qué es el silencio interior de esta lección?', '🤫|Callar por dentro', ['🙉|Taparse los oídos', '😴|Dormir']),
    yesNo('Debemos aprender a ponernos en el lugar de los demás. ¿Verdadero?', true),
    choose('¿Cómo debemos tratar a los demás?', '🤝|Como queremos que nos traten', ['😤|Como nos dé la gana', '🙈|Ignorándolos']),
    match('Une cada palabra con lo que es', [
      ['🪞|Auto-simpatía', '💞|Quererme demasiado'],
      ['😢|Auto-consideración', '🥺|Sentir pena por mí'],
      ['💭|Charla interior', '🗣️|Hablar por dentro'],
    ]),
  ],
};
