// Fase A · conferencias 19 a 23
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-a-19': [
    match('Une cada palabra con lo que es', [
      ['💭|Estados', '🏠|Lo de adentro'],
      ['🎉|Eventos', '🌳|Lo de afuera'],
    ]),
    sort('¿Es un evento o un estado?', [
      ['🎉|Evento', ['🎂|Una fiesta', '🚗|Un viaje']],
      ['💭|Estado', ['😊|Estar feliz', '😟|Estar preocupado']],
    ]),
    choose('¿De qué depende vivir de forma consciente?', '💗|De mis estados interiores', ['🍀|De la suerte', '💰|Del dinero']),
    yesNo('Un evento agradable siempre se siente bien por dentro. ¿Verdadero?', false),
    yesNo('Saber vivir es combinar bien los estados interiores con los eventos. ¿Verdadero?', true),
  ],

  'libros-a-20': [
    choose('¿Cómo se llama el lugar interior donde está cada uno de nosotros?', '🗺️|País psicológico', ['🏙️|Ciudad vieja', '🏝️|Isla del tesoro']),
    match('Une cada palabra con lo que es', [
      ['🌎|País exterior', '🏠|Donde vivo'],
      ['🧭|País psicológico', '💭|Dentro de mí'],
      ['🎭|Yoes', '👥|Mis acompañantes'],
    ]),
    sort('¿Barrio bonito o barrio peligroso de mi interior?', [
      ['🏡|Barrio bonito', ['💗|Amor', '😊|Alegría']],
      ['🚧|Barrio peligroso', ['😡|Ira', '🤥|Mentira']],
    ]),
    choose('¿Quiénes nos llevan a cada lugar del país psicológico?', '🎭|Nuestros yoes', ['🐶|Las mascotas', '🚌|Los buses']),
    yesNo('Aunque seamos buenos por fuera, por dentro podemos estar en un mal barrio. ¿Verdadero?', true),
  ],

  'libros-a-21': [
    choose('¿Qué es la concentración?', '🎯|Conciencia centrada en la acción', ['🌀|Hacer mil cosas a la vez', '😴|Estar dormido']),
    choose('¿Cuál es lo contrario de la concentración?', '🦋|La distracción', ['🎯|La atención', '🧘|La calma']),
    sort('¿Concentrado o distraído?', [
      ['🎯|Concentrado', ['1️⃣|Hacer una cosa a la vez', '❤️|Estar atento a lo que hago']],
      ['🦋|Distraído', ['💭|Pensar en otra cosa', '🔀|Dejar una cosa por otra']],
    ]),
    match('Une cada palabra con lo que significa', [
      ['👀|Velar', '☀️|Hacer las cosas despierto'],
      ['🙏|Orar', '💬|Pedir que se elimine el defecto'],
      ['😌|Relajarse', '🕊️|Soltar la tensión'],
    ]),
    order('Ordena los pasos de la práctica', ['⭕|Protegerme', '🙏|Pedir ayuda a los Padres', '😌|Relajar el cuerpo', '❤️|Concentrarme en el corazón', '✨|Pedir que se elimine el yo']),
  ],

  'libros-a-22': [
    choose('Para lograr el cambio interior, ¿qué es fundamental?', '🧘|La meditación', ['📺|La televisión', '🎮|Los videojuegos']),
    choose('Ante algo desagradable, ¿qué debemos hacer?', '🔍|Meditar y sacar lo útil', ['😤|Protestar', '👉|Culpar a otros']),
    match('Une cada palabra con lo que significa', [
      ['🛠️|Sabor trabajo', '🌱|Aprender de lo que pasa'],
      ['🌀|Sabor vida', '😵|Identificarme con lo que pasa'],
      ['🧘|Meditación', '🤔|Comprender un defecto'],
    ]),
    yesNo('Culpar a otros nos ayuda a comprender nuestros errores. ¿Verdadero?', false),
    yesNo('Los problemas de la vida se repiten y no tienen una solución final. ¿Verdadero?', true),
  ],

  'libros-a-23': [
    choose('¿Cómo es una persona fanática?', '🙈|Cree que ya está salvada', ['🏃|Practica mucho', '🔬|Comprueba todo']),
    match('Une cada persona con lo que hace', [
      ['📖|Creyente', '😌|Cree que saber basta'],
      ['🛠️|Práctico', '🏆|Muestra sus obras'],
      ['🗣️|Fanático', '👎|Critica y no practica'],
    ]),
    sort('¿Fanático o práctico?', [
      ['🗣️|Fanático', ['📚|Solo lee y habla', '👎|Critica a otros']],
      ['🛠️|Práctico', ['✅|Practica y comprueba', '🏆|Muestra sus obras']],
    ]),
    yesNo('En este camino solo se avanza con las obras. ¿Verdadero?', true),
    yesNo('El peor error es creerse y sentirse bueno. ¿Verdadero?', true),
  ],
};
