// Mascotas dibujadas en SVG (las demás son emojis). Una mascota "svg:xxx" se guarda igual que un emoji:
// student.mascot.kind = 'svg:nous'. Los dibujos son nuestros (no vienen de datos del usuario).
// Colores planos, sin degradados ni ids, para que se vea igual en cualquier tamaño y en cualquier lugar.

export const NOUS = 'svg:nous';
export const COSMO = 'svg:cosmo';

// NOUS: el guía. El "átomo íntimo": un ser puro de luz de otro plano, con forma de gota luminosa,
// rodeado de órbitas atómicas y chispas celestiales (en griego, "nous" es la mente/el espíritu).
const SPARK = (x, y, r, fill) => `<path class="nous-spark" d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${fill}"/>`;
const RAY = (deg) => `<path d="M100 4L105 36L100 48L95 36Z" transform="rotate(${deg} 100 104)" fill="#ffe28a" opacity=".7"/>`;
const NOUS_SVG = `
<svg class="m-svg nous" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- resplandor y rayos de luz -->
  <circle cx="100" cy="104" r="97" fill="#c7b8ff" opacity=".2"/>
  <circle cx="100" cy="104" r="82" fill="#a99aff" opacity=".24"/>
  <circle cx="100" cy="104" r="68" fill="#fff" opacity=".5"/>
  <g class="nous-rays">${[0, 45, 90, 135, 180, 225, 270, 315].map(RAY).join('')}</g>
  <!-- órbitas del átomo -->
  <g class="nous-orbits" fill="none" stroke-linecap="round">
    <ellipse cx="100" cy="104" rx="94" ry="26" stroke="#8f7dff" stroke-width="4.5" opacity=".9" transform="rotate(-30 100 104)"/>
    <ellipse cx="100" cy="104" rx="94" ry="26" stroke="#5cc8ff" stroke-width="4.5" opacity=".9" transform="rotate(30 100 104)"/>
    <ellipse cx="100" cy="104" rx="94" ry="26" stroke="#ffc94d" stroke-width="4.5" opacity=".95" transform="rotate(90 100 104)"/>
  </g>
  <!-- cuerpo de luz: una gota luminosa -->
  <g transform="translate(100 112) scale(1.14) translate(-100 -112)">
    <path d="M100 178C70 152 50 128 50 98A50 50 0 0 1 150 98C150 128 130 152 100 178Z" fill="#b7a5ff" opacity=".6"/>
    <path d="M100 174C73 150 54 127 54 98A46 46 0 0 1 146 98C146 127 127 150 100 174Z" fill="#fffdf2" stroke="#e4d9ff" stroke-width="3"/>
    <path d="M100 174C80 156 66 140 60 122Q100 140 140 122C134 140 120 156 100 174Z" fill="#ffe28a" opacity=".8"/>
    <ellipse cx="80" cy="68" rx="17" ry="9" fill="#fff" transform="rotate(-28 80 68)"/>
    <!-- chispa de la frente -->
    <path d="M100 64L103.4 73L112 75.5L103.4 78L100 87L96.6 78L88 75.5L96.6 73Z" fill="#ffc400" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
    <!-- cara serena: ojos en paz y una sonrisa suave -->
    <g class="nous-eyes">
      <path d="M72 106Q82 115 92 106" stroke="#3b2f8f" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M108 106Q118 115 128 106" stroke="#3b2f8f" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
    <path d="M92 123Q100 131 108 123" stroke="#3b2f8f" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <circle cx="66" cy="119" r="7" fill="#ffb3d1" opacity=".7"/>
    <circle cx="134" cy="119" r="7" fill="#ffb3d1" opacity=".7"/>
  </g>
  <!-- electrones y chispas -->
  <circle cx="177" cy="78" r="9" fill="#ffd23f" opacity=".5"/><circle cx="177" cy="78" r="5.5" fill="#ffc400" stroke="#fff" stroke-width="1.5"/>
  <circle cx="23" cy="128" r="9" fill="#5cc8ff" opacity=".5"/><circle cx="23" cy="128" r="5.5" fill="#3fb6f5" stroke="#fff" stroke-width="1.5"/>
  <circle cx="100" cy="12" r="8" fill="#a99aff" opacity=".55"/><circle cx="100" cy="12" r="5" fill="#8f7dff" stroke="#fff" stroke-width="1.5"/>
  ${SPARK(26, 44, 10, '#fff')}${SPARK(174, 152, 9, '#ffd23f')}${SPARK(38, 172, 8, '#fff')}${SPARK(160, 26, 7, '#fff')}${SPARK(184, 112, 6, '#fff')}
</svg>`;


// COSMO: el astronauta explorador, guía del curso de primero (viaja por los mundos del aprendizaje).
const COSMO_SVG = `
<svg class="m-svg cosmo" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- mochila -->
  <rect x="50" y="112" width="100" height="64" rx="22" fill="#8b97c4"/>
  <ellipse cx="42" cy="140" rx="12" ry="22" fill="#c9d1ee"/>
  <ellipse cx="158" cy="140" rx="12" ry="22" fill="#c9d1ee"/>
  <!-- botas -->
  <rect x="68" y="168" width="30" height="24" rx="12" fill="#ff9f1c"/>
  <rect x="102" y="168" width="30" height="24" rx="12" fill="#ff9f1c"/>
  <!-- cuerpo -->
  <ellipse cx="100" cy="146" rx="44" ry="42" fill="#fff" stroke="#dfe6ff" stroke-width="3"/>
  <rect x="78" y="136" width="44" height="30" rx="9" fill="#e9eeff"/>
  <circle cx="90" cy="146" r="5" fill="#ff5a5f"/><circle cx="106" cy="146" r="5" fill="#2ecc71"/>
  <path d="M100 152L102 157L108 158L103.4 161.6L105 167L100 164L95 167L96.6 161.6L92 158L98 157Z" fill="#ffc400"/>
  <!-- brazos -->
  <ellipse cx="54" cy="142" rx="14" ry="26" fill="#fff" stroke="#dfe6ff" stroke-width="3" transform="rotate(14 54 142)"/>
  <ellipse cx="146" cy="142" rx="14" ry="26" fill="#fff" stroke="#dfe6ff" stroke-width="3" transform="rotate(-14 146 142)"/>
  <circle cx="48" cy="166" r="9" fill="#ff9f1c"/><circle cx="152" cy="166" r="9" fill="#ff9f1c"/>
  <!-- aro del cuello -->
  <ellipse cx="100" cy="128" rx="38" ry="9" fill="#ffd23f"/>
  <!-- antena -->
  <rect x="97" y="16" width="6" height="22" rx="3" fill="#c9d1ee"/>
  <circle class="cosmo-bulb" cx="100" cy="13" r="8" fill="#ffd23f" stroke="#fff" stroke-width="2"/>
  <!-- casco -->
  <circle cx="100" cy="82" r="58" fill="#fff" stroke="#dfe6ff" stroke-width="4"/>
  <circle cx="44" cy="86" r="9" fill="#ff9f1c"/><circle cx="156" cy="86" r="9" fill="#ff9f1c"/>
  <!-- visor -->
  <rect x="56" y="52" width="88" height="68" rx="34" fill="#2b2f6b"/>
  <ellipse cx="100" cy="94" rx="36" ry="24" fill="#4a55c0" opacity=".55"/>
  <path d="M68 70Q76 58 92 58" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>
  <!-- cara luminosa -->
  <g class="cosmo-eyes">
    <ellipse cx="84" cy="90" rx="7" ry="10" fill="#7ff0ff"/>
    <ellipse cx="116" cy="90" rx="7" ry="10" fill="#7ff0ff"/>
    <circle cx="86" cy="86" r="2.6" fill="#fff"/><circle cx="118" cy="86" r="2.6" fill="#fff"/>
  </g>
  <path d="M88 106Q100 117 112 106" stroke="#7ff0ff" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="70" cy="104" r="5.5" fill="#ff8fb8" opacity=".55"/><circle cx="130" cy="104" r="5.5" fill="#ff8fb8" opacity=".55"/>
  <!-- chispas -->
  ${SPARK(24, 40, 9, '#ffd23f')}${SPARK(178, 52, 8, '#fff')}${SPARK(176, 120, 6, '#ffd23f')}${SPARK(20, 110, 6, '#fff')}
</svg>`;

const ART = { [NOUS]: NOUS_SVG, [COSMO]: COSMO_SVG };

export const isArt = (kind) => typeof kind === 'string' && kind.startsWith('svg:');

// Lo que se dibuja para una mascota: el SVG propio, o el emoji como texto.
export function glyph(kind) {
  if (isArt(kind) && ART[kind]) {
    const t = document.createElement('template');
    t.innerHTML = ART[kind].trim();
    return t.content.firstElementChild;
  }
  return document.createTextNode(kind || '');
}

// Para textos sueltos ("Mascota: 🦖 Dino"): las mascotas dibujadas no tienen carácter.
export const kindText = (kind) => (isArt(kind) ? '' : kind || '');
