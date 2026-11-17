// Pegatinas del álbum, mascotas y accesorios de la tienda.

export const STICKER_PAGES = [
  {
    title: 'Animales', icon: '🐾', items: [
      ['🐶', 'perrito'], ['🐱', 'gatito'], ['🐰', 'conejo'], ['🦊', 'zorro'], ['🐻', 'oso'], ['🐼', 'panda'],
      ['🐨', 'koala'], ['🐯', 'tigre'], ['🦁', 'león'], ['🐮', 'vaca'], ['🐷', 'cerdito'], ['🐸', 'rana'],
      ['🐵', 'mono'], ['🐧', 'pingüino'], ['🦉', 'búho'], ['🐴', 'caballo'], ['🦒', 'jirafa'], ['🐘', 'elefante'],
    ],
  },
  {
    title: 'Mar y dinosaurios', icon: '🦕', items: [
      ['🦕', 'dinosaurio cuello largo'], ['🦖', 'tiranosaurio'], ['🐳', 'ballena'], ['🐬', 'delfín'], ['🐟', 'pez'], ['🐠', 'pez payaso'],
      ['🐙', 'pulpo'], ['🦀', 'cangrejo'], ['🦈', 'tiburón'], ['🐢', 'tortuga'], ['🦭', 'foca'], ['🐚', 'concha'],
    ],
  },
  {
    title: 'Comida rica', icon: '🍓', items: [
      ['🍎', 'manzana'], ['🍌', 'plátano'], ['🍇', 'uvas'], ['🍓', 'fresa'], ['🍉', 'sandía'], ['🍕', 'pizza'],
      ['🍔', 'hamburguesa'], ['🍟', 'papas fritas'], ['🍦', 'helado'], ['🍩', 'dona'], ['🍪', 'galleta'], ['🧁', 'cupcake'],
    ],
  },
  {
    title: 'Vehículos', icon: '🚀', items: [
      ['🚗', 'carro'], ['🚕', 'taxi'], ['🚌', 'autobús'], ['🚓', 'patrulla'], ['🚑', 'ambulancia'], ['🚒', 'bomberos'],
      ['🚜', 'tractor'], ['🚀', 'cohete'], ['✈️', 'avión'], ['🚁', 'helicóptero'], ['🚂', 'tren'], ['⛵', 'velero'],
    ],
  },
  {
    title: 'Cielo y naturaleza', icon: '🌈', items: [
      ['🌞', 'sol'], ['🌙', 'luna'], ['⭐', 'estrella'], ['🌈', 'arcoíris'], ['⚡', 'rayo'], ['❄️', 'copo de nieve'],
      ['🌻', 'girasol'], ['🌳', 'árbol'], ['🍄', 'hongo'], ['🌋', 'volcán'], ['🪐', 'planeta'], ['☄️', 'cometa'],
    ],
  },
  {
    title: 'Fantasía', icon: '🦄', items: [
      ['🦄', 'unicornio'], ['🐉', 'dragón'], ['🧚', 'hada'], ['👑', 'corona'], ['💎', 'diamante'], ['🏰', 'castillo'],
      ['🧙', 'mago'], ['👻', 'fantasmita'], ['🤖', 'robot'], ['👽', 'extraterrestre'], ['🦸', 'superhéroe'], ['🪄', 'varita mágica'],
    ],
  },
];

export const ALL_STICKERS = STICKER_PAGES.flatMap((p) => p.items.map(([e, n]) => ({ e, n })));

export const MASCOTS = [
  { e: 'svg:nous', n: 'Nous' }, { e: 'svg:cosmo', n: 'Cosmo' }, { e: '🦖', n: 'Dino' }, { e: '🤖', n: 'Robi' }, { e: '🐶', n: 'Toby' }, { e: '🐱', n: 'Michi' },
  { e: '🦄', n: 'Luna' }, { e: '🐼', n: 'Pando' }, { e: '🐸', n: 'Saltarín' }, { e: '🦁', n: 'Leo' },
  { e: '🐲', n: 'Chispa' }, { e: '🐧', n: 'Pingo' }, { e: '🐵', n: 'Coco' }, { e: '🐰', n: 'Orejitas' },
];

export const AVATARS = ['👦', '👧', '🧒', '👶', '🦸', '🧑‍🚀', '🐯', '🦊', '🐻', '🐵', '🦁', '🐼'];

export const SHOP = [
  { id: 'hat-cap', slot: 'hat', e: '🧢', n: 'Gorra', price: 5 },
  { id: 'hat-straw', slot: 'hat', e: '👒', n: 'Sombrero de paja', price: 8 },
  { id: 'hat-top', slot: 'hat', e: '🎩', n: 'Sombrero de mago', price: 10 },
  { id: 'hat-helmet', slot: 'hat', e: '⛑️', n: 'Casco', price: 12 },
  { id: 'hat-grad', slot: 'hat', e: '🎓', n: 'Birrete', price: 15 },
  { id: 'hat-crown', slot: 'hat', e: '👑', n: 'Corona', price: 25 },
  { id: 'face-glasses', slot: 'face', e: '👓', n: 'Lentes', price: 6 },
  { id: 'face-sun', slot: 'face', e: '🕶️', n: 'Lentes de sol', price: 10 },
  { id: 'face-goggles', slot: 'face', e: '🥽', n: 'Gafas de buceo', price: 12 },
  { id: 'neck-bow', slot: 'neck', e: '🎀', n: 'Moño', price: 5 },
  { id: 'neck-scarf', slot: 'neck', e: '🧣', n: 'Bufanda', price: 8 },
  { id: 'neck-medal', slot: 'neck', e: '🏅', n: 'Medalla', price: 15 },
  { id: 'hand-balloon', slot: 'hand', e: '🎈', n: 'Globo', price: 4 },
  { id: 'hand-ice', slot: 'hand', e: '🍦', n: 'Helado', price: 6 },
  { id: 'hand-ball', slot: 'hand', e: '⚽', n: 'Pelota', price: 6 },
  { id: 'hand-teddy', slot: 'hand', e: '🧸', n: 'Osito', price: 10 },
  { id: 'hand-wand', slot: 'hand', e: '🪄', n: 'Varita mágica', price: 15 },
  { id: 'hand-trophy', slot: 'hand', e: '🏆', n: 'Trofeo', price: 30 },
  { id: 'bg-sky', slot: 'bg', e: '☁️', n: 'Cielo', price: 0, css: 'linear-gradient(180deg, #7cc8ff 0%, #bfeaff 55%, #e6fbcf 100%)' },
  { id: 'bg-rainbow', slot: 'bg', e: '🌈', n: 'Arcoíris', price: 10, css: 'linear-gradient(160deg, #ff9a9e 0%, #fecf71 25%, #a8e063 50%, #7fd1ff 75%, #c792ff 100%)' },
  { id: 'bg-sea', slot: 'bg', e: '🌊', n: 'Fondo del mar', price: 12, css: 'linear-gradient(180deg, #4fc3f7 0%, #0288d1 60%, #01579b 100%)' },
  { id: 'bg-jungle', slot: 'bg', e: '🌴', n: 'Selva', price: 12, css: 'linear-gradient(180deg, #b9f6ca 0%, #69f0ae 45%, #2e7d32 100%)' },
  { id: 'bg-candy', slot: 'bg', e: '🍭', n: 'País de dulces', price: 12, css: 'linear-gradient(160deg, #ffd1ec 0%, #ffb3d9 40%, #d1b3ff 100%)' },
  { id: 'bg-space', slot: 'bg', e: '🌌', n: 'Espacio', price: 15, css: 'radial-gradient(circle at 20% 20%, #5c6bc0 0%, #283593 35%, #0d0f3a 100%)' },
];

export const SLOT_NAMES = { hat: 'Sombreros', face: 'Lentes', neck: 'Cuello', hand: 'En la mano', bg: 'Fondos' };

export const shopItem = (id) => SHOP.find((i) => i.id === id) || null;

export function backgroundCss(student) {
  const bg = shopItem(student?.mascot?.wearing?.bg || 'bg-sky');
  return (bg && bg.css) || SHOP.find((i) => i.id === 'bg-sky').css;
}
