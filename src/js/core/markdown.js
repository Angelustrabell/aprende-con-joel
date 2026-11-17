// Markdown mínimo y seguro para las lecturas: títulos, párrafos, negrita/cursiva, listas,
// tablas (| y <table>), imágenes y saltos de página. No ejecuta nada del texto: todo se escapa.
import { escapeHtml } from './util.js';

const BREAK_RE = /^\s*(-{3,}|\*{3,})\s*$/;
const IMG_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/;
const LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

// "imagenes/x.png" (las del libro) y "media/x.webp" (las que sube papá) -> ruta relativa de la app.
export function resolveImage(src) {
  if (/^imagenes\//.test(src)) return `assets/libros/${src}`;
  if (/^media\//.test(src)) return src;
  return '';
}

// ---------- Inline ----------
export function inlineHtml(text) {
  let s = escapeHtml(text);
  s = s.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
  s = s.replace(/&lt;(b|u|i|strong|em)&gt;([\s\S]*?)&lt;\/\1&gt;/gi, (_m, t, inner) => `<${t.toLowerCase()}>${inner}</${t.toLowerCase()}>`);
  s = s.replace(/\*\*([^*]+?)\*\*/g, '<b>$1</b>');
  s = s.replace(/__([^_]+?)__/g, '<b>$1</b>');
  s = s.replace(/(^|[\s(¿¡"“])_([^_\n]+?)_(?=$|[\s).,;:!?"”])/g, '$1<i>$2</i>');
  s = s.replace(/(^|[\s(¿¡"“])\*([^*\n]+?)\*(?=$|[\s).,;:!?"”])/g, '$1<i>$2</i>');
  return s;
}

// ---------- Tabla HTML (la única que trae el libro): solo etiquetas permitidas ----------
const ALLOWED = new Set(['TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'BR', 'B', 'U', 'I', 'STRONG', 'EM', 'P']);
function cleanNode(node, doc) {
  if (node.nodeType === 3) return doc.createTextNode(node.textContent);
  if (node.nodeType !== 1) return null;
  if (!ALLOWED.has(node.tagName)) {
    const frag = doc.createDocumentFragment();
    for (const c of node.childNodes) { const k = cleanNode(c, doc); if (k) frag.append(k); }
    return frag;
  }
  const el = doc.createElement(node.tagName.toLowerCase());
  if (node.tagName === 'TD' || node.tagName === 'TH') {
    for (const a of ['rowspan', 'colspan']) {
      const v = parseInt(node.getAttribute(a), 10);
      if (v > 1 && v < 20) el.setAttribute(a, String(v));
    }
  }
  for (const c of node.childNodes) { const k = cleanNode(c, doc); if (k) el.append(k); }
  return el;
}
function safeTable(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const t = doc.body.querySelector('table');
  if (!t) return null;
  return cleanNode(t, document);
}

// ---------- Bloques ----------
// Devuelve [{ kind, raw, weight, ... }]. kind: break | heading | para | list | table | html | image | quote
export function parseBlocks(md) {
  const lines = String(md || '').replace(/\r\n/g, '\n').split('\n');
  // posición (offset de carácter) de cada línea, para que el editor siga el cursor
  const starts = [];
  let off = 0;
  for (const l of lines) { starts.push(off); off += l.length + 1; }
  const blocks = [];
  let i = 0;
  const para = [];
  let paraStart = 0;
  const flushPara = () => {
    if (!para.length) return;
    const raw = para.join('\n');
    blocks.push({ kind: 'para', raw, weight: raw.length + 20, pos: starts[paraStart] });
    para.length = 0;
  };
  const push = (b, at) => blocks.push({ ...b, pos: starts[at] });
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { flushPara(); i++; continue; }
    if (BREAK_RE.test(line)) { flushPara(); push({ kind: 'break', raw: line, weight: 0 }, i); i++; continue; }
    let m = /^(#{1,4})\s+(.*)$/.exec(line);
    if (m) { flushPara(); push({ kind: 'heading', level: m[1].length, raw: line, text: m[2], weight: 120 }, i); i++; continue; }
    m = IMG_RE.exec(line.trim());
    if (m) { flushPara(); push({ kind: 'image', alt: m[1], src: m[2], raw: line, weight: 650 }, i); i++; continue; }
    if (/^\s*<table/i.test(line)) {
      flushPara();
      const at = i;
      const buf = [];
      while (i < lines.length) { buf.push(lines[i]); if (/<\/table>/i.test(lines[i])) { i++; break; } i++; }
      const raw = buf.join('\n');
      push({ kind: 'html', raw, weight: 200 + (raw.match(/<tr/gi) || []).length * 70 }, at);
      continue;
    }
    if (/^\s*\|/.test(line)) {
      flushPara();
      const at = i;
      const buf = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { buf.push(lines[i]); i++; }
      push({ kind: 'table', raw: buf.join('\n'), weight: 150 + buf.length * 70 }, at);
      continue;
    }
    if (LIST_RE.test(line)) {
      flushPara();
      const at = i;
      const buf = [];
      while (i < lines.length) {
        const l = lines[i];
        if (LIST_RE.test(l)) { buf.push(l); i++; continue; }
        // continuación indentada de un ítem
        if (l.trim() && /^\s{2,}\S/.test(l) && buf.length) { buf.push(l); i++; continue; }
        // línea en blanco entre ítems de la misma lista
        if (!l.trim() && i + 1 < lines.length && LIST_RE.test(lines[i + 1]) && buf.length) { i++; continue; }
        break;
      }
      const raw = buf.join('\n');
      push({ kind: 'list', raw, weight: raw.length + buf.length * 25 }, at);
      continue;
    }
    if (/^>\s?/.test(line)) {
      flushPara();
      const at = i;
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      const raw = buf.join('\n');
      push({ kind: 'quote', raw, weight: raw.length + 30 }, at);
      continue;
    }
    if (!para.length) paraStart = i;
    para.push(line);
    i++;
  }
  flushPara();
  return blocks;
}

// ---------- Páginas ----------
export const PAGE_BUDGET = { normal: 560, grande: 380, enorme: 240 };

// Reparte los bloques en páginas: "---" fuerza una página nueva; si no, por tamaño.
// Con manual = true las páginas son exactamente las que separa "---" (no se reparte nada solo):
// así una página solo cambia cuando papá la cambia, y sus grabaciones de voz siguen valiendo.
export function paginate(md, size = 'normal', manual = false) {
  const budget = manual ? Infinity : (PAGE_BUDGET[size] || PAGE_BUDGET.normal);
  const blocks = parseBlocks(md);
  const pages = [];
  let cur = [];
  let w = 0;
  const flush = () => { if (cur.length) pages.push(cur); cur = []; w = 0; };
  for (let k = 0; k < blocks.length; k++) {
    const b = blocks[k];
    if (b.kind === 'break') { flush(); continue; }
    const next = blocks[k + 1];
    // un título siempre va junto a lo que le sigue
    const need = b.weight + (b.kind === 'heading' && next && next.kind !== 'break' ? Math.min(next.weight, budget / 2) : 0);
    if (cur.length && w + need > budget) flush();
    cur.push(b);
    w += b.weight;
  }
  flush();
  return pages.length ? pages : [[]];
}

function cellRows(raw) {
  const rows = raw.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
  const sep = rows.length > 1 && rows[1].every((c) => /^:?-{2,}:?$/.test(c));
  return { head: sep ? rows[0] : null, body: rows.filter((r, idx) => !(sep && idx < 2)).filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c))) };
}

function listEl(raw) {
  const items = raw.split('\n');
  const root = document.createElement('div');
  const stack = []; // { indent, el }
  let lastLi = null;
  for (const line of items) {
    const m = LIST_RE.exec(line);
    if (!m) { if (lastLi) { lastLi.append(document.createElement('br')); lastLi.insertAdjacentHTML('beforeend', inlineHtml(line.trim())); } continue; }
    const indent = m[1].replace(/\t/g, '    ').length;
    const ordered = /\d/.test(m[2]);
    while (stack.length && stack[stack.length - 1].indent > indent) stack.pop();
    let top = stack[stack.length - 1];
    if (!top || top.indent < indent) {
      const el = document.createElement(ordered ? 'ol' : 'ul');
      if (ordered) el.start = parseInt(m[2], 10) || 1;
      (top && lastLi ? lastLi : root).append(el);
      top = { indent, el };
      stack.push(top);
    }
    const li = document.createElement('li');
    li.innerHTML = inlineHtml(m[3]);
    top.el.append(li);
    lastLi = li;
  }
  return root.firstElementChild || root;
}

export function renderBlock(b) {
  switch (b.kind) {
    case 'heading': {
      const el = document.createElement(`h${Math.min(4, b.level + 1)}`);
      el.className = `rd-h rd-h${b.level}`;
      el.innerHTML = inlineHtml(b.text);
      return el;
    }
    case 'image': {
      const url = resolveImage(b.src);
      const fig = document.createElement('figure');
      fig.className = 'rd-fig';
      if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = b.alt || '';
        img.draggable = false;
        fig.append(img);
      } else {
        fig.textContent = '🖼️ (imagen no encontrada)';
      }
      return fig;
    }
    case 'html': {
      const t = safeTable(b.raw);
      const wrap = document.createElement('div');
      wrap.className = 'rd-table';
      if (t) wrap.append(t);
      return wrap;
    }
    case 'table': {
      const { head, body } = cellRows(b.raw);
      const t = document.createElement('table');
      if (head) {
        const tr = document.createElement('tr');
        for (const c of head) { const th = document.createElement('th'); th.innerHTML = inlineHtml(c); tr.append(th); }
        const thead = document.createElement('thead');
        thead.append(tr);
        t.append(thead);
      }
      const tb = document.createElement('tbody');
      for (const r of body) {
        const tr = document.createElement('tr');
        for (const c of r) { const td = document.createElement('td'); td.innerHTML = inlineHtml(c); tr.append(td); }
        tb.append(tr);
      }
      t.append(tb);
      const wrap = document.createElement('div');
      wrap.className = 'rd-table';
      wrap.append(t);
      return wrap;
    }
    case 'list': {
      const el = listEl(b.raw);
      el.classList.add('rd-list');
      return el;
    }
    case 'quote': {
      const el = document.createElement('blockquote');
      el.innerHTML = inlineHtml(b.raw).replace(/\n/g, '<br>');
      return el;
    }
    default: {
      const p = document.createElement('p');
      p.innerHTML = inlineHtml(b.raw).replace(/\n/g, '<br>');
      return p;
    }
  }
}

export function renderPage(blocks) {
  const box = document.createElement('div');
  box.className = 'rd-page';
  if (!blocks.length) {
    const p = document.createElement('p');
    p.className = 'rd-empty';
    p.textContent = 'Esta lectura todavía no tiene texto.';
    box.append(p);
    return box;
  }
  for (const b of blocks) box.append(renderBlock(b));
  return box;
}

// Identidad de una página = su texto. Sirve para saber si una grabación de voz sigue valiendo.
export function pageKey(blocks) {
  const t = blocks.map((b) => b.raw).join(' ').replace(/\s+/g, ' ').trim();
  let hsh = 0x811c9dc5;
  for (let i = 0; i < t.length; i++) { hsh ^= t.charCodeAt(i); hsh = Math.imul(hsh, 0x01000193); }
  return `${(hsh >>> 0).toString(36)}-${t.length.toString(36)}`;
}

// Resumen corto del texto de una página (para reconocer una grabación).
export function pageSnippet(blocks, n = 70) {
  const t = blocks.map((b) => b.raw).join(' ').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/[#*_|>`-]/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

// ---------- Texto para la voz ----------
function stripInline(s) {
  return String(s)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/\*\*|__/g, '')
    .replace(/(^|\s)[_*]([^_*\n]+)[_*](?=$|[\s.,;:!?)])/g, '$1$2');
}

// Frases que la voz leerá en una página (las imágenes y las tablas no se leen salvo su texto).
export function pageSentences(blocks) {
  const parts = [];
  for (const b of blocks) {
    if (b.kind === 'heading') parts.push(`${stripInline(b.text)}.`);
    else if (b.kind === 'para' || b.kind === 'quote') parts.push(stripInline(b.raw));
    else if (b.kind === 'list') parts.push(...b.raw.split('\n').map((l) => stripInline(l.replace(LIST_RE, '$3'))));
    else if (b.kind === 'table') {
      const { head, body } = cellRows(b.raw);
      for (const r of [head, ...body].filter(Boolean)) parts.push(r.map(stripInline).filter(Boolean).join(', '));
    } else if (b.kind === 'html') {
      const d = new DOMParser().parseFromString(b.raw, 'text/html');
      for (const tr of d.querySelectorAll('tr')) parts.push([...tr.children].map((c) => c.textContent.trim()).filter(Boolean).join(', '));
    }
  }
  const out = [];
  for (const p of parts) {
    const t = p.replace(/\s+/g, ' ').trim();
    if (!t) continue;
    // Se parte solo en finales de frase reales (punto, ! o ? seguidos de una nueva frase), no en
    // "etc.," ni en abreviaturas. Las frases muy largas se parten en comas para que la voz no se corte.
    const sentences = t.split(/(?<=[.!?])\s+(?=[¿¡"“A-ZÁÉÍÓÚÑ0-9])/);
    for (const sent of sentences) {
      if (sent.length <= 220) { out.push(sent); continue; }
      let acc = '';
      for (const c of sent.split(/(?<=[,;:])\s+/)) {
        if ((acc + ' ' + c).length > 220 && acc) { out.push(acc.trim()); acc = c; } else acc = acc ? `${acc} ${c}` : c;
      }
      if (acc.trim()) out.push(acc.trim());
    }
  }
  return out;
}

// Rutas de media usadas dentro de un texto (para exportar y limpiar).
export function mediaInText(md) {
  const out = [];
  for (const m of String(md || '').matchAll(/!\[[^\]]*\]\(media\/([\w.-]+)\)/g)) out.push(m[1]);
  return out;
}

// Página que contiene la posición (offset de carácter) del cursor en el texto.
export function pageAtOffset(pages, offset) {
  let found = 0;
  pages.forEach((blocks, i) => { if (blocks.length && blocks[0].pos <= offset) found = i; });
  return found;
}
