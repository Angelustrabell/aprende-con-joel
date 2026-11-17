// Tienda de la mascota: comprar y poner accesorios con estrellas, o cambiar de mascota.
import { h, animateClass } from '../core/dom.js';
import { activeCourse, getStudent, save } from '../core/store.js';
import { go } from '../core/router.js';
import { speak } from '../core/speech.js';
import { sfx } from '../core/sfx.js';
import { burstAt, confetti } from '../core/fx.js';
import { SHOP, SLOT_NAMES, MASCOTS, backgroundCss } from '../data/rewards.js';
import { mascotEl, mascotReact, courseMascot } from './mascot.js';
import { glyph } from '../data/mascotArt.js';

export const mode = 'kid';
const TAB_ICONS = { mascot: '🐾', hat: '🎩', face: '🕶️', neck: '🎀', hand: '🎈', bg: '🌈' };

export function render(root) {
  const st = getStudent();
  const m = st.mascot;
  const course = activeCourse();
  const guide = courseMascot(course, st);
  const fixed = !!course?.mascot?.kind; // el curso ya trae su guía: no se cambia en la tienda
  let tab = 'hat';

  const page = h('div', { class: 'kid-page shop' });
  const backBtn = h('button', { class: 'kid-back', type: 'button' }, '🏠');
  backBtn.addEventListener('click', () => go('studentHome'));
  const starPill = h('div', { class: 'star-pill' }, '⭐ ', h('b', String(st.stars)));
  const mascotBox = h('div', { class: 'shop-mascot' });
  const tabs = h('div', { class: 'shop-tabs' });
  const grid = h('div', { class: 'shop-grid' });

  function refresh() {
    page.style.background = backgroundCss(st);
    starPill.querySelector('b').textContent = String(st.stars);
    const me = mascotEl(st, { size: 'min(36vmin, 320px)', course });
    me.addEventListener('click', () => { mascotReact(me, 'happy'); sfx.pop(3); speak(`¡Hola! Soy ${guide.name}.`); });
    mascotBox.replaceChildren(me, h('div', { class: 'shop-name' }, guide.name));
    tabs.replaceChildren(...['mascot', 'hat', 'face', 'neck', 'hand', 'bg'].map((t) => {
      const b = h('button', { class: `shop-tab ${t === tab ? 'on' : ''}`, type: 'button' }, TAB_ICONS[t]);
      b.addEventListener('click', () => { tab = t; sfx.tap(); speak(t === 'mascot' ? 'Mascotas' : SLOT_NAMES[t]); refresh(); });
      return b;
    }));
    if (tab === 'mascot' && fixed) {
      grid.replaceChildren(h('div', { class: 'shop-note' }, `En «${course.title}» te guía ${guide.name}. ¡Vístela con tus estrellas!`));
      return;
    }
    if (tab === 'mascot') {
      grid.replaceChildren(...MASCOTS.map((x) => {
        const b = h('button', { class: `shop-item ${m.kind === x.e ? 'wearing' : 'owned'}`, type: 'button' }, h('span', { class: 'si-emoji' }, glyph(x.e)), h('small', x.n));
        b.addEventListener('click', () => {
          m.kind = x.e;
          m.name = x.n;
          save();
          sfx.unlock();
          speak(`¡Hola! Me llamo ${x.n}.`);
          refresh();
        });
        return b;
      }));
      return;
    }
    grid.replaceChildren(...SHOP.filter((it) => it.slot === tab).map((it) => {
      const owned = m.owned.includes(it.id) || it.price === 0;
      const wearing = m.wearing[it.slot] === it.id;
      const canBuy = st.stars >= it.price;
      const b = h('button', { class: `shop-item ${wearing ? 'wearing' : owned ? 'owned' : canBuy ? 'buyable' : 'expensive'}`, type: 'button' },
        h('span', { class: 'si-emoji' }, it.e),
        owned ? h('small', wearing ? '✔' : it.n) : h('small', { class: 'price' }, `⭐ ${it.price}`),
      );
      b.addEventListener('click', () => onItem(it, b));
      return b;
    }));
  }

  function onItem(it, el) {
    const owned = m.owned.includes(it.id) || it.price === 0;
    if (owned) {
      if (m.wearing[it.slot] === it.id && it.slot !== 'bg') m.wearing[it.slot] = '';
      else m.wearing[it.slot] = it.id;
      save();
      sfx.pop(5);
      speak(it.n);
      refresh();
      return;
    }
    if (st.stars < it.price) {
      animateClass(el, 'shake');
      sfx.wrong();
      const faltan = it.price - st.stars;
      speak(`Te faltan ${faltan} ${faltan === 1 ? 'estrella' : 'estrellas'}. ¡Sigue jugando!`);
      return;
    }
    // Confirmación grande con dos botones.
    const overlay = h('div', { class: 'exit-overlay' },
      h('div', { class: 'exit-box' },
        h('div', { class: 'buy-preview' }, it.e),
        h('div', { class: 'exit-q' }, `⭐ ${it.price}`),
        h('div', { class: 'exit-actions' },
          h('button', { class: 'kbtn exit-yes', type: 'button', onclick: () => { overlay.remove(); buy(it); } }, '✔'),
          h('button', { class: 'kbtn exit-no', type: 'button', onclick: () => overlay.remove() }, '✖'),
        ),
      ));
    page.append(overlay);
    speak(`¿Quieres ${it.n}? Cuesta ${it.price} estrellas.`);
  }

  function buy(it) {
    st.stars -= it.price;
    m.owned.push(it.id);
    m.wearing[it.slot] = it.id;
    save();
    sfx.win();
    confetti(80);
    refresh();
    burstAt(mascotBox, ['✨', '⭐', '🎉'], 12);
    speak(`¡Genial! ${it.n} nuevo.`);
  }

  page.append(
    h('div', { class: 'kid-top' }, backBtn, h('div', { class: 'kid-title' }, 'Mi mascota'), starPill),
    h('div', { class: 'shop-body' }, mascotBox, h('div', { class: 'shop-side' }, tabs, grid)),
  );
  root.append(page);
  refresh();
  speak('¡Vamos a vestir a tu mascota!');
}
