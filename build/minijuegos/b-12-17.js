// Fase B · conferencias 12 a 17
// (14, 16 y 17 mencionan temas sexuales: aquí solo hay ideas generales —colores blanco/negro, defectos, círculos—, nada explícito.)
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-b-12': [
    choose('¿Qué debe morir por completo para ser Hijo de la Luz?', '💀|El Yo Causa', ['🏠|La casa', '🌳|El árbol']),
    match('Une cada símbolo con su significado', [
      ['⚰️|Sepulcro', '☯️|Mueren las dos fuerzas'],
      ['🦅|Águila y serpiente', '🕊️|Unidad y liberación'],
      ['👑|Corona', '✨|Rey de Reyes'],
    ]),
    choose('¿Qué debe dejar el iniciado para quedarse en el Absoluto?', '🧑‍🏫|Un discípulo en el camino', ['🏆|Un trofeo', '💰|Dinero']),
    yesNo('Un Hijo de la Luz no tiene ni la sombra del ego. ¿Verdadero?', true),
  ],

  'libros-b-13': [
    choose('¿Qué es un Hannasmussen?', '⚖️|Tiene dos centros de gravedad', ['🐟|Un tipo de pez', '🎵|Una canción']),
    choose('¿Cuántas clases de Hannasmussen hay?', '4️⃣|Cuatro', ['1️⃣|Una', '7️⃣|Siete']),
    match('Une cada categoría con su descripción', [
      ['1️⃣|Primera', '🌎|No conocen el esoterismo'],
      ['2️⃣|Segunda', '🔥|Crearon el cuerpo astral'],
      ['3️⃣|Tercera', '☀️|Crearon los cuerpos solares'],
      ['4️⃣|Cuarta', '👑|Tronos caídos'],
    ]),
    yesNo('Toda la humanidad es Hannasmussen en mayor o menor grado. ¿Verdadero?', true),
  ],

  'libros-b-14': [
    choose('¿Cuántas clases de tantrismo se estudian?', '3️⃣|Tres', ['1️⃣|Una', '5️⃣|Cinco']),
    match('Une cada color con lo que es', [
      ['⚪|Blanco', '🕊️|El camino que sirve'],
      ['⚫|Negro', '⚠️|El camino equivocado'],
      ['🔘|Gris', '😶|Sin propósito'],
    ]),
    choose('¿Qué debe presidir el trabajo del camino blanco?', '❤️|Amor, fidelidad y castidad', ['💰|Dinero y fama', '😴|Pereza y sueño']),
    yesNo('Con el camino blanco se despierta el Kundalini. ¿Verdadero?', true),
  ],

  'libros-b-15': [
    order('Ordena del más grande al más pequeño', ['☀️|Absoluto solar', '🌌|Universo', '🌠|Galaxia', '🪐|Sistema solar', '🌍|Planeta']),
    match('Une cada nombre con lo que es', [
      ['🌌|Ayocosmos', '🌠|Un universo'],
      ['🌠|Macrocosmos', '🌀|Una galaxia'],
      ['🪐|Deuterocosmos', '☀️|Un sistema solar'],
      ['🌍|Mesocosmos', '🌎|Un planeta'],
      ['🧍|Microcosmos', '🙋|Un ser humano'],
    ]),
    choose('¿Cuántos órdenes tiene el rayo de la creación?', '7️⃣|Siete', ['3️⃣|Tres', '🔢|Doce']),
    yesNo('El planeta Tierra es un Mesocosmos. ¿Verdadero?', true),
  ],

  'libros-b-16': [
    order('Ordena los primeros cinco círculos', ['🌙|Luna', '💧|Mercurio', '💖|Venus', '☀️|Sol', '🔴|Marte']),
    choose('¿Cómo se llama el primer círculo, la esfera de la Luna?', '🌙|El Limbo', ['🏖️|La playa', '🏔️|La montaña']),
    choose('¿Qué se mueve en el círculo de Venus?', '🍬|El placer', ['📚|El estudio', '🏃|El deporte']),
    yesNo('Después del placer viene el dolor. ¿Verdadero?', true),
  ],

  'libros-b-17': [
    order('Ordena del sexto al noveno círculo', ['🟠|Júpiter', '🪐|Saturno', '🔵|Urano', '🌊|Neptuno']),
    match('Une cada esfera con lo que encontramos', [
      ['🟠|Júpiter', '👑|Egoísmo y tiranía'],
      ['🪐|Saturno', '💥|Violencia'],
      ['🔵|Urano', '🤥|Mentira'],
      ['🌊|Neptuno', '🗡️|Traición'],
    ]),
    choose('¿Cuál es lo contrario de la generosidad de Júpiter?', '🤐|El egoísmo', ['🎁|Regalar', '🤝|Compartir']),
    yesNo('Neptuno es la esfera de los traidores. ¿Verdadero?', true),
  ],
};
