// Traza: repasar una letra o número con el dedo o el ratón.
import { h, onResize } from '../core/dom.js';
import { burstAt } from '../core/fx.js';
import { sfx } from '../core/sfx.js';

const FONT = '"Segoe UI", "Century Gothic", Arial, sans-serif';
const CRAYONS = ['#7c4dff', '#2196f3', '#43a047', '#ff7043', '#ec407a'];
const RAINBOW = ['#ff5a5f', '#ff9f1c', '#ffd23f', '#2ecc71', '#2ec4ff', '#a66cff'];

export default function mount(root, act, ctx) {
  const char = (act.char || 'A').trim() || 'A';
  const wrap = h('div', { class: 'act act-trace' });
  const box = h('div', { class: 'trace-box' });
  const guide = h('canvas', { class: 'trace-guide' });
  const draw = h('canvas', { class: 'trace-draw' });
  box.append(guide, draw);

  let color = CRAYONS[0];
  const crayons = CRAYONS.map((c) => {
    const b = h('button', { class: 'crayon', type: 'button', style: { '--c': c } });
    b.addEventListener('click', () => {
      color = c;
      crayons.forEach((x) => x.classList.toggle('on', x === b));
    });
    return b;
  });
  crayons[0].classList.add('on');
  const eraser = h('button', { class: 'tool-btn', type: 'button', title: 'Borrar' }, '🧽');
  eraser.addEventListener('click', () => clearDrawing());
  wrap.append(box, h('div', { class: 'trace-tools' }, ...crayons, eraser));
  root.append(wrap);

  const gctx = guide.getContext('2d');
  const dctx = draw.getContext('2d');
  let W = 0;
  let H = 0;
  let fs = 0;
  let brush = 0;
  let cx = 0;
  let baseY = 0;
  let ev = null; // lienzo pequeño para evaluar
  let mask = null;
  let tol = null;
  let glyphIdx = [];
  let glyphCell = [];
  let drawing = false;
  let last = null;
  let finished = false;
  let strokes = 0;

  const font = (size) => `bold ${size}px ${FONT}`;

  function setup(w, hh) {
    const dpr = window.devicePixelRatio || 1;
    W = Math.max(50, Math.round(w * dpr));
    H = Math.max(50, Math.round(hh * dpr));
    guide.width = W; guide.height = H;
    draw.width = W; draw.height = H;

    gctx.font = font(100);
    const m = gctx.measureText(char);
    const mw = (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) || m.width || 60;
    const mh = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || 72;
    fs = 100 * Math.min((W * 0.86) / mw, (H * 0.8) / mh);
    gctx.font = font(fs);
    const m2 = gctx.measureText(char);
    cx = W / 2 - (m2.actualBoundingBoxRight - m2.actualBoundingBoxLeft) / 2;
    baseY = H / 2 + (m2.actualBoundingBoxAscent - m2.actualBoundingBoxDescent) / 2;
    brush = Math.max(12 * dpr, fs * 0.15);

    // Guía: letra clara con borde punteado.
    gctx.clearRect(0, 0, W, H);
    gctx.textBaseline = 'alphabetic';
    gctx.fillStyle = '#efe9ff';
    gctx.fillText(char, cx, baseY);
    gctx.setLineDash([fs * 0.045, fs * 0.035]);
    gctx.lineWidth = Math.max(2 * dpr, fs * 0.014);
    gctx.strokeStyle = '#9d8cf2';
    gctx.lineJoin = 'round';
    gctx.strokeText(char, cx, baseY);
    gctx.setLineDash([]);

    // Máscaras reducidas para evaluar rápido.
    const s = 220 / Math.min(W, H);
    const sw = Math.max(10, Math.round(W * s));
    const sh = Math.max(10, Math.round(H * s));
    const mk = (paint) => {
      const c = document.createElement('canvas');
      c.width = sw; c.height = sh;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.scale(s, s);
      x.font = font(fs);
      x.textBaseline = 'alphabetic';
      x.fillStyle = '#000';
      x.strokeStyle = '#000';
      x.lineJoin = 'round';
      paint(x);
      return x.getImageData(0, 0, sw, sh).data;
    };
    mask = mk((x) => {
      x.fillText(char, cx, baseY);
      x.globalCompositeOperation = 'destination-out';
      x.lineWidth = fs * 0.05;
      x.strokeText(char, cx, baseY); // "adelgaza" la letra: no hace falta pintar el borde exacto
    });
    tol = mk((x) => {
      x.fillText(char, cx, baseY);
      x.lineWidth = brush * 1.7;
      x.strokeText(char, cx, baseY);
    });
    glyphIdx = [];
    for (let i = 0; i < sw * sh; i++) if (mask[i * 4 + 3] > 128) glyphIdx.push(i);
    // Zonas de la letra (rejilla 5x5 sobre su caja) para exigir que se repase entera.
    let minX = sw;
    let maxX = 0;
    let minY = sh;
    let maxY = 0;
    for (const i of glyphIdx) {
      const x = i % sw;
      const y = (i - x) / sw;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const cw = Math.max(1, (maxX - minX + 1) / 5);
    const ch = Math.max(1, (maxY - minY + 1) / 5);
    glyphCell = glyphIdx.map((i) => {
      const x = i % sw;
      const y = (i - x) / sw;
      return Math.min(4, Math.floor((y - minY) / ch)) * 5 + Math.min(4, Math.floor((x - minX) / cw));
    });
    const evc = document.createElement('canvas');
    evc.width = sw; evc.height = sh;
    ev = { c: evc, x: evc.getContext('2d', { willReadFrequently: true }), sw, sh };

    dctx.lineCap = 'round';
    dctx.lineJoin = 'round';
    strokes = 0;
    if (finished) celebrateDraw();
  }

  function pos(e) {
    const r = draw.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  }

  function dot(p) {
    dctx.fillStyle = color;
    dctx.beginPath();
    dctx.arc(p.x, p.y, brush / 2, 0, Math.PI * 2);
    dctx.fill();
  }

  function line(a, b) {
    dctx.strokeStyle = color;
    dctx.lineWidth = brush;
    dctx.beginPath();
    dctx.moveTo(a.x, a.y);
    dctx.lineTo(b.x, b.y);
    dctx.stroke();
  }

  function clearDrawing() {
    if (finished) return;
    dctx.clearRect(0, 0, W, H);
    strokes = 0;
  }

  function evaluate() {
    if (!ev || finished) return;
    const { x, c, sw, sh } = ev;
    x.clearRect(0, 0, sw, sh);
    x.drawImage(draw, 0, 0, sw, sh);
    const ud = x.getImageData(0, 0, sw, sh).data;
    let covered = 0;
    const cellTotal = new Array(25).fill(0);
    const cellCovered = new Array(25).fill(0);
    glyphIdx.forEach((i, k) => {
      cellTotal[glyphCell[k]]++;
      if (ud[i * 4 + 3] > 40) {
        covered++;
        cellCovered[glyphCell[k]]++;
      }
    });
    // Zonas con bastante trozo de letra que quedaron casi sin pintar (ej.: la barra de la A).
    const minCell = Math.max(8, glyphIdx.length * 0.03);
    let missingCells = 0;
    for (let c = 0; c < 25; c++) {
      if (cellTotal[c] >= minCell && cellCovered[c] / cellTotal[c] < 0.25) missingCells++;
    }
    let total = 0;
    let outside = 0;
    for (let i = 0; i < sw * sh; i += 2) {
      if (ud[i * 4 + 3] > 40) {
        total++;
        if (tol[i * 4 + 3] < 50) outside++;
      }
    }
    void c;
    const coverage = glyphIdx.length ? covered / glyphIdx.length : 0;
    const outRatio = total ? outside / total : 0;
    if (coverage >= 0.7 && missingCells === 0 && outRatio <= 0.38) {
      finished = true;
      celebrateDraw();
      box.classList.add('traced');
      burstAt(box, ['⭐', '✨', '🌟', '💫'], 14);
      ctx.correct(box);
      ctx.done();
    } else if (outRatio > 0.5 && total > glyphIdx.length / 2 * 1.2) {
      ctx.wrong(box);
      ctx.mascot?.('Sigue la línea punteada');
      setTimeout(clearDrawing, 500);
    }
  }

  function celebrateDraw() {
    dctx.clearRect(0, 0, W, H);
    const g = dctx.createLinearGradient(0, 0, W, H);
    RAINBOW.forEach((col, i) => g.addColorStop(i / (RAINBOW.length - 1), col));
    dctx.font = font(fs);
    dctx.textBaseline = 'alphabetic';
    dctx.fillStyle = g;
    dctx.fillText(char, cx, baseY);
  }

  draw.addEventListener('pointerdown', (e) => {
    if (finished) return;
    e.preventDefault();
    try { draw.setPointerCapture(e.pointerId); } catch { /* nada */ }
    drawing = true;
    last = pos(e);
    dot(last);
    if (strokes++ === 0) sfx.tap();
  });
  draw.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const pe of (list.length ? list : [e])) {
      const p = pos(pe);
      line(last, p);
      last = p;
    }
  });
  const end = () => {
    if (!drawing) return;
    drawing = false;
    evaluate();
  };
  draw.addEventListener('pointerup', end);
  draw.addEventListener('pointercancel', end);

  const stop = onResize(box, (w, hh) => setup(w, hh));

  return {
    destroy: stop,
    hint(level) {
      box.classList.remove('hint-1', 'hint-2');
      void box.offsetWidth;
      box.classList.add(level >= 2 ? 'hint-2' : 'hint-1');
      if (level >= 2) ctx.speak?.('Pasa el dedo por encima de la letra, despacito');
    },
  };
}
