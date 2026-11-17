// Utilidades generales.

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mezcla asegurando que el orden cambie (si hay al menos dos elementos distintos).
export function shuffleChanged(arr, keyFn = (x) => x) {
  if (arr.length < 2) return arr.slice();
  const original = arr.map(keyFn).join('|');
  for (let i = 0; i < 12; i++) {
    const s = shuffle(arr);
    if (s.map(keyFn).join('|') !== original) return s;
  }
  return arr.slice().reverse();
}

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const range = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dayKeyOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return todayKey(d);
}

export const clone = (o) => JSON.parse(JSON.stringify(o));

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const hashPin = (pin) => sha256(`edujoel:${pin}`);

export function fmtDuration(sec) {
  sec = Math.round(sec || 0);
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

export function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' }) + ' ' +
    d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

export function debounce(fn, ms) {
  let t = null;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export const NUMBER_WORDS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];

export const numberWord = (n) => NUMBER_WORDS[n] ?? String(n);

// Calcula el mejor reparto en rejilla para n elementos cuadrados dentro de W x H.
export function fitGrid(W, H, n, gap = 16, aspect = 1, maxSize = Infinity) {
  let best = { cols: 1, rows: n, size: 0 };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const wSize = (W - gap * (cols - 1)) / cols;
    const hSize = ((H - gap * (rows - 1)) / rows) * aspect;
    const size = Math.min(wSize, hSize, maxSize);
    // A igual tamaño, mejor menos filas (todo en una línea se ve más claro).
    if (size > best.size + 0.5 || (Math.abs(size - best.size) <= 0.5 && rows < best.rows)) best = { cols, rows, size };
  }
  best.size = Math.max(24, Math.floor(best.size));
  return best;
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Quita el artículo inicial ("el perro" -> "perro").
export function stripArticle(word) {
  return String(word || '').replace(/^(el|la|los|las|un|una|unos|unas)\s+/i, '');
}

export function capitalize(s) {
  s = String(s || '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
