// Fase A · conferencias 04, 05 y 06, 07
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-a-04': [
    choose('¿Cuántos centros tiene la máquina humana?', '7️⃣|Siete', ['3️⃣|Tres', '5️⃣|Cinco']),
    match('Une cada centro con lo que hace', [
      ['❤️|Emocional inferior', '😊|Sentir'],
      ['💭|Intelectual inferior', '🤔|Pensar'],
      ['🏃|Motor', '🛠️|Hacer'],
      ['⚖️|Emocional superior', '🧐|Juzgar'],
      ['📚|Intelectual superior', '💡|Saber'],
    ]),
    match('Une cada centro con su sentido', [
      ['🌱|Sexual', '🤚|Tacto'],
      ['🌊|Instintivo', '👅|Gusto'],
      ['❤️|Emocional', '👃|Olfato'],
      ['💭|Intelectual', '👂|Oído'],
      ['🏃|Motor', '👁️|Vista'],
    ]),
    yesNo('Los dos centros superiores no cayeron y trabajan equilibrados. ¿Verdadero?', true),
    choose('Para equilibrar los centros, ¿qué debemos hacer primero?', '👀|Observarlos', ['😴|Dormirnos', '🏃|Correr rápido']),
  ],

  'libros-a-05': [
    choose('¿Qué es una dimensión?', '🧠|Un nivel de conciencia', ['🏠|Un tipo de casa', '🍎|Un tipo de fruta']),
    choose('¿Cuántas dimensiones básicas se conocen en la naturaleza?', '7️⃣|Siete', ['3️⃣|Tres', '9️⃣|Nueve']),
    order('Ordena las dimensiones de la primera a la quinta', ['📏|Longitud', '🟩|Superficie', '🧊|Volumen', '⏳|Tiempo', '♾️|Eternidad']),
    match('Une cada dimensión con lo que encontramos', [
      ['3️⃣|Tercera', '🧍|Cuerpo físico'],
      ['4️⃣|Cuarta', '💧|Cuerpo vital'],
      ['5️⃣|Quinta', '♾️|Eternidad'],
      ['7️⃣|Séptima', '💡|El Íntimo'],
    ]),
    choose('¿Con qué se va de la tercera a la quinta dimensión?', '🌙|Con desdoblamientos', ['🧘|Con meditación', '🏊|Con estados Jinas']),
    yesNo('Cada cuerpo maneja una dimensión diferente. ¿Verdadero?', true),
  ],

  'libros-a-07': [
    match('Une cada conjuración con lo que hace', [
      ['🌬️|Belilín', '🧹|Aleja lo negativo'],
      ['⭕|Círculo mágico', '🛡️|Protege el lugar'],
      ['⚡|Júpiter', '⚔️|Defiende del ataque'],
      ['🚪|Pentalfa', '🏠|Cierra al salir de casa'],
    ]),
    choose('¿Dónde nos concentramos al conjurar?', '❤️|En el corazón', ['🦶|En los pies', '👂|En las orejas']),
    choose('¿De qué color es la luz que imaginamos en el círculo mágico?', '🟢|Verde brillante', ['🔴|Roja', '🔵|Azul']),
    yesNo('Cuando decimos «yo te conjuro», conjuramos al yo psicológico, al defecto. ¿Verdadero?', true),
  ],
};
