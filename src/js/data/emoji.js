// Paleta de emojis con su nombre en español (al elegir uno se rellena lo que dice la voz).

export const EMOJI_CATEGORIES = [
  {
    name: 'Animales', icon: '🐶', items: [
      ['🐶', 'perro'], ['🐱', 'gato'], ['🐭', 'ratón'], ['🐹', 'hámster'], ['🐰', 'conejo'], ['🦊', 'zorro'],
      ['🐻', 'oso'], ['🐼', 'panda'], ['🐨', 'koala'], ['🐯', 'tigre'], ['🦁', 'león'], ['🐮', 'vaca'],
      ['🐷', 'cerdo'], ['🐸', 'rana'], ['🐵', 'mono'], ['🐔', 'gallina'], ['🐓', 'gallo'], ['🐤', 'pollito'],
      ['🐧', 'pingüino'], ['🐦', 'pájaro'], ['🦆', 'pato'], ['🦉', 'búho'], ['🦅', 'águila'], ['🦜', 'loro'],
      ['🦩', 'flamenco'], ['🐴', 'caballo'], ['🦄', 'unicornio'], ['🦓', 'cebra'], ['🦒', 'jirafa'], ['🐘', 'elefante'],
      ['🦛', 'hipopótamo'], ['🦏', 'rinoceronte'], ['🐪', 'camello'], ['🐑', 'oveja'], ['🐐', 'cabra'], ['🦌', 'ciervo'],
      ['🐿️', 'ardilla'], ['🦔', 'erizo'], ['🦇', 'murciélago'], ['🐺', 'lobo'], ['🦘', 'canguro'], ['🦥', 'perezoso'],
      ['🐢', 'tortuga'], ['🐍', 'serpiente'], ['🦎', 'lagartija'], ['🐊', 'cocodrilo'], ['🦖', 'dinosaurio'], ['🦕', 'dinosaurio de cuello largo'],
      ['🐙', 'pulpo'], ['🦀', 'cangrejo'], ['🐟', 'pez'], ['🐠', 'pez tropical'], ['🐬', 'delfín'], ['🐳', 'ballena'],
      ['🦈', 'tiburón'], ['🦭', 'foca'], ['🐝', 'abeja'], ['🐛', 'gusano'], ['🦋', 'mariposa'], ['🐌', 'caracol'],
      ['🐞', 'mariquita'], ['🐜', 'hormiga'], ['🕷️', 'araña'],
    ],
  },
  {
    name: 'Comida', icon: '🍎', items: [
      ['🍎', 'manzana'], ['🍏', 'manzana verde'], ['🍐', 'pera'], ['🍊', 'naranja'], ['🍋', 'limón'], ['🍌', 'plátano'],
      ['🍉', 'sandía'], ['🍇', 'uvas'], ['🍓', 'fresa'], ['🫐', 'arándanos'], ['🍒', 'cerezas'], ['🍑', 'durazno'],
      ['🥭', 'mango'], ['🍍', 'piña'], ['🥥', 'coco'], ['🥝', 'kiwi'], ['🍅', 'tomate'], ['🍆', 'berenjena'],
      ['🥑', 'aguacate'], ['🥦', 'brócoli'], ['🥕', 'zanahoria'], ['🌽', 'maíz'], ['🥒', 'pepino'], ['🥔', 'papa'],
      ['🧅', 'cebolla'], ['🍄', 'hongo'], ['🥜', 'maní'], ['🌰', 'castaña'], ['🍞', 'pan'], ['🧀', 'queso'],
      ['🥚', 'huevo'], ['🥞', 'panqueques'], ['🧇', 'waffle'], ['🍗', 'pollo'], ['🍔', 'hamburguesa'], ['🍟', 'papas fritas'],
      ['🍕', 'pizza'], ['🌭', 'hot dog'], ['🌮', 'taco'], ['🍝', 'espagueti'], ['🍚', 'arroz'], ['🥗', 'ensalada'],
      ['🍦', 'helado'], ['🍩', 'dona'], ['🍪', 'galleta'], ['🎂', 'pastel'], ['🧁', 'cupcake'], ['🍫', 'chocolate'],
      ['🍬', 'caramelo'], ['🍭', 'paleta'], ['🍯', 'miel'], ['🥛', 'leche'], ['🧃', 'jugo'], ['💧', 'agua'],
    ],
  },
  {
    name: 'Casa y cosas', icon: '🧸', items: [
      ['🏠', 'casa'], ['🚪', 'puerta'], ['🪟', 'ventana'], ['🪑', 'silla'], ['🛏️', 'cama'], ['🛁', 'bañera'],
      ['🚽', 'inodoro'], ['🪥', 'cepillo de dientes'], ['🧼', 'jabón'], ['🧽', 'esponja'], ['🧸', 'osito de peluche'], ['🎈', 'globo'],
      ['🎁', 'regalo'], ['⚽', 'pelota'], ['🏀', 'balón'], ['🪁', 'cometa'], ['🪀', 'yoyó'], ['🧩', 'rompecabezas'],
      ['🎨', 'pinturas'], ['✏️', 'lápiz'], ['🖍️', 'crayón'], ['📚', 'libros'], ['📖', 'libro'], ['✂️', 'tijeras'],
      ['🎒', 'mochila'], ['👕', 'camiseta'], ['👖', 'pantalón'], ['👗', 'vestido'], ['🧦', 'calcetines'], ['👟', 'zapatillas'],
      ['👞', 'zapato'], ['🧢', 'gorra'], ['🎩', 'sombrero'], ['👓', 'lentes'], ['☂️', 'paraguas'], ['⌚', 'reloj'],
      ['⏰', 'despertador'], ['📱', 'teléfono'], ['💻', 'computadora'], ['📺', 'televisión'], ['💡', 'foco'], ['🔑', 'llave'],
      ['🥄', 'cuchara'], ['🍴', 'cubiertos'], ['🍽️', 'plato'], ['🥤', 'vaso'], ['🧺', 'cesta'], ['🪣', 'balde'],
      ['🔔', 'campana'], ['🎸', 'guitarra'], ['🥁', 'tambor'], ['🎹', 'piano'], ['🎺', 'trompeta'], ['🎻', 'violín'],
    ],
  },
  {
    name: 'Naturaleza', icon: '🌳', items: [
      ['☀️', 'sol'], ['🌙', 'luna'], ['⭐', 'estrella'], ['☁️', 'nube'], ['🌧️', 'lluvia'], ['⛈️', 'tormenta'],
      ['❄️', 'nieve'], ['⛄', 'muñeco de nieve'], ['🌈', 'arcoíris'], ['⚡', 'rayo'], ['🔥', 'fuego'], ['💧', 'gota de agua'],
      ['🌊', 'ola'], ['🌳', 'árbol'], ['🌲', 'pino'], ['🌴', 'palmera'], ['🌵', 'cactus'], ['🌻', 'girasol'],
      ['🌷', 'tulipán'], ['🌹', 'rosa'], ['🌸', 'flor'], ['🍁', 'hoja'], ['🍀', 'trébol'], ['🌱', 'planta'],
      ['🪨', 'piedra'], ['⛰️', 'montaña'], ['🌋', 'volcán'], ['🏝️', 'isla'], ['🌍', 'planeta Tierra'], ['🪐', 'planeta'],
      ['🌞', 'sol sonriente'], ['🌛', 'luna creciente'], ['🌪️', 'tornado'], ['🍂', 'hojas secas'],
    ],
  },
  {
    name: 'Transporte', icon: '🚗', items: [
      ['🚗', 'carro'], ['🚕', 'taxi'], ['🚌', 'autobús'], ['🚓', 'patrulla de policía'], ['🚑', 'ambulancia'], ['🚒', 'camión de bomberos'],
      ['🚜', 'tractor'], ['🚚', 'camión'], ['🏍️', 'moto'], ['🚲', 'bicicleta'], ['🛴', 'patineta'], ['🚂', 'tren'],
      ['🚀', 'cohete'], ['✈️', 'avión'], ['🚁', 'helicóptero'], ['⛵', 'velero'], ['🚢', 'barco'], ['🛶', 'canoa'],
      ['🚤', 'lancha'], ['🛸', 'platillo volador'], ['🚦', 'semáforo'], ['🛻', 'camioneta'], ['🚐', 'furgoneta'],
    ],
  },
  {
    name: 'Personas', icon: '😀', items: [
      ['😀', 'feliz'], ['😢', 'triste'], ['😠', 'enojado'], ['😨', 'asustado'], ['😲', 'sorprendido'], ['😴', 'dormido'],
      ['🤒', 'enfermo'], ['😋', 'delicioso'], ['🥰', 'cariñoso'], ['😎', 'genial'], ['🤔', 'pensando'], ['😂', 'riendo'],
      ['👦', 'niño'], ['👧', 'niña'], ['👶', 'bebé'], ['👨', 'papá'], ['👩', 'mamá'], ['👴', 'abuelo'],
      ['👵', 'abuela'], ['👮', 'policía'], ['🧑‍🚒', 'bombero'], ['🧑‍⚕️', 'doctor'], ['🧑‍🍳', 'cocinero'], ['🧑‍🏫', 'maestra'],
      ['👷', 'constructor'], ['🧑‍🚀', 'astronauta'], ['🧑‍🌾', 'granjero'], ['🦸', 'superhéroe'], ['🧙', 'mago'], ['🧚', 'hada'],
      ['👻', 'fantasma'], ['🤖', 'robot'], ['👽', 'extraterrestre'], ['🎅', 'Papá Noel'], ['🤴', 'príncipe'], ['👸', 'princesa'],
    ],
  },
  {
    name: 'Cuerpo', icon: '✋', items: [
      ['👁️', 'ojo'], ['👀', 'ojos'], ['👂', 'oreja'], ['👃', 'nariz'], ['👄', 'boca'], ['🦷', 'diente'],
      ['👅', 'lengua'], ['✋', 'mano'], ['🦶', 'pie'], ['🦵', 'pierna'], ['💪', 'brazo'], ['🧠', 'cerebro'],
      ['❤️', 'corazón'], ['👍', 'muy bien'], ['👏', 'aplausos'], ['🙌', 'manos arriba'],
    ],
  },
  {
    name: 'Formas y números', icon: '🔺', items: [
      ['🔴', 'círculo rojo'], ['🟠', 'círculo naranja'], ['🟡', 'círculo amarillo'], ['🟢', 'círculo verde'], ['🔵', 'círculo azul'], ['🟣', 'círculo morado'],
      ['🟤', 'círculo marrón'], ['⚫', 'círculo negro'], ['⚪', 'círculo blanco'], ['🟥', 'cuadrado rojo'], ['🟧', 'cuadrado naranja'], ['🟨', 'cuadrado amarillo'],
      ['🟩', 'cuadrado verde'], ['🟦', 'cuadrado azul'], ['🟪', 'cuadrado morado'], ['⬛', 'cuadrado negro'], ['⬜', 'cuadrado blanco'], ['🔺', 'triángulo'],
      ['🔶', 'rombo naranja'], ['🔷', 'rombo azul'], ['⭐', 'estrella'], ['❤️', 'corazón'], ['💛', 'corazón amarillo'], ['💚', 'corazón verde'],
      ['💙', 'corazón azul'], ['💜', 'corazón morado'], ['➕', 'más'], ['➖', 'menos'], ['❓', 'pregunta'], ['✅', 'correcto'],
      ['0️⃣', 'cero'], ['1️⃣', 'uno'], ['2️⃣', 'dos'], ['3️⃣', 'tres'], ['4️⃣', 'cuatro'], ['5️⃣', 'cinco'],
      ['6️⃣', 'seis'], ['7️⃣', 'siete'], ['8️⃣', 'ocho'], ['9️⃣', 'nueve'], ['🔟', 'diez'],
    ],
  },
];

// Índice para buscar el nombre de un emoji.
const NAME_BY_EMOJI = new Map();
for (const cat of EMOJI_CATEGORIES) for (const [e, n] of cat.items) if (!NAME_BY_EMOJI.has(e)) NAME_BY_EMOJI.set(e, n);

export const emojiName = (e) => NAME_BY_EMOJI.get(e) || '';

export function searchEmoji(q) {
  q = q.trim().toLowerCase();
  if (!q) return [];
  const out = [];
  const seen = new Set();
  for (const cat of EMOJI_CATEGORIES) {
    for (const [e, n] of cat.items) {
      if (!seen.has(e) && n.toLowerCase().includes(q)) { out.push([e, n]); seen.add(e); }
    }
  }
  return out;
}

// Colores con nombre (para el editor de tarjetas y las plantillas).
export const NAMED_COLORS = [
  ['rojo', '#e53935'], ['azul', '#1e88e5'], ['amarillo', '#fdd835'], ['verde', '#43a047'], ['naranja', '#fb8c00'],
  ['morado', '#8e24aa'], ['rosa', '#ec407a'], ['marrón', '#795548'], ['negro', '#212121'], ['blanco', '#ffffff'],
  ['gris', '#9e9e9e'], ['celeste', '#81d4fa'],
];
