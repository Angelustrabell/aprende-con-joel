// Genera build/icon.png (256x256): estrella amarilla sobre fondo morado redondeado.
// Uso: node build/make-icon.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const S = 256;
const SS = 4; // submuestreo para suavizar bordes

const star = [];
for (let k = 0; k < 10; k++) {
  const a = (-90 + k * 36) * (Math.PI / 180);
  const r = k % 2 === 0 ? 96 : 40;
  star.push([128 + r * Math.cos(a), 140 + r * Math.sin(a)]);
}
const small = [];
for (let k = 0; k < 10; k++) {
  const a = (-90 + k * 36) * (Math.PI / 180);
  const r = k % 2 === 0 ? 22 : 9;
  small.push([200 + r * Math.cos(a), 56 + r * Math.sin(a)]);
}

function inPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function inRoundRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

function sample(x, y) {
  // Devuelve [r,g,b,a] 0..255
  if (!inRoundRect(x, y, 8, 8, 248, 248, 56)) return [0, 0, 0, 0];
  if (inPoly(x, y, star)) {
    // estrella con un poco de sombra interior abajo
    const shade = y > 170 ? 0.9 : 1;
    return [255 * shade, 210 * shade, 63 * shade, 255];
  }
  if (inPoly(x, y, small)) return [255, 255, 255, 255];
  if (inPoly(x - 6, y - 8, star)) return [70, 40, 170, 255]; // sombra de la estrella
  const t = (y - 8) / 240;
  return [139 + (91 - 139) * t, 108 + (62 - 108) * t, 255 + (232 - 255) * t, 255];
}

const raw = Buffer.alloc((S * 4 + 1) * S);
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0;
  for (let x = 0; x < S; x++) {
    let r = 0; let g = 0; let b = 0; let a = 0;
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const c = sample(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS);
        r += c[0] * c[3]; g += c[1] * c[3]; b += c[2] * c[3]; a += c[3];
      }
    }
    const o = y * (S * 4 + 1) + 1 + x * 4;
    raw[o] = a ? Math.round(r / a) : 0;
    raw[o + 1] = a ? Math.round(g / a) : 0;
    raw[o + 2] = a ? Math.round(b / a) : 0;
    raw[o + 3] = Math.round(a / (SS * SS));
  }
}

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = -1;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0);
ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8; // bits
ihdr[9] = 6; // RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
const out = path.join(__dirname, 'icon.png');
fs.writeFileSync(out, png);
console.log('Icono creado:', out, png.length, 'bytes');
