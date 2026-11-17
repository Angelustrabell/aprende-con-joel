// Fase A · conferencias 44 a 50
// (46, 47 y 50 tratan temas sexuales y de brujería: aquí solo hay ideas generales —cuidarse, pureza, bien y mal—, nada explícito.)
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-a-44': [
    choose('¿Qué hay que romper para que haya traición?', '🤝|Una promesa o pacto', ['🥚|Un huevo', '🪟|Una ventana']),
    match('Une cada traidor con lo que representa', [
      ['😈|Judas', '🍬|El deseo'],
      ['🧠|Pilatos', '💭|La mente'],
      ['🔥|Caifás', '🙅|La mala voluntad'],
    ]),
    match('Une cada traidor con la forma de vencerlo', [
      ['😈|Judas', '🙅|Negándome a mí mismo'],
      ['🧠|Pilatos', '🚫|No justificarme'],
      ['🔥|Caifás', '🛠️|Sacrificios conscientes'],
    ]),
    yesNo('Si hay un pacto que no se cumple, hay traición. ¿Verdadero?', true),
  ],

  'libros-a-45': [
    choose('¿Cuál es el primer aspecto de fracaso en una práctica?', '🎯|La falta de concentración', ['🍰|Comer mucho', '📺|Ver televisión']),
    order('Ordena los cuatro aspectos de fracaso', ['🎯|Concentración', '🙏|Fe', '😨|Temor', '🏁|Objetivo']),
    match('Une cada palabra con su significado', [
      ['🙏|Fe', '💡|Saber con certeza'],
      ['❓|Duda', '📉|Lleva al fracaso'],
      ['😨|Temor', '🧊|Nos deja sin hacer'],
    ]),
    yesNo('Quien hace, sabe; y quien sabe ya no duda. ¿Verdadero?', true),
    choose('La palabra «Conciencia» viene de «con» y «ciencia». ¿Qué quiere decir?', '📚|Con sabiduría', ['🍬|Con dulce', '🎲|Con suerte']),
  ],

  'libros-a-46': [
    match('Une cada sentido con una impresión', [
      ['👁️|Vista', '🌈|Un arco iris'],
      ['👂|Oído', '🎵|Una canción'],
      ['👃|Olfato', '🌸|Una flor'],
      ['👅|Gusto', '🍓|Una fresa'],
      ['🤚|Tacto', '🧸|Un peluche'],
    ]),
    choose('Las impresiones que recibimos durante el día llegan por…', '🧠|Los sentidos', ['🌧️|La lluvia', '🚌|El bus']),
    choose('Antes de dormir, ¿cómo nos protegemos?', '⭕|Con el Belilín y el círculo mágico', ['📱|Con el celular', '🍬|Con dulces']),
    yesNo('Podemos transformar las impresiones si nos auto-observamos. ¿Verdadero?', true),
    yesNo('Los lugares llenos de larvas ayudan a mantenernos puros. ¿Verdadero?', false),
  ],

  'libros-a-47': [
    sort('¿Mago blanco o mago negro?', [
      ['🕊️|Mago blanco', ['✨|Libera la Conciencia', '💗|Elimina sus defectos']],
      ['🌑|Mago negro', ['😠|Alimenta el odio', '⚠️|Daña a otros']],
    ]),
    choose('¿Cuál es la principal diferencia entre un mago blanco y uno negro?', '📖|La calidad de su conocimiento', ['👕|El color de su ropa', '🏠|Su casa']),
    yesNo('Todos tenemos un yo brujo que debemos eliminar. ¿Verdadero?', true),
    yesNo('El mago blanco usa su conocimiento para hacer daño. ¿Verdadero?', false),
  ],

  'libros-a-48': [
    choose('¿Cuántos segundos se alarga cada mantram?', '6️⃣|Seis', ['1️⃣|Uno', '9️⃣|Nueve']),
    match('Une cada mantram con el lugar donde nos concentramos', [
      ['🔺|FARAON', '🧠|La frente'],
      ['👁️|LA RAS', '🔮|El entrecejo'],
      ['⭕|OOOOO', '❤️|El corazón'],
      ['🗣️|RRRRR', '🎤|La laringe'],
    ]),
    yesNo('Durante la noche se usa un solo mantram. ¿Verdadero?', true),
  ],

  'libros-a-49': [
    order('Ordena de la Unidad al Quinario', ['1️⃣|Unidad', '2️⃣|Dualidad', '3️⃣|Trinidad', '4️⃣|Cuaternario', '5️⃣|Quinario']),
    match('Une cada opuesto con su pareja', [
      ['⚪|Blanco', '⚫|Negro'],
      ['⬆️|Alto', '⬇️|Bajo'],
      ['😊|Alegría', '😢|Tristeza'],
      ['🏆|Triunfo', '💔|Derrota'],
    ]),
    match('Une cada parte de la Trinidad con su cualidad', [
      ['🌞|Padre', '📚|Sabiduría'],
      ['⚖️|Hijo', '🤝|Justicia'],
      ['💫|Espíritu Santo', '💪|Poder'],
    ]),
    choose('Antes de hacer algo, ¿qué nos preguntamos?', '❓|¿Es verdadero, justo y útil?', ['🍰|¿Qué hay de postre?', '⏰|¿Qué hora es?']),
    yesNo('Si lo que voy a hacer no es útil, no lo hago y ahorro energía. ¿Verdadero?', true),
  ],

  'libros-a-50': [
    choose('¿Qué cuerpo del cielo se estrelló contra la Tierra?', '☄️|El cometa Cóndor', ['🌙|La Luna', '☀️|El Sol']),
    match('Une cada palabra con lo que es', [
      ['☄️|Cometa Cóndor', '💥|Chocó con la Tierra'],
      ['🧑‍🔬|Loaissus y Sakaki', '👥|La comitiva sagrada'],
      ['🌊|Diluvio', '🚢|El arca de Noé'],
    ]),
    yesNo('Al principio las chispas eran inocentes y no conocían el mal. ¿Verdadero?', true),
    yesNo('Después los humanos se olvidaron de para qué vivían. ¿Verdadero?', true),
    choose('¿Qué debemos aprender a hacer para recuperar la Sabiduría?', '💀|Morir en sí mismos', ['📺|Ver televisión', '🛌|Dormir más']),
  ],
};
