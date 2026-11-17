// Añade los minijuegos de build/minijuegos/*.js (menos kit.js) al curso de los libros ya generado.
// Cada archivo exporta { 'libros-a-03': [actividades...], ... }. Se ejecuta solo al final de importar-libros.js,
// o a mano:  node build/agregar-minijuegos.js
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'minijuegos');
const FILE = path.join(__dirname, '..', 'src', 'assets', 'libros', 'curso.json');

function validate(a) {
  const labelOk = (c) => c && (c.emoji || c.text);
  const n = (arr) => (arr || []).filter(labelOk).length;
  const longest = (c) => (c?.text || '').length;
  const tooLong = (cards) => cards.some((c) => longest(c) > 34);
  if (!a.prompt?.say) return 'sin pregunta';
  if (a.prompt.say.length > 160) return 'pregunta demasiado larga';
  switch (a.type) {
    case 'choose': {
      if (n(a.options) < 2) return 'menos de 2 opciones';
      if (!(a.correct || []).length || a.correct.some((i) => i >= a.options.length)) return 'correcta inválida';
      if (a.options.length > 4) return 'más de 4 opciones';
      const keys = a.options.map((c) => `${c.emoji}|${c.text}`.toLowerCase());
      if (new Set(keys).size !== keys.length) return 'opciones repetidas';
      if (tooLong(a.options)) return 'opción demasiado larga (máx. 34 letras)';
      return null;
    }
    case 'listen': {
      if (n(a.options) < 2) return 'menos de 2 opciones';
      if (a.correct >= a.options.length) return 'correcta inválida';
      return tooLong(a.options) ? 'opción demasiado larga' : null;
    }
    case 'match': {
      const p = (a.pairs || []).filter((x) => labelOk(x.a) && labelOk(x.b));
      if (p.length < 2 || p.length > 5) return 'parejas: entre 2 y 5';
      const ka = p.map((x) => `${x.a.emoji}|${x.a.text}`), kb = p.map((x) => `${x.b.emoji}|${x.b.text}`);
      if (new Set(ka).size !== ka.length || new Set(kb).size !== kb.length) return 'parejas repetidas';
      return tooLong(p.flatMap((x) => [x.a, x.b])) ? 'ficha demasiado larga' : null;
    }
    case 'order': {
      const it = a.items || [];
      if (it.length < 3 || it.length > 5) return 'ordena: entre 3 y 5 tarjetas';
      const keys = it.map((c) => `${c.emoji}|${c.text}`.toLowerCase());
      if (new Set(keys).size !== keys.length) return 'tarjetas repetidas';
      return tooLong(it) ? 'tarjeta demasiado larga' : null;
    }
    case 'sort': {
      const g = a.groups || [];
      if (g.length < 2 || g.length > 3) return 'clasifica: 2 o 3 cestas';
      if (g.some((x) => !labelOk(x.label) || x.items.length < 2 || x.items.length > 4)) return 'cada cesta: 2 a 4 cosas';
      const all = g.flatMap((x) => x.items.map((c) => `${c.emoji}|${c.text}`.toLowerCase()));
      if (new Set(all).size !== all.length) return 'cosas repetidas';
      return tooLong(g.flatMap((x) => [x.label, ...x.items])) ? 'ficha demasiado larga' : null;
    }
    case 'memory': {
      const p = a.pairs || [];
      if (p.length < 2 || p.length > 6) return 'memoria: entre 2 y 6';
      const keys = p.map((x) => `${x.a.emoji}|${x.a.text}`.toLowerCase());
      return new Set(keys).size !== keys.length ? 'cartas repetidas' : null;
    }
    default: return `tipo desconocido ${a.type}`;
  }
}

function run() {
  const course = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const sessions = new Map(course.units.flatMap((u) => u.sessions).map((s) => [s.id, s]));
  const data = {};
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.js') && x !== 'kit.js').sort()) {
    Object.assign(data, require(path.join(DIR, f)));
  }
  let added = 0, errors = 0;
  const perType = {};
  for (const [sid, acts] of Object.entries(data)) {
    const s = sessions.get(sid);
    if (!s) { console.error(`ERROR: no existe la sesión ${sid}`); errors++; continue; }
    s.activities = s.activities.filter((a) => !/-mj-\d+$/.test(a.id)); // idempotente
    acts.forEach((a, i) => {
      const err = validate(a);
      if (err) { console.error(`ERROR ${sid} #${i + 1} (${a.type}): ${err} — «${a.prompt?.say}»`); errors++; return; }
      s.activities.push({ id: `${sid}-mj-${i + 1}`, ...a });
      perType[a.type] = (perType[a.type] || 0) + 1;
      added++;
    });
  }
  if (errors) { console.error(`${errors} errores: curso.json NO se modificó.`); process.exit(1); }
  fs.writeFileSync(FILE, JSON.stringify(course));
  const withGames = [...sessions.values()].filter((s) => s.activities.some((a) => /-mj-/.test(a.id))).length;
  console.log(`Minijuegos añadidos: ${added} en ${Object.keys(data).length} sesiones (con minijuegos: ${withGames}/${sessions.size}).`, perType);
}
module.exports = { run };
if (require.main === module) run();
