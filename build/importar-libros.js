// Convierte los dos libros (Markdown) en el curso "Conocimiento de Sí Mismo".
// Uso:  node build/importar-libros.js
// Genera:  src/assets/libros/curso.json  y copia las imágenes a src/assets/libros/imagenes/
// El texto de cada conferencia se guarda tal cual (sin adaptar): papá lo reescribe luego desde la app.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'assets', 'libros');
const OUT_IMG = path.join(OUT, 'imagenes');

const COURSE_ID = 'curso-conocimiento-si-mismo';
const SMALL = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u', 'en', 'a', 'al', 'que', 'un', 'una', 'por', 'para', 'con', 'sin', 'lo', 'su', 'sus']);

// "EL CONOCIMIENTO DE SI MISMO" -> "El conocimiento de si mismo"
function sentenceCase(s) {
  const t = s.toLowerCase().replace(/\s+/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}
const pad = (n) => String(n).padStart(2, '0');

function readBook(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');
}

// Separa el libro en secciones "## ..." (la parte anterior al primer "##" es la portada).
function sections(md) {
  const lines = md.split('\n');
  const out = [];
  let cur = { heading: null, lines: [] };
  for (const line of lines) {
    if (/^## /.test(line)) {
      out.push(cur);
      cur = { heading: line.replace(/^## /, '').trim(), lines: [] };
    } else cur.lines.push(line);
  }
  out.push(cur);
  return out.map((s) => ({ heading: s.heading, body: s.lines.join('\n').trim() }));
}

function makeSession(id, title, body, extra = {}) {
  return {
    id,
    title,
    icon: '📖',
    locked: false,
    source: body, // texto original: sirve de referencia al reescribir
    activities: [{
      id: `${id}-lectura`,
      type: 'reading',
      prompt: { say: '', audio: '' },
      md: body,
      narrate: true,
      size: 'normal',
    }],
    ...extra,
  };
}

function buildPhaseA() {
  const secs = sections(readBook('Conocimiento_de_Si_Mismo_Fase_A.md'));
  const cover = secs[0].body.split('\n').filter((l) => /^!\[/.test(l)).join('\n\n');
  const sessions = [];
  for (const s of secs.slice(1)) {
    if (/^contenido$/i.test(s.heading)) continue;
    const m = /^Conf\.\s*(\d+)(?:\s*y\s*(\d+))?\s+(.*)$/i.exec(s.heading);
    if (m) {
      const n = pad(Number(m[1]));
      const label = m[2] ? `${n} y ${pad(Number(m[2]))}` : n;
      const title = `${label}. ${sentenceCase(m[3])}`;
      sessions.push(makeSession(`libros-a-${n}`, title, s.body, { confTitle: m[3].trim() }));
    } else {
      // "Estimado Lector": presentación del libro, con la portada arriba.
      const body = `${cover}\n\n_${secs[0].body.split('\n').find((l) => /^_/.test(l))?.replace(/^_|_$/g, '') || 'Cincuenta Lecciones Prácticas'}_\n\n${s.body}`.trim();
      sessions.push(makeSession('libros-a-00', sentenceCase(s.heading.replace(/:$/, '')), body));
    }
  }
  return sessions;
}

function buildPhaseB() {
  const secs = sections(readBook('Conocimiento_de_Si_Mismo_Fase_B.md'));
  const sessions = [];
  let n = 0;
  for (const s of secs.slice(1)) {
    if (/^LISTADO DE CONFERENCIAS/i.test(s.heading)) continue;
    n++;
    sessions.push(makeSession(`libros-b-${pad(n)}`, `${pad(n)}. ${sentenceCase(s.heading)}`, s.body, { confTitle: s.heading }));
  }
  return sessions;
}

function copyImages() {
  fs.mkdirSync(OUT_IMG, { recursive: true });
  const src = path.join(ROOT, 'imagenes');
  let n = 0;
  for (const f of fs.readdirSync(src)) {
    fs.copyFileSync(path.join(src, f), path.join(OUT_IMG, f));
    n++;
  }
  return n;
}

function checkImages(course) {
  const missing = [];
  for (const u of course.units) {
    for (const s of u.sessions) {
      for (const m of s.activities[0].md.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
        if (!fs.existsSync(path.join(OUT, m[1]))) missing.push(`${s.id}: ${m[1]}`);
      }
    }
  }
  return missing;
}

const a = buildPhaseA();
const b = buildPhaseB();
const course = {
  id: COURSE_ID,
  title: 'Conocimiento de Sí Mismo',
  icon: '📖',
  color: '#6c4cf5',
  visible: false, // oculto para Joel hasta que papá termine de revisarlo
  freeOrder: true, // las conferencias se pueden abrir en cualquier orden (papá bloquea las que quiera)
  units: [
    { id: 'libros-unidad-a', title: 'Fase A', icon: '📘', sessions: a },
    { id: 'libros-unidad-b', title: 'Fase B', icon: '📗', sessions: b },
  ],
};

fs.mkdirSync(OUT, { recursive: true });
const imgs = copyImages();
fs.writeFileSync(path.join(OUT, 'curso.json'), JSON.stringify(course));
const missing = checkImages(course);
console.log(`Fase A: ${a.length} sesiones · Fase B: ${b.length} sesiones · imágenes copiadas: ${imgs}`);
console.log(`curso.json: ${(fs.statSync(path.join(OUT, 'curso.json')).size / 1024).toFixed(0)} KB`);
if (missing.length) { console.error('IMÁGENES FALTANTES:', missing); process.exit(1); }
console.log('OK: todas las imágenes referenciadas existen.');
// Minijuegos de cada conferencia (build/minijuegos/*.js): se añaden al curso recién generado.
require('./agregar-minijuegos').run();
