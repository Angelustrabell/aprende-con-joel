// Fase B · conferencias 06 a 11
// (Se evitan los detalles sexuales de 07, 08, 09 y 10: solo ideas generales.)
const { choose, yesNo, match, order, sort, memory } = require('./kit');

module.exports = {
  'libros-b-06': [
    choose('¿Cuántas iglesias y chakras tenemos?', '7️⃣|Siete', ['3️⃣|Tres', '🔢|Doce']),
    match('Une cada palabra con lo que es', [
      ['⛪|Iglesia', '📚|Centro de sabiduría'],
      ['🎡|Chakra', '⚡|Rueda de energía'],
      ['🌐|Nadis', '🛤️|Canales de energía'],
    ]),
    yesNo('La palabra chakra significa «rueda». ¿Verdadero?', true),
    yesNo('Hoy los chakras giran en el sentido correcto. ¿Verdadero?', false),
  ],

  'libros-b-07': [
    choose('¿Cuántas iniciaciones de Misterios Mayores hay?', '5️⃣|Cinco', ['2️⃣|Dos', '9️⃣|Nueve']),
    match('Une cada iniciación con el poder que da', [
      ['1️⃣|Primera', '⛏️|Gnomos y Pigmeos'],
      ['2️⃣|Segunda', '💧|Ondinas y Nereidas'],
      ['3️⃣|Tercera', '🔥|Salamandras'],
      ['4️⃣|Cuarta', '🌬️|Silfos y Sílfides'],
    ]),
    match('Une cada prueba con lo que enseña', [
      ['🌍|Tierra', '🪨|No temerle a la pobreza'],
      ['💧|Agua', '🔄|Adaptarse a todo'],
      ['🔥|Fuego', '🕊️|Serenidad y dulzura'],
      ['🌬️|Aire', '🎈|No desesperarse al perder'],
    ]),
    yesNo('Las iniciaciones verdaderas son internas, del alma. ¿Verdadero?', true),
    yesNo('Los iracundos y coléricos pasan fácilmente la prueba del fuego. ¿Verdadero?', false),
  ],

  'libros-b-08': [
    choose('¿Cómo se llama el Fuego Sagrado que despierta en nosotros?', '🔥|Kundalini', ['❄️|Hielo', '🌧️|Lluvia']),
    match('Une cada palabra con lo que es', [
      ['💧|Mercurio', '🌊|Las aguas'],
      ['🔥|Azufre', '✨|El Fuego Sagrado'],
      ['🕊️|Castidad', '🏛️|Fundamento de la Gran Obra'],
    ]),
    choose('¿Qué controla el ascenso del Kundalini?', '❤️|Los méritos del corazón', ['💰|El dinero', '🍀|La suerte']),
    yesNo('El Fuego purifica todas las cosas. ¿Verdadero?', true),
    yesNo('La tentación es fuego y el triunfo sobre la tentación es luz. ¿Verdadero?', true),
  ],

  'libros-b-09': [
    choose('En el bautismo, ¿qué se le echa en la cabeza al bautizado?', '💧|Agua', ['🍯|Miel', '🥛|Leche']),
    order('Ordena los tres bautismos', ['💧|Agua', '🔥|Fuego', '💡|Luz']),
    match('Une cada cosa con lo que representa', [
      ['⛲|Pila bautismal', '💧|Agua lustral'],
      ['🕯️|Velas', '🔥|El fuego'],
      ['🤝|Bautismo', '📜|Un pacto con mi Dios interno'],
    ]),
    yesNo('El bautismo sirve aunque no se cumpla el pacto. ¿Verdadero?', false),
  ],

  'libros-b-10': [
    choose('¿Cuántos centros inferiores debemos equilibrar?', '5️⃣|Cinco', ['2️⃣|Dos', '7️⃣|Siete']),
    choose('¿Qué hacemos con cada detalle que se manifiesta?', '🙏|Pedir su eliminación a la Madre', ['🙈|Ignorarlo', '😡|Pelear con él']),
    match('Une cada prueba con lo que es', [
      ['🐺|Prueba del guardián', '🪞|Enfrentar mi propia bestia'],
      ['🌍|Pruebas de elementos', '🔥|Fuego, aire, agua y tierra'],
      ['📅|Disciplina diaria', '💪|Para salir bien de las pruebas'],
    ]),
    yesNo('Para empezar la Primera Montaña hay que equilibrar los centros con la muerte psicológica. ¿Verdadero?', true),
  ],

  'libros-b-11': [
    choose('¿Qué cuerpos se fabrican en la Segunda Montaña?', '🥇|Cuerpos de oro', ['🪨|Cuerpos de piedra', '☁️|Cuerpos de nube']),
    yesNo('En la Segunda Montaña se puede descansar sin morir. ¿Verdadero?', false),
    choose('¿De qué se alimenta el Cristo Íntimo?', '❤️|Del amor', ['🍔|De comida', '📺|De televisión']),
    choose('¿Qué debe desintegrarse totalmente en esta montaña?', '💀|El Yo Causa', ['🏠|La casa', '📖|El libro']),
    yesNo('Quien no está muriendo en la Segunda Montaña tiene que bajar. ¿Verdadero?', true),
  ],
};
