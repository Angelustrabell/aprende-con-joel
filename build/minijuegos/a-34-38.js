// Fase A · conferencias 34 a 38
// (La 35 habla de la familia: solo se usan las tres familias y los apegos, sin detalles sexuales.)
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-a-34': [
    choose('Si dentro de nosotros viven muchos yoes, ¿qué nos falta?', '🎯|Continuidad de propósitos', ['🍰|Hambre', '😴|Sueño']),
    choose('¿Cómo se llama lo que nos da constancia para lograr la meta?', '⚓|Centro de gravedad permanente', ['🎈|Centro de globos', '🏖️|Centro de la playa']),
    yesNo('Lo normal es que alguien se entusiasme y luego abandone el trabajo. ¿Verdadero?', true),
    yesNo('Cada yo piensa y opina lo mismo que todos los demás. ¿Verdadero?', false),
  ],

  'libros-a-35': [
    match('Une cada familia con lo que es', [
      ['👨‍👩‍👧|Familia física', '🧍|Papá, mamá y hermanos'],
      ['🎭|Familia psicológica', '😈|Mis yoes'],
      ['✨|Real familia', '🕊️|La Conciencia libre'],
    ]),
    choose('¿Cuántas familias tenemos?', '3️⃣|Tres', ['1️⃣|Una', '7️⃣|Siete']),
    choose('¿Cómo debemos ver a las personas de la calle?', '🤝|Como hermanos', ['👽|Como extraños', '🚫|Como enemigos']),
    yesNo('El planeta Tierra es la casa de todos. ¿Verdadero?', true),
    yesNo('Los apegos nos ayudan a comprender que todos somos hermanos. ¿Verdadero?', false),
  ],

  'libros-a-36': [
    choose('¿Qué es un koan?', '❓|Una frase sin respuesta', ['🍰|Un pastel', '🎵|Una canción']),
    choose('Para meditar, ¿qué lugar buscamos?', '🔇|Uno tranquilo', ['🎉|Una fiesta', '🚗|La calle']),
    order('Ordena algunos pasos de la meditación', ['⭕|Protegerme', '🙏|Pedir ayuda', '😌|Relajarme', '🧘|Silenciar la mente', '❓|Poner el koan']),
    match('Une cada parte del pensamiento con lo que imagino', [
      ['🌱|Evolutivo', '🌹|El rosal crece y florece'],
      ['🍂|Involutivo', '🥀|El rosal se seca'],
    ]),
    yesNo('Quien no sabe meditar nunca podrá disolver el ego. ¿Verdadero?', true),
  ],

  'libros-a-37': [
    choose('¿Qué hacemos durante el día para practicar el desdoblamiento?', '🦘|Dar salticos para flotar', ['🛌|Dormir', '🍔|Comer']),
    yesNo('Si flotamos, descubrimos que estamos en el astral. ¿Verdadero?', true),
    choose('¿Cuándo damos el saltico?', '🔄|Al cambiar de actividad', ['🌙|Solo de noche', '🚫|Nunca']),
  ],

  'libros-a-38': [
    choose('¿Qué debemos llevar al lado oscuro de nosotros mismos?', '💡|La luz de la Conciencia', ['🌑|Más oscuridad', '🎈|Globos']),
    yesNo('Lo que criticamos mucho en otros puede estar en nuestro lado oscuro. ¿Verdadero?', true),
    match('Une cada palabra con lo que es', [
      ['🌙|Luna psicológica', '🎭|El ego'],
      ['✨|Cristo Íntimo', '❤️|Nace en el corazón'],
      ['🔪|Filo de la navaja', '🛤️|El camino difícil'],
    ]),
    choose('¿Para qué sirve observarse a sí mismo?', '🌟|Para ampliar la Conciencia', ['😴|Para dormir mejor', '🏃|Para correr más']),
  ],
};
