// Exportar e importar cursos, copias de seguridad y limpieza de archivos.
import { store, saveNow } from '../core/store.js';
import { collectMedia, packMedia, unpackMedia } from '../core/media.js';
import { clone, uid } from '../core/util.js';
import { busy, toast, confirmDialog } from '../core/modal.js';

const COURSE_FILTER = [{ name: 'Curso de Aprende con Joel', extensions: ['joelcurso', 'json'] }];
const BACKUP_FILTER = [{ name: 'Copia de seguridad', extensions: ['joelcopia', 'json'] }];

const safeName = (s) => String(s || 'curso').replace(/[\\/:*?"<>|]+/g, '').slice(0, 60) || 'curso';

export async function exportCourse(course) {
  const done = busy('Preparando el curso…');
  try {
    const media = await packMedia(collectMedia(course));
    const json = JSON.stringify({ format: 'edujoel-course', version: 1, exportedAt: Date.now(), course, media });
    done();
    const ok = await window.api.exportFile(`${safeName(course.title)}.joelcurso`, json, COURSE_FILTER);
    if (ok) toast('✔ Curso exportado', 'ok');
  } catch (e) {
    done();
    toast(`Error al exportar: ${e.message}`, 'error');
  }
}

function withFreshIds(course) {
  const c = clone(course);
  c.id = uid();
  for (const u of c.units || []) {
    u.id = uid();
    for (const s of u.sessions || []) {
      s.id = uid();
      for (const a of s.activities || []) a.id = uid();
    }
  }
  return c;
}

export async function importCourse() {
  const text = await window.api.importFile(COURSE_FILTER);
  if (!text) return null;
  let parsed;
  try { parsed = JSON.parse(text); } catch { toast('Ese archivo no es un curso válido.', 'error'); return null; }
  if (parsed.format !== 'edujoel-course' || !parsed.course) { toast('Ese archivo no es un curso de Aprende con Joel.', 'error'); return null; }
  const done = busy('Importando…');
  try {
    await unpackMedia(parsed.media);
    const course = withFreshIds(parsed.course);
    course.visible = course.visible !== false;
    store.data.courses.push(course);
    await saveNow();
    done();
    toast(`✔ Curso "${course.title}" importado`, 'ok');
    return course;
  } catch (e) {
    done();
    toast(`Error al importar: ${e.message}`, 'error');
    return null;
  }
}

export function duplicateCourse(course) {
  const c = withFreshIds(course);
  c.title = `${course.title} (copia)`;
  store.data.courses.push(c);
  return c;
}

export async function exportBackup() {
  const done = busy('Creando copia de seguridad…');
  try {
    const media = await packMedia(collectMedia(store.data));
    const json = JSON.stringify({ format: 'edujoel-backup', version: 1, exportedAt: Date.now(), data: store.data, media });
    done();
    const d = new Date();
    const ok = await window.api.exportFile(`AprendeConJoel-copia-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}.joelcopia`, json, BACKUP_FILTER);
    if (ok) toast('✔ Copia guardada', 'ok');
  } catch (e) {
    done();
    toast(`Error: ${e.message}`, 'error');
  }
}

export async function restoreBackup() {
  const text = await window.api.importFile(BACKUP_FILTER);
  if (!text) return false;
  let parsed;
  try { parsed = JSON.parse(text); } catch { toast('Archivo no válido.', 'error'); return false; }
  if (parsed.format !== 'edujoel-backup' || !parsed.data) { toast('Ese archivo no es una copia de Aprende con Joel.', 'error'); return false; }
  if (!(await confirmDialog('Esto reemplazará TODOS los datos actuales (cursos, progreso, ajustes) por los de la copia. ¿Continuar?', { okLabel: 'Restaurar', danger: true }))) return false;
  const done = busy('Restaurando…');
  await unpackMedia(parsed.media);
  store.data = parsed.data;
  await saveNow();
  done();
  location.reload();
  return true;
}

export async function cleanUnusedMedia() {
  const used = collectMedia(store.data);
  const all = await window.api.listMedia();
  const unused = all.filter((n) => !used.has(n));
  if (!unused.length) { toast('No hay archivos sin usar.', 'ok'); return; }
  if (!(await confirmDialog(`Hay ${unused.length} archivos (imágenes, audios o videos) que ya no usa ningún curso. ¿Borrarlos para liberar espacio?`, { okLabel: 'Borrar', danger: true }))) return;
  const n = await window.api.deleteMedia(unused);
  toast(`✔ ${n} archivos borrados`, 'ok');
}
