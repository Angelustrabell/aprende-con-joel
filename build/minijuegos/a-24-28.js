// Fase A · conferencias 24 a 28
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-a-24': [
    choose('Lo que somos por dentro, ¿qué atrae a nuestra vida?', '🧲|Las circunstancias', ['🌧️|Solo la lluvia', '🎁|Solo regalos']),
    choose('Para que el mundo cambie, ¿quién debe transformarse?', '🧍|Cada persona', ['🏛️|Solo el gobierno', '🌦️|El clima']),
    sort('¿Nivel del ser alto o bajo?', [
      ['⬆️|Nivel alto', ['🎁|Generoso', '🕊️|Apacible']],
      ['⬇️|Nivel bajo', ['💰|Tacaño', '😡|Violento']],
    ]),
    yesNo('La masa es la suma de los individuos. ¿Verdadero?', true),
    yesNo('Con el paso del tiempo siempre mejoramos solos. ¿Verdadero?', false),
  ],

  'libros-a-25': [
    match('Une cada palabra con su significado', [
      ['🌐|Exoterismo', '📚|Conocimiento exterior'],
      ['🎭|Pseudo-esoterismo', '❌|Falso conocimiento interior'],
      ['🔑|Esoterismo', '💎|Conocimiento interior real'],
    ]),
    sort('¿Creyente o práctico?', [
      ['📖|Creyente', ['🙈|Solo cree lo que le dicen', '🗃️|Acumula información']],
      ['🛠️|Práctico', ['🧪|Experimenta y comprueba', '✅|Verifica por sí mismo']],
    ]),
    choose('¿Cuál es una señal de una escuela pseudo-esotérica?', '💵|Cobra por el conocimiento', ['🎁|Enseña gratis', '💀|Enseña a morir de verdad']),
    yesNo('El conocimiento esotérico se aprende solo leyendo libros. ¿Verdadero?', false),
    yesNo('Lo importante es conocerse a sí mismo profundamente. ¿Verdadero?', true),
  ],

  'libros-a-26': [
    choose('¿Cuántos tipos de relaciones tenemos?', '3️⃣|Tres', ['1️⃣|Una', '9️⃣|Nueve']),
    match('Une cada relación con lo que es', [
      ['🧍|Con mi cuerpo', '💪|Cuerpo físico'],
      ['🌎|Con el mundo', '👨‍👩‍👧|Familia, trabajo y dinero'],
      ['💭|Conmigo mismo', '🏠|Mi mundo interior'],
    ]),
    yesNo('A la mayoría solo le importan las dos primeras relaciones. ¿Verdadero?', true),
    choose('Si la lámpara no está conectada a la electricidad, el cuarto queda…', '🌑|A oscuras', ['☀️|Iluminado', '🌈|De colores']),
    choose('En tiempos de tentación, ¿a qué debemos apelar?', '🙏|Al recuerdo de sí mismo', ['🏃|A escondernos', '📺|A la televisión']),
  ],

  'libros-a-27': [
    choose('¿A quién le pedimos que elimine el defecto?', '🙏|A la Madre Divina', ['📱|Al celular', '🚗|Al carro']),
    match('Une cada parte del árbol con lo que simboliza', [
      ['🌳|El árbol', '🎭|El ego'],
      ['🪵|Raíces gruesas', '🔥|Defectos grandes'],
      ['🌱|Raíces pequeñas', '🔍|Detalles diminutos'],
    ]),
    sort('¿Defecto grande o detalle pequeño?', [
      ['🪵|Defecto grande', ['😡|Ira', '👑|Orgullo']],
      ['🌱|Detalle pequeño', ['🤥|Una mentirita', '💭|Un mal pensamiento']],
    ]),
    order('Ordena cómo se seca el árbol del ego', ['👀|Observar el detalle', '🙏|Pedir a la Madre', '🥀|El árbol se seca']),
    yesNo('Para que el árbol se seque hay que quitarle su alimento, los pequeños detalles. ¿Verdadero?', true),
  ],

  'libros-a-28': [
    match('Une cada palabra con lo que es', [
      ['🔥|Cristo universal', '🌌|El Logos o Verbo'],
      ['❤️|Cristo individual', '✨|El Cristo Íntimo'],
      ['🌿|Zarza ardiente', '🔥|Dios como fuego'],
    ]),
    choose('¿Dónde debe nacer el Cristo para que de verdad nos sirva?', '❤️|En nuestro corazón', ['🏰|En un castillo', '📚|En un libro']),
    yesNo('INRI significa: el Fuego renueva incesantemente la naturaleza. ¿Verdadero?', true),
    yesNo('El Cristo Íntimo surge cuando trabajamos para disolver el yo. ¿Verdadero?', true),
  ],
};
