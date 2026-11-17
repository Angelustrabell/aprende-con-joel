// Imágenes, audios y videos guardados en la carpeta de la app.
import { mediaInText } from './markdown.js';

export const mediaUrl = (name) => (name ? `media/${encodeURIComponent(name)}` : '');

const EXT_BY_MIME = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp',
  'image/svg+xml': 'svg', 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3',
  'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'video/mp4': 'mp4',
  'video/webm': 'webm', 'video/quicktime': 'mov',
};

export function extFor(fileOrBlob) {
  const type = (fileOrBlob.type || '').split(';')[0];
  if (EXT_BY_MIME[type]) return EXT_BY_MIME[type];
  const m = /\.([a-z0-9]+)$/i.exec(fileOrBlob.name || '');
  return m ? m[1].toLowerCase() : 'bin';
}

export async function saveBlob(blob, ext = extFor(blob)) {
  const buf = await blob.arrayBuffer();
  return window.api.saveMedia(ext, buf);
}

// Guarda una imagen reduciéndola si es muy grande (las fotos del móvil pesan mucho).
export async function saveImage(file, max = 1200) {
  const type = (file.type || '').toLowerCase();
  if (type.includes('gif') || type.includes('svg')) return saveBlob(file);
  try {
    const bmp = await createImageBitmap(file);
    let { width, height } = bmp;
    const scale = Math.min(1, max / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(bmp, 0, 0, width, height);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.9));
    return saveBlob(blob, 'webp');
  } catch {
    return saveBlob(file);
  }
}

// Abre el selector de archivos del sistema.
export function pickFile(accept) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => resolve(input.files[0] || null);
    input.click();
  });
}

const MEDIA_KEYS = new Set(['image', 'audio', 'video', 'file']);

// Recoge todos los archivos usados por un objeto (curso, datos completos...).
export function collectMedia(obj, out = new Set()) {
  if (!obj || typeof obj !== 'object') return out;
  // Imágenes insertadas dentro del texto de una lectura: ![](media/archivo.webp)
  if (typeof obj.md === 'string') mediaInText(obj.md).forEach((n) => out.add(n));
  // Grabaciones de la voz de papá en una lectura: audios = { claveDePágina: { f: archivo, ... } }
  if (obj.audios && typeof obj.audios === 'object' && !Array.isArray(obj.audios)) {
    for (const v of Object.values(obj.audios)) if (v && typeof v.f === 'string' && v.f) out.add(v.f);
  }
  if (Array.isArray(obj)) {
    for (const v of obj) collectMedia(v, out);
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && v && MEDIA_KEYS.has(k)) out.add(v);
    else if ((k === 'praiseAudios' || k === 'retryAudios') && Array.isArray(v)) v.forEach((x) => x && out.add(x));
    else if (typeof v === 'object') collectMedia(v, out);
  }
  return out;
}

export async function packMedia(names) {
  const media = {};
  for (const name of names) {
    const b64 = await window.api.readMedia64(name);
    if (b64) media[name] = b64;
  }
  return media;
}

export async function unpackMedia(media) {
  for (const [name, b64] of Object.entries(media || {})) {
    await window.api.writeMedia64(name, b64);
  }
}

// Grabadora de audio con el micrófono.
export class Recorder {
  constructor() {
    this.rec = null;
    this.chunks = [];
    this.stream = null;
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    this.chunks = [];
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
    this.rec = new MediaRecorder(this.stream, { mimeType: mime });
    this.rec.ondataavailable = (e) => { if (e.data.size) this.chunks.push(e.data); };
    this.rec.start();
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.rec) return resolve(null);
      this.rec.onstop = async () => {
        this.stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this.rec = null;
        resolve(blob.size > 0 ? blob : null);
      };
      this.rec.stop();
    });
  }

  cancel() {
    try { this.rec?.stop(); } catch { /* nada */ }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.rec = null;
  }
}
