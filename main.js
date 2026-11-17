// Proceso principal de "Aprende con Joel".
// Sirve la interfaz por el protocolo app://, guarda los datos en la carpeta del usuario,
// controla el modo kiosco (modo Joel) y hace las llamadas a la IA (opcional).
const {
  app, BrowserWindow, ipcMain, protocol, dialog, shell, safeStorage, Menu, session,
} = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const crypto = require('crypto');
const { Readable } = require('stream');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
]);

const SRC = path.join(__dirname, 'src');

// Solo para pruebas: carpeta de datos aparte, sin kiosco y ventana que no roba el foco.
if (process.env.EDUJOEL_USERDATA) app.setPath('userData', process.env.EDUJOEL_USERDATA);
const NO_KIOSK = !!process.env.EDUJOEL_NOKIOSK;
const HIDDEN = !!process.env.EDUJOEL_HIDDEN;
if (HIDDEN) {
  app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
  app.commandLine.appendSwitch('disable-renderer-backgrounding');
  app.commandLine.appendSwitch('disable-background-timer-throttling');
}
let USER_DIR, MEDIA_DIR, DATA_FILE, BACKUP_DIR, KEY_FILE;
let win = null;
let locked = false;      // modo Joel con kiosco: no se puede cerrar la ventana
let flushed = false;     // el renderer ya guardó antes de cerrar

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.bmp': 'image/bmp', '.ico': 'image/x-icon', '.webm': 'video/webm', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.ttf': 'font/ttf',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
};
const MEDIA_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'webm', 'ogg', 'mp3', 'wav', 'm4a', 'mp4', 'mov']);

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
}

// ---------- Servir archivos (con soporte de rangos para audio/video) ----------
async function serveFile(file, request) {
  let stat;
  try { stat = await fsp.stat(file); } catch { return new Response('No encontrado', { status: 404 }); }
  if (!stat.isFile()) return new Response('No encontrado', { status: 404 });
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const range = request.headers.get('range');
  const headers = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = m && m[1] ? parseInt(m[1], 10) : 0;
    let end = m && m[2] ? parseInt(m[2], 10) : stat.size - 1;
    if (m && !m[1] && m[2]) { start = Math.max(0, stat.size - parseInt(m[2], 10)); end = stat.size - 1; }
    end = Math.min(end, stat.size - 1);
    if (start > end || start >= stat.size) {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${stat.size}` } });
    }
    const stream = Readable.toWeb(fs.createReadStream(file, { start, end }));
    return new Response(stream, {
      status: 206,
      headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': String(end - start + 1) },
    });
  }
  const stream = Readable.toWeb(fs.createReadStream(file));
  return new Response(stream, { status: 200, headers: { ...headers, 'Content-Length': String(stat.size) } });
}

function insideDir(base, file) {
  const rel = path.relative(base, file);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function safeMediaName(name) {
  return typeof name === 'string' && name.length < 200 && path.basename(name) === name && /^[\w.-]+$/.test(name);
}

// ---------- Ventana ----------
function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    backgroundColor: '#8fd3ff',
    title: 'Aprende con Joel',
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true,
    paintWhenInitiallyHidden: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      autoplayPolicy: 'no-user-gesture-required',
      backgroundThrottling: !HIDDEN,
    },
  });

  win.once('ready-to-show', () => {
    if (HIDDEN) {
      // Modo prueba: fuera de la pantalla para que nadie la toque por accidente.
      win.setBounds({ x: -4000, y: 0, width: 1280, height: 800 });
      win.showInactive();
    } else { win.maximize(); win.show(); }
  });
  win.loadURL('app://edu/index.html');

  // Sin pellizcar para hacer zoom (pantalla táctil) y sin navegar fuera de la app.
  win.webContents.on('did-finish-load', () => { win.webContents.setVisualZoomLevelLimits(1, 1); });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://')) e.preventDefault(); });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // Atajos: F12 abre herramientas de desarrollo solo fuera del instalador.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (!app.isPackaged && input.key === 'F12') { win.webContents.toggleDevTools(); event.preventDefault(); }
    if (locked && (input.key === 'F11' || (input.alt && input.key === 'F4') || (input.control && ['w', 'q', 'r'].includes(input.key.toLowerCase())))) {
      event.preventDefault();
    }
  });

  win.on('close', (e) => {
    if (locked) {
      e.preventDefault();
      win.webContents.send('close-blocked');
      return;
    }
    if (!flushed) {
      // Pedimos al renderer que guarde antes de cerrar.
      e.preventDefault();
      const done = () => { flushed = true; if (win && !win.isDestroyed()) win.close(); };
      ipcMain.once('flushed', done);
      setTimeout(done, 1500);
      win.webContents.send('flush');
    }
  });
  win.on('closed', () => { win = null; });

  // Si Windows se apaga o cierra sesión, nunca bloquear el cierre.
  const allowSystemClose = () => { locked = false; flushed = true; };
  win.on('query-session-end', allowSystemClose);
  win.on('session-end', allowSystemClose);
}

app.whenReady().then(async () => {
  app.setAppUserModelId('com.familia.edujoel');
  Menu.setApplicationMenu(null);

  USER_DIR = app.getPath('userData');
  MEDIA_DIR = path.join(USER_DIR, 'media');
  BACKUP_DIR = path.join(USER_DIR, 'copias');
  DATA_FILE = path.join(USER_DIR, 'data.json');
  KEY_FILE = path.join(USER_DIR, 'clave-ia.bin');
  await fsp.mkdir(MEDIA_DIR, { recursive: true });
  await fsp.mkdir(BACKUP_DIR, { recursive: true });

  protocol.handle('app', (request) => {
    const url = new URL(request.url);
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/' || rel === '') rel = '/index.html';
    let base = SRC;
    if (rel.startsWith('/media/')) { base = MEDIA_DIR; rel = rel.slice('/media/'.length); }
    const file = path.normalize(path.join(base, rel));
    if (!insideDir(base, file)) return new Response('Prohibido', { status: 403 });
    return serveFile(file, request);
  });

  // Micrófono permitido (para grabar la voz de papá). Nada más.
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
    callback(permission === 'media' || permission === 'speaker-selection' || permission === 'clipboard-sanitized-write');
  });
  session.defaultSession.setPermissionCheckHandler((wc, permission) => (
    permission === 'media' || permission === 'speaker-selection' || permission === 'clipboard-sanitized-write'
  ));

  registerIpc();
  createWindow();
});

app.on('window-all-closed', () => app.quit());

// ---------- Datos ----------
async function writeAtomic(file, content) {
  const tmp = `${file}.${process.pid}.tmp`;
  await fsp.writeFile(tmp, content, 'utf8');
  await fsp.rename(tmp, file);
}

async function dailyBackup(content) {
  const d = new Date();
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const file = path.join(BACKUP_DIR, `datos-${key}.json`);
  try { await fsp.access(file); return; } catch { /* no existe: la creamos */ }
  await fsp.writeFile(file, content, 'utf8');
  const all = (await fsp.readdir(BACKUP_DIR)).filter((f) => f.startsWith('datos-')).sort();
  for (const old of all.slice(0, Math.max(0, all.length - 14))) {
    await fsp.unlink(path.join(BACKUP_DIR, old)).catch(() => {});
  }
}

let saveChain = Promise.resolve();

function registerIpc() {
  ipcMain.handle('data:load', async () => {
    try {
      return JSON.parse(await fsp.readFile(DATA_FILE, 'utf8'));
    } catch (e) {
      if (e.code === 'ENOENT') return null;
      // Archivo dañado: probamos con la copia más reciente.
      const all = (await fsp.readdir(BACKUP_DIR).catch(() => [])).filter((f) => f.startsWith('datos-')).sort().reverse();
      for (const f of all) {
        try { return JSON.parse(await fsp.readFile(path.join(BACKUP_DIR, f), 'utf8')); } catch { /* siguiente */ }
      }
      return null;
    }
  });

  ipcMain.handle('data:save', (_e, json) => {
    if (typeof json !== 'string' || json.length < 2) return false;
    saveChain = saveChain.then(async () => {
      await writeAtomic(DATA_FILE, json);
      await dailyBackup(json).catch(() => {});
    }).catch((err) => console.error('Error guardando', err));
    return saveChain.then(() => true);
  });

  ipcMain.on('flushed', () => {});

  ipcMain.handle('media:save', async (_e, { ext, buffer }) => {
    const clean = String(ext || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!MEDIA_EXT.has(clean)) throw new Error('Tipo de archivo no permitido');
    const name = `${crypto.randomUUID()}.${clean}`;
    await fsp.writeFile(path.join(MEDIA_DIR, name), Buffer.from(buffer));
    return name;
  });

  ipcMain.handle('media:read64', async (_e, name) => {
    if (!safeMediaName(name)) return null;
    try { return (await fsp.readFile(path.join(MEDIA_DIR, name))).toString('base64'); } catch { return null; }
  });

  ipcMain.handle('media:write64', async (_e, { name, b64 }) => {
    if (!safeMediaName(name)) return false;
    const ext = path.extname(name).slice(1).toLowerCase();
    if (!MEDIA_EXT.has(ext)) return false;
    const file = path.join(MEDIA_DIR, name);
    try { await fsp.access(file); return true; } catch { /* no existe */ }
    await fsp.writeFile(file, Buffer.from(b64, 'base64'));
    return true;
  });

  ipcMain.handle('media:list', async () => (await fsp.readdir(MEDIA_DIR)).filter(safeMediaName));

  ipcMain.handle('media:delete', async (_e, names) => {
    let n = 0;
    for (const name of names || []) {
      if (!safeMediaName(name)) continue;
      try { await fsp.unlink(path.join(MEDIA_DIR, name)); n++; } catch { /* ya no existe */ }
    }
    return n;
  });

  ipcMain.handle('file:export', async (_e, { defaultName, content, filters }) => {
    const r = await dialog.showSaveDialog(win, {
      title: 'Guardar archivo',
      defaultPath: path.join(app.getPath('documents'), defaultName),
      filters: filters || [{ name: 'Archivo', extensions: ['json'] }],
    });
    if (r.canceled || !r.filePath) return false;
    await fsp.writeFile(r.filePath, content, 'utf8');
    return true;
  });

  ipcMain.handle('file:import', async (_e, { filters }) => {
    const r = await dialog.showOpenDialog(win, {
      title: 'Abrir archivo',
      properties: ['openFile'],
      filters: filters || [{ name: 'Archivo', extensions: ['json'] }],
    });
    if (r.canceled || !r.filePaths.length) return null;
    return fsp.readFile(r.filePaths[0], 'utf8');
  });

  ipcMain.handle('win:mode', (_e, { kiosk, fullscreen, lock }) => {
    if (!win || NO_KIOSK) return;
    locked = !!lock;
    if (kiosk) {
      win.setKiosk(true);
    } else {
      if (win.isKiosk()) win.setKiosk(false);
      win.setFullScreen(!!fullscreen);
    }
  });

  ipcMain.handle('app:quit', () => { locked = false; if (win) win.close(); });

  ipcMain.handle('app:info', () => ({
    version: app.getVersion(), userData: USER_DIR, packaged: app.isPackaged,
    encryption: safeStorage.isEncryptionAvailable(),
  }));

  ipcMain.handle('app:openData', () => shell.openPath(USER_DIR));

  ipcMain.handle('app:openSpeechSettings', () => shell.openExternal('ms-settings:speech'));

  // ---------- IA (opcional) ----------
  ipcMain.handle('ai:setKey', async (_e, key) => {
    if (!key) { await fsp.unlink(KEY_FILE).catch(() => {}); return true; }
    const data = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(key)
      : Buffer.from(`plain:${key}`, 'utf8');
    await fsp.writeFile(KEY_FILE, data);
    return true;
  });

  ipcMain.handle('ai:hasKey', async () => {
    try { await fsp.access(KEY_FILE); return true; } catch { return false; }
  });

  ipcMain.handle('ai:generate', async (_e, req) => {
    try {
      return { ok: true, result: await generateWithAI(req) };
    } catch (err) {
      return { ok: false, error: friendlyAIError(err) };
    }
  });
}

async function readKey() {
  const buf = await fsp.readFile(KEY_FILE);
  const asText = buf.toString('utf8');
  if (asText.startsWith('plain:')) return asText.slice(6);
  return safeStorage.decryptString(buf);
}

function friendlyAIError(err) {
  const Anthropic = require('@anthropic-ai/sdk');
  if (err && err.code === 'ENOENT') return 'Primero guarda tu clave de API en Ajustes.';
  if (err instanceof Anthropic.AuthenticationError) return 'La clave de API no es válida. Revísala en Ajustes.';
  if (err instanceof Anthropic.PermissionDeniedError) return 'Tu clave no tiene permiso para usar este modelo.';
  if (err instanceof Anthropic.RateLimitError) return 'Demasiadas peticiones seguidas. Espera un minuto y vuelve a intentarlo.';
  if (err instanceof Anthropic.APIConnectionError) return 'No hay conexión a internet (o no se pudo llegar al servicio).';
  if (err instanceof Anthropic.APIError) return `El servicio respondió con un error (${err.status || '?'}): ${err.message}`;
  return (err && err.message) || String(err);
}

// Esquema de salida: genérico y plano, luego el renderer lo convierte al formato de la app.
function aiSchema() {
  const card = {
    type: 'object',
    additionalProperties: false,
    required: ['emoji', 'text', 'say', 'color'],
    properties: {
      emoji: { type: 'string', description: 'Un solo emoji que represente la tarjeta, o vacío' },
      text: { type: 'string', description: 'Texto visible corto (letra, número o palabra), o vacío' },
      say: { type: 'string', description: 'Lo que la voz dice al tocar la tarjeta' },
      color: { type: 'string', description: 'Color CSS en hexadecimal (#rrggbb) solo para actividades de colores, o vacío' },
    },
  };
  return {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'icon', 'activities'],
    properties: {
      title: { type: 'string' },
      icon: { type: 'string' },
      activities: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['type', 'instruction', 'cards', 'correct', 'number', 'operation', 'second', 'text', 'groups'],
          properties: {
            type: { type: 'string', enum: ['choose', 'listen', 'match', 'count', 'order', 'trace', 'memory', 'pattern', 'sort', 'view'] },
            instruction: { type: 'string' },
            cards: { type: 'array', items: card },
            correct: { type: 'array', items: { type: 'integer' } },
            number: { type: 'integer' },
            operation: { type: 'string', enum: ['none', 'add', 'sub'] },
            second: { type: 'integer' },
            text: { type: 'string' },
            groups: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['label', 'items'],
                properties: { label: card, items: { type: 'array', items: card } },
              },
            },
          },
        },
      },
    },
  };
}

const AI_SYSTEM = `Eres un maestro de educación infantil que diseña sesiones cortas para una app educativa en español.
El alumno tiene la edad indicada (normalmente 5 años) y casi no sabe leer: todo se le explica con voz, emojis y tarjetas grandes.

Reglas de contenido:
- Instrucciones ("instruction") muy cortas, cálidas y habladas, de una frase. Ejemplo: "¿Dónde está la vaca?".
- Cada tarjeta usa preferentemente un emoji. "text" solo para letras, números o palabras muy cortas. "say" es lo que dirá la voz al tocarla (por ejemplo "la vaca").
- Nada de miedo, violencia ni temas inapropiados para niños pequeños. Emojis reales y comunes.
- Varía los tipos de actividad y sube la dificultad poco a poco.

Cómo rellenar cada tipo (los campos que no se usan van vacíos: listas vacías, 0, "none" o ""):
- choose: "cards" = 2 a 4 opciones; "correct" = índices de las opciones correctas (normalmente una).
- listen: "cards" = 2 a 4 opciones; "correct" = [índice] de la que suena. La voz dirá el "say" de esa tarjeta.
- match: "cards" = parejas seguidas [a1, b1, a2, b2, ...], de 2 a 4 parejas. El niño une cada a con su b.
- memory: igual que match (parejas seguidas). Si ambas tarjetas de la pareja son iguales, repite la misma tarjeta.
- count: "cards" = [la cosa que se cuenta]; "number" = cuántas (1 a 10); "operation" = "none", "add" o "sub"; "second" = segundo número para sumar/restar.
- order: "cards" = 3 a 5 tarjetas en el orden correcto (por ejemplo de pequeño a grande, o pasos de una rutina).
- trace: "text" = la letra o número a trazar (1 o 2 caracteres).
- pattern: "cards" = secuencia de 5 a 8 tarjetas que siguen un patrón; la última es la respuesta que el niño debe adivinar.
- sort: "groups" = 2 grupos, cada uno con "label" (tarjeta del grupo) e "items" (2 a 4 tarjetas que van en ese grupo).
- view: "cards" = [una tarjeta grande] para presentar algo nuevo; "instruction" es la explicación hablada.`;

async function generateWithAI({ topic, count, age, types, model, difficulty }) {
  const Anthropic = require('@anthropic-ai/sdk');
  const apiKey = await readKey();
  const client = new Anthropic({ apiKey });
  const allowed = Array.isArray(types) && types.length ? types.join(', ') : 'cualquiera';
  const userPrompt = `Crea una sesión sobre: ${topic}
Edad del alumno: ${age || 5} años.
Número de actividades: ${count || 6}.
Tipos permitidos: ${allowed}.
Dificultad: ${difficulty || 'normal'}.
Empieza con una actividad "view" que presente el tema si "view" está permitido.
El título debe ser corto (2 a 4 palabras) y el icono un solo emoji.`;

  const params = {
    model: model || 'claude-opus-5-5',
    max_tokens: 16000,
    system: AI_SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: aiSchema() } },
  };

  let resp;
  try {
    // Fallback del servidor: si el modelo rechaza la petición, la reintenta otro modelo adecuado.
    resp = await client.beta.messages.create({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' });
  } catch (err) {
    if (err instanceof Anthropic.BadRequestError && /fallback/i.test(err.message || '')) {
      resp = await client.messages.create(params);
    } else {
      throw err;
    }
  }
  if (resp.stop_reason === 'refusal') throw new Error('La IA no quiso crear esta sesión. Prueba con otro tema.');
  if (resp.stop_reason === 'max_tokens') throw new Error('La respuesta salió demasiado larga. Pide menos actividades.');
  const text = resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return JSON.parse(text);
}
