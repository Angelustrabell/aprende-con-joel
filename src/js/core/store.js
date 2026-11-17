// Estado de la app y guardado en disco.
import { uid } from './util.js';

export const store = {
  data: null,
  studentId: null,
};

// Modo edición de papá: se ven las pantallas de Joel, pero con herramientas para editarlas.
export const editState = { on: false };

export const DEFAULT_SETTINGS = {
  pinHash: '',
  kiosk: true,            // modo Joel en pantalla completa sin poder cerrar
  fullscreen: true,       // si no hay kiosco, al menos pantalla completa
  sounds: true,
  volume: 0.8,
  voiceURI: '',
  rate: 0.95,
  pitch: 1.1,
  dailyMinutes: 20,       // 0 = sin límite
  maxSessionsPerDay: 0,   // 0 = sin límite
  sequentialUnlock: true, // las sesiones de cada unidad se desbloquean en orden
  reviewCount: 2,         // actividades de repaso al empezar cada sesión
  showCaptions: true,     // mostrar texto bajo los dibujos
  praiseAudios: [],       // grabaciones de papá: "¡Muy bien!"
  retryAudios: [],        // grabaciones de papá: "¡Casi! Otra vez"
  aiModel: 'claude-opus-5-5',
  idleHelp: true,         // repetir la instrucción si el niño se queda quieto
  dailyGoal: 2,           // misión del día: sesiones que hay que completar
  activeCourseId: '',     // curso que se abre con el botón ¡Jugar! (interruptor del inicio)
};

export function newStudent(name = 'Joel', avatar = '👦') {
  return {
    id: uid(),
    name,
    avatar,
    stars: 0,
    stickers: [],
    mascot: { kind: 'svg:nous', name: 'Nous', owned: ['bg-sky'], wearing: { hat: '', face: '', neck: '', hand: '', bg: 'bg-sky' } },
    createdAt: Date.now(),
  };
}

export function newData() {
  return {
    version: 1,
    createdAt: Date.now(),
    settings: { ...DEFAULT_SETTINGS },
    students: [],
    courses: [],
    progress: {},
    lastStudentId: null,
  };
}

function migrate(d) {
  d.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
  d.students = d.students || [];
  d.courses = d.courses || [];
  d.progress = d.progress || {};
  for (const s of d.students) {
    s.stickers = s.stickers || [];
    s.stars = s.stars || 0;
    s.mascot = s.mascot || newStudent().mascot;
    s.mascot.owned = s.mascot.owned || ['bg-sky'];
    s.mascot.wearing = { hat: '', face: '', neck: '', hand: '', bg: 'bg-sky', ...(s.mascot.wearing || {}) };
  }
  // Nous pasa a ser la guía por defecto: solo se cambia a quien aún tiene el Dino original sin tocar
  // (sin accesorios ni compras). Se hace una sola vez; si luego eligen otra mascota, se respeta.
  if (!d.nousDefault) {
    for (const s of d.students) {
      const w = s.mascot.wearing || {};
      const untouched = s.mascot.kind === '🦖' && s.mascot.name === 'Dino' && !w.hat && !w.face && !w.neck && !w.hand && s.mascot.owned.length <= 1;
      if (untouched) { s.mascot.kind = 'svg:nous'; s.mascot.name = 'Nous'; }
    }
    d.nousDefault = true;
  }
  for (const c of d.courses) {
    if (c.id === 'curso-conocimiento-si-mismo' && !c.mascot && !d.nousGuide) c.mascot = { kind: 'svg:nous', name: 'Nous' };
    if (c.id === 'curso-conocimiento-si-mismo' && !d.nousStories) {
      c.story ??= '¡Hola! Soy Nous, tu guía. Vamos a descubrir cosas muy bonitas sobre cada uno de nosotros.';
      for (const u of c.units || []) {
        if (u.id === 'libros-unidad-a') { u.story ??= 'Aquí comienza el viaje. Lee con calma y escucha con atención.'; u.color ??= '#a99aff'; }
        if (u.id === 'libros-unidad-b') { u.story ??= 'Seguimos el viaje, con nuevas lecturas para aprender y practicar.'; u.color ??= '#7cc8ff'; }
      }
    }
    c.units = c.units || [];
    if (c.visible === undefined) c.visible = true;
    for (const u of c.units) {
      u.sessions = u.sessions || [];
      for (const s of u.sessions) s.activities = s.activities || [];
    }
  }
  d.nousGuide = true; // la guía Nous del curso de los libros se asigna una sola vez
  d.nousStories = true;
  return d;
}

export async function loadStore() {
  let d = null;
  try { d = await window.api.loadData(); } catch (e) { console.error(e); }
  store.data = migrate(d || newData());
  await seedBooks(store.data);
  await seedBooksGames(store.data);
  await seedPrimero(store.data);
  const ids = store.data.students.map((s) => s.id);
  store.studentId = ids.includes(store.data.lastStudentId) ? store.data.lastStudentId : ids[0] || null;
  window.api.onFlush(() => saveNow());
}

// ---------- Curso de los libros ----------
export const BOOKS_COURSE_ID = 'curso-conocimiento-si-mismo';

async function fetchBooksCourse() {
  const res = await fetch('assets/libros/curso.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`No se pudo leer el curso (${res.status})`);
  return res.json();
}

// La primera vez se añade el curso "Conocimiento de Sí Mismo" (oculto para Joel hasta que papá lo active).
async function seedBooks(d) {
  if (d.booksSeeded) return;
  try {
    const course = await fetchBooksCourse();
    if (!d.courses.some((c) => c.id === course.id)) d.courses.push(migrate({ courses: [course] }).courses[0]);
    d.booksSeeded = true;
    save();
  } catch (e) { console.error('No se pudo cargar el curso de los libros:', e); }
}

// Una sola vez: añade a las conferencias ya guardadas los minijuegos nuevos (ids «…-mj-N»), sin tocar
// la lectura ni lo que papá haya editado. En una instalación nueva el curso ya los trae y no se duplica nada.
async function seedBooksGames(d) {
  if (d.booksGamesSeeded) return;
  try {
    const src = await fetchBooksCourse();
    const course = d.courses.find((c) => c.id === src.id);
    if (course) {
      const origin = new Map(src.units.flatMap((u) => u.sessions).map((s) => [s.id, s]));
      for (const u of course.units || []) {
        for (const s of u.sessions || []) {
          const o = origin.get(s.id);
          if (!o) continue;
          const have = new Set((s.activities || []).map((a) => a.id));
          for (const a of o.activities) if (/-mj-\d+$/.test(a.id) && !have.has(a.id)) (s.activities ||= []).push(structuredClone(a));
        }
      }
    }
    d.booksGamesSeeded = true;
    save();
  } catch (e) { console.error('No se pudieron añadir los minijuegos de los libros:', e); }
}

// ---------- Curso "Camino a primero" (temario de primero de primaria) ----------
export const PRIMERO_COURSE_ID = 'curso-camino-a-primero';

// La primera vez se añade "Camino a primero" (visible). El curso de ejemplo de preescolar se oculta, no se borra:
// el nuevo curso ya lo incluye como calentamiento.
async function seedPrimero(d) {
  if (d.primeroSeeded) return;
  try {
    const { primeroCourse } = await import('../data/primero.js');
    const course = primeroCourse();
    if (!d.courses.some((c) => c.id === course.id)) d.courses.push(migrate({ courses: [course] }).courses[0]);
    for (const c of d.courses) if (c.title === 'Mi primer curso' && c.units?.[0]?.title === 'Las vocales') c.visible = false;
    d.primeroSeeded = true;
    save();
  } catch (e) { console.error('No se pudo cargar el curso de primero:', e); }
}

// Añade otra copia del curso de primero (para recuperar el original).
export async function addPrimeroCopy() {
  const { primeroCourse } = await import('../data/primero.js');
  const course = primeroCourse();
  if (store.data.courses.some((c) => c.id === course.id)) { course.id = `${course.id}-copia${Date.now().toString(36)}`; course.title += ' (copia)'; }
  store.data.courses.push(migrate({ courses: [course] }).courses[0]);
  await saveNow();
  return course;
}

// Vuelve a añadir el curso original como una copia nueva (para recuperar el texto sin adaptar).
export async function addBooksCopy() {
  const course = await fetchBooksCourse();
  const old = store.data.courses.some((c) => c.id === course.id);
  const rid = (id) => `${id}-copia${Date.now().toString(36)}`;
  if (old) {
    course.id = rid(course.id);
    course.title += ' (copia original)';
    for (const u of course.units) { u.id = rid(u.id); for (const s of u.sessions) { s.id = rid(s.id); for (const a of s.activities) a.id = rid(a.id); } }
  }
  store.data.courses.push(migrate({ courses: [course] }).courses[0]);
  await saveNow();
  return course;
}

let timer = null;
let pending = false;

export function save() {
  pending = true;
  clearTimeout(timer);
  timer = setTimeout(saveNow, 350);
}

export async function saveNow() {
  clearTimeout(timer);
  timer = null;
  if (!store.data) return;
  pending = false;
  await window.api.saveData(JSON.stringify(store.data));
}

export const hasPendingSave = () => pending;

export const settings = () => store.data.settings;

export function setStudent(id) {
  store.studentId = id;
  store.data.lastStudentId = id;
  save();
}

export function getStudent(id = store.studentId) {
  return store.data.students.find((s) => s.id === id) || store.data.students[0] || null;
}

// ---------- Búsquedas en cursos ----------
export const findCourse = (id) => store.data.courses.find((c) => c.id === id) || null;

export function findUnit(unitId) {
  for (const course of store.data.courses) {
    const unit = course.units.find((u) => u.id === unitId);
    if (unit) return { course, unit };
  }
  return null;
}

export function findSession(sessionId) {
  for (const course of store.data.courses) {
    for (const unit of course.units) {
      const session = unit.sessions.find((s) => s.id === sessionId);
      if (session) return { course, unit, session };
    }
  }
  return null;
}

export function findActivity(actId) {
  for (const course of store.data.courses) {
    for (const unit of course.units) {
      for (const session of unit.sessions) {
        const activity = session.activities.find((a) => a.id === actId);
        if (activity) return { course, unit, session, activity };
      }
    }
  }
  return null;
}

export function courseStats(course) {
  let sessions = 0;
  let activities = 0;
  for (const u of course.units) {
    sessions += u.sessions.length;
    for (const s of u.sessions) activities += s.activities.length;
  }
  return { units: course.units.length, sessions, activities };
}

export const visibleCourses = () => store.data.courses.filter((c) => c.visible !== false && courseStats(c).activities > 0);

// Cursos que se pueden elegir en el inicio: los visibles para Joel (en modo edición, todos).
export const selectableCourses = () => (editState.on ? store.data.courses : visibleCourses());

// Curso que abre el botón ¡Jugar!
export function activeCourse() {
  const list = selectableCourses();
  return list.find((c) => c.id === settings().activeCourseId) || list[0] || null;
}
