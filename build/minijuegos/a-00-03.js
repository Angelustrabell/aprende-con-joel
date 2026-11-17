// Fase A · Estimado lector y conferencias 01 a 03
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-a-00': [
    choose('¿Cuántas lecciones prácticas tiene el libro?', '📖|50 lecciones', ['📖|10 lecciones', '📖|100 lecciones']),
    choose('¿Cuántas lecciones se recomienda tomar por semana?', '2️⃣|Dos', ['1️⃣|Una', '7️⃣|Siete']),
    yesNo('El libro nos enseña pasos para la Auto-Realización del Ser. ¿Verdadero?', true),
  ],

  'libros-a-01': [
    choose('¿Qué es lo más importante en la vida?', '🔍|Conocerse a sí mismo', ['🎮|Jugar todo el día', '📺|Ver televisión']),
    yesNo('Cuando alguien comienza a observarse a sí mismo, tiene intención de cambiar. ¿Verdadero?', true),
    match('Une cada parte de nosotros con lo que es', [
      ['🧍|Materia', '🦴|Cuerpo físico'],
      ['🧠|Alma o Mente', '🔒|97% atrapada'],
      ['✨|Espíritu', '🕊️|3% libre'],
    ]),
    match('Une cada pilar de la sabiduría con lo que nos enseña', [
      ['🔬|Ciencia', '🧪|Experimentar'],
      ['🎨|Arte', '🌱|Crear'],
      ['🔎|Psicología', '👀|Ver mis defectos'],
      ['❤️|Mística', '🛠️|Amar el trabajo'],
    ]),
    order('Ordena los pasos para liberar la Conciencia', ['👀|Auto-observarme', '🤔|Comprender el defecto', '🙏|Pedir que se elimine']),
  ],

  'libros-a-02': [
    choose('¿Cuánto dura el estado de catalepsia después de la muerte del cuerpo?', '⏰|72 horas', ['⏰|24 horas', '⏰|5 horas']),
    sort('¿Qué muere y qué no muere?', [
      ['⚰️|Muere', ['🧍|Cuerpo físico', '🌿|Cuerpo vital', '🎭|Personalidad']],
      ['✨|No muere', ['🕊️|Esencia', '💫|Conciencia']],
    ]),
    yesNo('Si comprendemos la muerte, ya no le tendremos miedo. ¿Verdadero?', true),
    order('Ordena los tres juicios del primero al último', ['⏱️|5 minutos', '🌅|24 horas', '🌙|48 horas']),
    choose('¿Cómo se llama la muerte que nos libera de nuestros defectos?', '🌟|Muerte psicológica', ['🪨|Muerte de la roca', '🌧️|Muerte del clima']),
  ],

  'libros-a-03': [
    choose('¿Por qué se llama Astral?', '⭐|Podemos viajar a los astros', ['🍽️|Porque se come', '🎵|Porque tiene música']),
    choose('¿Cuál es un síntoma del desdoblamiento?', '🎈|Sentir que floto', ['🍕|Sentir hambre', '🥶|Sentir mucho frío']),
    order('Ordena los pasos de la práctica', ['⭕|Círculo mágico', '🙏|Pedir ayuda', '😌|Relajar el cuerpo', '🔊|Cantar el mantram', '🦘|Comprobar si floto']),
    yesNo('Lo importante es querer hacerlo y atreverse a hacerlo. ¿Verdadero?', true),
  ],
};
