// Colorear: dibujo libre o lámina con cubeta de pintura. El dibujo se guarda al terminar.
import { h, onResize } from '../core/dom.js';
import { mediaUrl } from '../core/media.js';
import { coloringUrl } from '../data/activityTypes.js';
import { sfx } from '../core/sfx.js';

const COLORS = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#8bc34a', '#1e88e5', '#4fc3f7', '#8e24aa', '#ec407a', '#795548', '#212121', '#ffffff'];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function mount(root, act, ctx) {
  const src = act.image ? mediaUrl(act.image) : act.builtin ? coloringUrl(act.builtin) : '';
  let tool = src ? 'bucket' : 'brush';
  let color = COLORS[0];
  let finished = false;

  const wrap = h('div', { class: 'act act-paint' });
  const paint = h('canvas', { class: 'paint-layer' });
  const lines = h('canvas', { class: 'lines-layer' });
  const stage = h('div', { class: 'paint-stage' }, paint, lines);

  const colorBtns = COLORS.map((c) => {
    const b = h('button', { class: 'paint-color', type: 'button', style: { '--c': c } });
    b.addEventListener('click', () => {
      color = c;
      colorBtns.forEach((x) => x.classList.toggle('on', x === b));
      if (tool === 'eraser') setTool(src ? 'bucket' : 'brush');
      sfx.tap();
    });
    return b;
  });
  colorBtns[0].classList.add('on');

  const toolBtns = {};
  const mkTool = (id, icon, title) => {
    const b = h('button', { class: 'paint-tool', type: 'button', title }, icon);
    b.addEventListener('click', () => setTool(id));
    toolBtns[id] = b;
    return b;
  };
  const clearBtn = h('button', { class: 'paint-tool', type: 'button', title: 'Borrar todo' }, '🗑️');
  clearBtn.addEventListener('click', () => { whiteFill(); sfx.whoosh(); });
  const doneBtn = h('button', { class: 'paint-done', type: 'button', title: '¡Terminé!' }, '✅');
  doneBtn.addEventListener('click', finish);

  const tools = h('div', { class: 'paint-tools' },
    h('div', { class: 'paint-colors' }, ...colorBtns),
    h('div', { class: 'paint-toolrow' },
      src ? mkTool('bucket', '🪣', 'Rellenar') : null,
      mkTool('brush', '🖌️', 'Pincel'),
      mkTool('eraser', '🧽', 'Borrador'),
      clearBtn,
    ),
    doneBtn,
  );
  wrap.append(stage, tools);
  root.append(wrap);

  function setTool(id) {
    tool = id;
    Object.entries(toolBtns).forEach(([k, b]) => b.classList.toggle('on', k === id));
  }
  setTool(tool);

  const pctx = paint.getContext('2d', { willReadFrequently: true });
  const lctx = lines.getContext('2d', { willReadFrequently: true });
  let W = 0;
  let H = 0;
  let img = null;
  let boundary = null;
  let drawing = false;
  let last = null;

  function whiteFill() {
    pctx.fillStyle = '#ffffff';
    pctx.fillRect(0, 0, W, H);
  }

  function drawLines() {
    lctx.clearRect(0, 0, W, H);
    boundary = new Uint8Array(W * H);
    if (!img) return;
    const iw = img.naturalWidth || 800;
    const ih = img.naturalHeight || 600;
    const s = Math.min(W / iw, H / ih) * 0.96;
    const dw = iw * s;
    const dh = ih * s;
    lctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    const d = lctx.getImageData(0, 0, W, H).data;
    for (let i = 0, p = 0; p < W * H; p++, i += 4) {
      if (d[i + 3] > 100 && (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) < 160) boundary[p] = 1;
    }
  }

  function setup(w, hh) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const nw = Math.max(50, Math.round(w * dpr));
    const nh = Math.max(50, Math.round(hh * dpr));
    let old = null;
    if (W && H) {
      old = document.createElement('canvas');
      old.width = W; old.height = H;
      old.getContext('2d').drawImage(paint, 0, 0);
    }
    W = nw; H = nh;
    paint.width = W; paint.height = H;
    lines.width = W; lines.height = H;
    whiteFill();
    if (old) pctx.drawImage(old, 0, 0, W, H);
    drawLines();
  }

  function pos(e) {
    const r = paint.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  }

  function stroke(a, b) {
    pctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    pctx.lineWidth = Math.min(W, H) * (tool === 'eraser' ? 0.06 : 0.028);
    pctx.lineCap = 'round';
    pctx.lineJoin = 'round';
    pctx.beginPath();
    pctx.moveTo(a.x, a.y);
    pctx.lineTo(b.x, b.y);
    pctx.stroke();
  }

  function fill(x0, y0) {
    x0 = Math.floor(x0);
    y0 = Math.floor(y0);
    if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= H || boundary[y0 * W + x0]) return;
    const imgData = pctx.getImageData(0, 0, W, H);
    const d = imgData.data;
    const [r, g, b] = hexToRgb(color);
    const seen = new Uint8Array(W * H);
    const stack = [x0, y0];
    while (stack.length) {
      const y = stack.pop();
      const x = stack.pop();
      if (seen[y * W + x]) continue;
      let xl = x;
      while (xl > 0 && !boundary[y * W + xl - 1] && !seen[y * W + xl - 1]) xl--;
      let xr = x;
      while (xr < W - 1 && !boundary[y * W + xr + 1] && !seen[y * W + xr + 1]) xr++;
      let upOpen = false;
      let downOpen = false;
      for (let i = xl; i <= xr; i++) {
        const p = y * W + i;
        seen[p] = 1;
        const o = p * 4;
        d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
        if (y > 0) {
          const q = p - W;
          const ok = !boundary[q] && !seen[q];
          if (ok && !upOpen) { stack.push(i, y - 1); upOpen = true; } else if (!ok) upOpen = false;
        }
        if (y < H - 1) {
          const q = p + W;
          const ok = !boundary[q] && !seen[q];
          if (ok && !downOpen) { stack.push(i, y + 1); downOpen = true; } else if (!ok) downOpen = false;
        }
      }
    }
    pctx.putImageData(imgData, 0, 0);
    sfx.pop(3);
  }

  paint.addEventListener('pointerdown', (e) => {
    if (finished) return;
    e.preventDefault();
    const p = pos(e);
    if (tool === 'bucket') { fill(p.x, p.y); return; }
    try { paint.setPointerCapture(e.pointerId); } catch { /* nada */ }
    drawing = true;
    last = p;
    stroke(p, { x: p.x + 0.1, y: p.y + 0.1 });
  });
  paint.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const pe of (list.length ? list : [e])) {
      const p = pos(pe);
      stroke(last, p);
      last = p;
    }
  });
  const end = () => { drawing = false; };
  paint.addEventListener('pointerup', end);
  paint.addEventListener('pointercancel', end);

  async function finish() {
    if (finished) return;
    finished = true;
    doneBtn.classList.add('done');
    try {
      const scale = Math.min(1, 1000 / Math.max(W, H));
      const out = document.createElement('canvas');
      out.width = Math.round(W * scale);
      out.height = Math.round(H * scale);
      const o = out.getContext('2d');
      o.drawImage(paint, 0, 0, out.width, out.height);
      o.globalCompositeOperation = 'multiply';
      o.drawImage(lines, 0, 0, out.width, out.height);
      const blob = await new Promise((r) => out.toBlob(r, 'image/png'));
      if (blob) await ctx.saveDrawing?.(blob);
    } catch (e) { console.error(e); }
    ctx.correct(stage);
    ctx.done({ text: '¡Qué bonito te quedó!' });
  }

  let stop = () => {};
  const start = () => { stop = onResize(stage, (w, hh) => setup(w, hh)); };
  if (src) {
    img = new Image();
    img.onload = () => { start(); };
    img.onerror = () => { img = null; start(); };
    img.src = src;
  } else {
    start();
  }

  return { destroy: () => stop() };
}
