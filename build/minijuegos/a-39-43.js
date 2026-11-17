// Fase A · conferencias 39 a 43
// (La 43 trata de la lujuria: los juegos solo usan la idea general —castidad, pureza, defecto— sin detalles.)
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-a-39': [
    choose('Cuando nos identificamos con algo, ¿qué le pasa a la Conciencia?', '😴|Se duerme', ['🌞|Se despierta', '🚀|Despega']),
    yesNo('Todas las escenas de la vida pasan, son pasajeras. ¿Verdadero?', true),
    choose('¿Qué yo mantiene vivos nuestros problemas?', '😨|El yo del temor', ['🎉|El yo de la fiesta', '🏃|El yo del deporte']),
    sort('¿Identificado o alerta?', [
      ['😵|Identificado', ['😡|Me enojo y me olvido de mí', '😰|Me preocupo sin parar']],
      ['🧘|Alerta', ['👀|Observo lo que siento', '✨|Estoy vigilante']],
    ]),
    yesNo('Debemos juzgar siempre a los demás. ¿Verdadero?', false),
  ],

  'libros-a-40': [
    choose('La palabra «sacrificio» quiere decir…', '✨|Oficio sagrado', ['🍕|Oficio de cocinar', '🎮|Oficio de jugar']),
    sort('Al compartir el conocimiento, ¿qué se hace y qué no?', [
      ['✅|Sí se hace', ['🎁|Darlo gratis', '🌍|Darlo a todos']],
      ['❌|No se hace', ['💵|Cobrar por él', '✂️|Cambiarlo a mi gusto']],
    ]),
    choose('¿Cuál es nuestro patrimonio, lo único que verdaderamente tenemos?', '📖|El Conocimiento', ['💰|El dinero', '🚗|El carro']),
    yesNo('Debemos obligar a todos a creer. ¿Verdadero?', false),
    choose('Des-egoistizarnos quiere decir…', '🤲|Compartir lo que tenemos', ['🤐|Guardarlo todo', '🛒|Vender todo']),
  ],

  'libros-a-41': [
    choose('¿De dónde son los derviches?', '🏜️|De Turquía', ['🧊|Del Polo Norte', '🌊|Del fondo del mar']),
    choose('¿Para qué sirven las danzas de los derviches?', '🎯|Para lograr la concentración', ['🛌|Para dormir', '🍽️|Para comer']),
    match('Une cada derviche o danza con lo que hace', [
      ['🎤|Derviches cantantes', '🎵|Enseñan con música'],
      ['💃|Derviches danzantes', '🌀|Enseñan con danzas'],
      ['🌀|Primera danza', '🙆|Girar con brazos abiertos'],
      ['🏃|Segunda danza', '👏|Trotar y aplaudir'],
    ]),
    choose('¿Cuántas vueltas, como mínimo, se dan en la primera danza?', '🔢|Veintiuna', ['5️⃣|Cinco', '🔢|Cien']),
    yesNo('En la segunda danza se trota en el puesto y se aplaude. ¿Verdadero?', true),
  ],

  'libros-a-42': [
    match('Une cada palabra con su significado', [
      ['🌎|Mundo exterior', '⌛|Todo pasa'],
      ['💎|Mundo interior', '✨|Mi Esencia o Ser'],
      ['📖|Conocimiento subjetivo', '🎭|De la personalidad'],
      ['🌟|Conocimiento objetivo', '💗|Sabiduría de mi Conciencia'],
    ]),
    choose('¿Cuál es la parte más importante de conocer?', '🔬|Comprobar', ['📝|Memorizar', '🗣️|Repetir']),
    yesNo('Todo lo que forma el mundo exterior es pasajero. ¿Verdadero?', true),
    yesNo('Para auto-realizarse, entre más conocimiento subjetivo, mejor. ¿Verdadero?', false),
    choose('¿A qué vinimos a este mundo?', '🔍|A conocernos a nosotros mismos', ['🎮|A jugar solamente', '💰|A juntar dinero']),
  ],

  'libros-a-43': [
    choose('¿Qué es lo contrario de la lujuria?', '🕊️|La castidad', ['🍬|La dulzura', '🎁|La generosidad']),
    yesNo('Los yoes de la lujuria nos quitan la concentración, la imaginación y la voluntad. ¿Verdadero?', true),
    choose('¿Quién dirige el trabajo para eliminar estos defectos?', '🙏|La Madre Divina', ['📺|La televisión', '🎲|La suerte']),
    match('Une cada palabra con lo que es', [
      ['🔥|Kundalini', '⬆️|Fuego que sube'],
      ['🌋|Kundartiguador', '⬇️|Fuego que baja'],
      ['🕊️|Castidad', '✨|Pureza'],
    ]),
    order('Ordena cómo trabajamos un defecto', ['🤔|Reflexionar sobre él', '💡|Comprenderlo', '🙏|Pedir que se elimine']),
  ],
};
