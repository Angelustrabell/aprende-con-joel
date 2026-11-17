// Fase B · conferencias 01 a 05
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-b-01': [
    choose('¿Cuál es lo contrario de la concentración?', '🦋|La distracción', ['🎯|La atención', '🧘|La calma']),
    sort('¿Tensión o calma?', [
      ['😣|Tensión', ['😟|Preocupaciones', '😡|Emociones fuertes']],
      ['😌|Calma', ['🧘|Relajación', '🎯|Concentración']],
    ]),
    match('Une cada palabra con lo que es', [
      ['🎯|Concentración', '✨|De la Conciencia'],
      ['🦋|Distracción', '🎭|Del yo'],
      ['😌|Relajación', '🔋|Evita gastar energía'],
    ]),
    yesNo('Hay dos tipos de concentración: en el mundo interior y en el exterior. ¿Verdadero?', true),
  ],

  'libros-b-02': [
    order('Ordena algunos pasos de la meditación reflexiva', ['🌀|Derviches', '🌬️|Respirar', '⭕|Círculo mágico', '😌|Relajar el cuerpo', '🎬|Reconstruir una escena']),
    choose('Al terminar la meditación, ¿qué hacemos?', '🙏|Agradecer a la Madre Divina', ['📺|Ver televisión', '🍰|Comer pastel']),
    yesNo('Nos vamos a juzgar a nosotros mismos, no a los demás. ¿Verdadero?', true),
    yesNo('Debemos aceptar las justificaciones y evadirnos. ¿Verdadero?', false),
  ],

  'libros-b-03': [
    choose('¿Cuántas veces se repite el objetivo?', '3️⃣|Tres veces', ['1️⃣|Una vez', '9️⃣|Nueve veces']),
    order('Ordena algunos pasos de la práctica', ['🌀|Derviches', '⭕|Círculo mágico', '😌|Relajar el cuerpo', '🔊|Cantar el mantram', '🦘|Comprobar si floto']),
    choose('¿Cómo comprobamos si ya estamos desdoblados?', '🦘|Saltando para ver si floto', ['🍎|Comiendo una manzana', '📺|Viendo la tele']),
    yesNo('Hay que ser muy pacientes hasta lograrlo. ¿Verdadero?', true),
  ],

  'libros-b-04': [
    choose('¿Dónde se hace el desdoblamiento mental?', '🌙|En el mundo astral', ['🍳|En la cocina', '🚌|En el bus']),
    choose('¿Qué es lo que se desdobla?', '💭|El cuerpo mental', ['🍞|El pan', '📚|El libro']),
    match('Une cada mundo con su cuerpo', [
      ['🌙|Mundo astral', '🔥|Cuerpo astral'],
      ['💭|Mundo mental', '🌬️|Cuerpo mental'],
    ]),
    choose('¿Para qué vamos al mundo mental?', '🔍|A investigar a nuestros yoes', ['⚔️|A pelear con ellos', '🎮|A jugar']),
    yesNo('El cuerpo astral y el mental están en la quinta dimensión. ¿Verdadero?', true),
  ],

  'libros-b-05': [
    choose('¿Cuántos centros inferiores están caídos?', '5️⃣|Cinco', ['2️⃣|Dos', '7️⃣|Siete']),
    order('Ordena los colores del mercurio', ['⚫|Negro', '⚪|Blanco', '🟡|Amarillo', '🔴|Rojo']),
    choose('¿Qué indica el color rojo?', '🔥|Que despertó el Fuego Sagrado', ['😴|Que nos dormimos', '🌧️|Que va a llover']),
    yesNo('Debemos desapegarnos de los juguetes que nos pone la naturaleza. ¿Verdadero?', true),
    yesNo('Si los centros no están equilibrados, perdemos el tiempo. ¿Verdadero?', true),
  ],
};
