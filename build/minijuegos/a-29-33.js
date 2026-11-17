// Fase A · conferencias 29 a 33
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-a-29': [
    choose('¿Qué ley dice que todo sube y baja, va y viene?', '🕰️|Ley del Péndulo', ['🍎|Ley de la manzana', '🌙|Ley de la luna']),
    choose('Sin qué no funciona el reloj de pared?', '🕰️|Sin el péndulo', ['🍰|Sin pastel', '🎈|Sin globos']),
    match('Une cada extremo del péndulo con su contrario', [
      ['😊|Alegría', '😢|Dolor'],
      ['🌟|Esperanza', '😞|Desesperación'],
      ['🏆|Triunfo', '💔|Fracaso'],
      ['💰|Ganancia', '📉|Pérdida'],
    ]),
    yesNo('Todo fluye y refluye, sube y baja, va y viene. ¿Verdadero?', true),
  ],

  'libros-a-30': [
    choose('¿Cuánta Conciencia tenemos despierta?', '3️⃣|El 3%', ['🔢|El 97%', '🔢|El 100%']),
    choose('¿Qué libera la Conciencia atrapada?', '💀|Desintegrar los yoes', ['😴|Dormir más', '📺|Ver televisión']),
    order('Ordena el método para despertar la conciencia', ['👀|Auto-observación', '🤔|Enjuiciamiento', '🙏|Eliminación']),
    yesNo('No se puede despertar sin haber muerto antes en sí mismo. ¿Verdadero?', true),
  ],

  'libros-a-31': [
    yesNo('Somos como marionetas controladas por yoes ocultos. ¿Verdadero?', true),
    choose('Para cambiar, ¿qué debemos observar primero?', '👀|Nuestra propia conducta', ['🌤️|El clima', '📰|Las noticias']),
    choose('¿Cuánto tiempo podemos empezar a comportarnos conscientemente?', '⏱️|Unos pocos minutos al día', ['🚫|Nunca', '🕛|Las 24 horas desde hoy']),
    match('Une cada palabra con su significado', [
      ['🔁|Recurrencia', '🎬|Todo se repite'],
      ['🚂|Hábitos', '🛤️|El carril del tren'],
      ['🧸|Marioneta', '🧵|Movida por hilos'],
    ]),
    yesNo('Se puede cambiar por dentro sin trabajar sobre sí mismo. ¿Verdadero?', false),
  ],

  'libros-a-32': [
    choose('No somos «Uno» sino…', '👥|Muchos', ['1️⃣|Uno solo', '0️⃣|Ninguno']),
    yesNo('Nadie puede hacer este trabajo por nosotros. ¿Verdadero?', true),
    match('Une cada palabra con su lugar', [
      ['🧠|Conocimiento', '💭|De la mente'],
      ['❤️|Comprensión', '💗|Del corazón'],
      ['🔄|Cambio radical', '🏠|Trabajo interno'],
    ]),
    yesNo('Un manual de buenos modales basta para cambiar por dentro. ¿Verdadero?', false),
    choose('¿Cómo empieza el trabajo interior?', '🔍|Observándome a mí mismo', ['🏃|Corriendo', '🎮|Jugando']),
  ],

  'libros-a-33': [
    order('Ordena las primeras cinco notas de la escala', ['🎵|Do', '🎶|Re', '🎼|Mi', '🎹|Fa', '🎺|Sol']),
    choose('¿Cuántas notas tiene la escala musical?', '7️⃣|Siete', ['3️⃣|Tres', '5️⃣|Cinco']),
    choose('¿Cuántas pausas encontramos en una escala?', '3️⃣|Tres', ['1️⃣|Una', '7️⃣|Siete']),
    match('Une cada ley con lo que hace', [
      ['🎼|Ley de Octavas', '🪜|Nos enseña a ascender'],
      ['⚰️|Ley de Entropía', '⬇️|Nos iguala en el cementerio'],
      ['🌊|Corriente de la Vida', '🎹|La escala musical'],
    ]),
    yesNo('Entre las notas Mi y Fa hay una pausa. ¿Verdadero?', true),
  ],
};
