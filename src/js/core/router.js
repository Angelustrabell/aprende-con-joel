// Navegación entre pantallas.
import { stopSpeech } from './speech.js';
import { closeAllModals } from './modal.js';
import { settings, editState } from './store.js';
import { stopConfetti } from './fx.js';

const screens = {
  onboarding: () => import('../parent/onboarding.js'),
  pin: () => import('../parent/pinGate.js'),
  parentHome: () => import('../parent/home.js'),
  courseEditor: () => import('../parent/courseEditor.js'),
  sessionEditor: () => import('../parent/sessionEditor.js'),
  activityEditor: () => import('../parent/activityEditor.js'),
  readingEditor: () => import('../parent/readingEditor.js'),
  studentHome: () => import('../student/home.js'),
  courseSelect: () => import('../student/courseSelect.js'),
  map: () => import('../student/map.js'),
  player: () => import('../student/player.js'),
  reward: () => import('../student/reward.js'),
  gameReward: () => import('../student/gameReward.js'),
  achievements: () => import('../student/achievements.js'),
  album: () => import('../student/album.js'),
  shop: () => import('../student/shop.js'),
  limit: () => import('../student/limit.js'),
};

let cleanup = null;
let navToken = 0;
let currentKid = null;
export const current = { name: null, params: {} };

function applyWindowMode(kid) {
  if (currentKid === kid) return;
  currentKid = kid;
  const s = settings();
  window.api.setWindowMode({
    kiosk: kid && s.kiosk,
    fullscreen: kid && (s.kiosk || s.fullscreen),
    lock: kid && s.kiosk,
  });
}

export function refreshWindowMode() {
  const was = currentKid;
  currentKid = null;
  applyWindowMode(!!was);
}

export async function go(name, params = {}) {
  const token = ++navToken;
  const mod = await screens[name]();
  if (token !== navToken) return;
  try { cleanup?.(); } catch (e) { console.error(e); }
  cleanup = null;
  stopSpeech();
  stopConfetti();
  closeAllModals();
  const root = document.getElementById('app');
  root.replaceChildren();
  const style = mod.mode || 'kid';
  root.className = style === 'parent' ? 'adult' : 'kid';
  // Ventana: el modo Joel bloquea; la vista previa de papá no.
  const kidWindow = style === 'kid' && !params.preview && !editState.on && name !== 'onboarding';
  applyWindowMode(kidWindow);
  current.name = name;
  current.params = params;
  try {
    const r = await mod.render(root, params);
    cleanup = typeof r === 'function' ? r : null;
    // Modo edición: la pantalla de Joel lleva encima la barra de herramientas de papá.
    if (editState.on && style === 'kid' && !['pin', 'onboarding'].includes(name)) {
      root.classList.add('editing');
      const { editBar } = await import('../parent/editBar.js');
      if (token === navToken) root.append(editBar(name));
    }
  } catch (e) {
    console.error(e);
    root.append(Object.assign(document.createElement('pre'), { className: 'fatal', textContent: `Error: ${e.message}\n${e.stack}` }));
  }
}
