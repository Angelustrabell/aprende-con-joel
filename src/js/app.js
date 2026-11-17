// Arranque de la app.
import { loadStore, store } from './core/store.js';
import { go } from './core/router.js';
import { toast } from './core/modal.js';
import { speak } from './core/speech.js';

async function main() {
  await loadStore();

  // Evitar menús contextuales, arrastres de imágenes y selección accidental (pantalla táctil).
  document.addEventListener('contextmenu', (e) => {
    if (!e.target.closest('input, textarea')) e.preventDefault();
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  window.api.onCloseBlocked(() => {
    toast('🔒 Para salir, papá debe entrar con su PIN (botón del candado).', 'info', 3500);
    speak('Para salir, pídele ayuda a papá.');
  });

  window.addEventListener('error', (e) => console.error('Error:', e.message));
  window.addEventListener('unhandledrejection', (e) => console.error('Promesa rechazada:', e.reason));

  if (!store.data.settings.pinHash || !store.data.students.length) {
    go('onboarding');
  } else {
    go('studentHome');
  }
}

main();
