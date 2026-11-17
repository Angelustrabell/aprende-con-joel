// Álbum de pegatinas.
import { h, animateClass } from '../core/dom.js';
import { getStudent } from '../core/store.js';
import { go } from '../core/router.js';
import { speak } from '../core/speech.js';
import { sfx } from '../core/sfx.js';
import { burstAt } from '../core/fx.js';
import { STICKER_PAGES, ALL_STICKERS, backgroundCss } from '../data/rewards.js';

export const mode = 'kid';

export function render(root, { highlight = null, back = null } = {}) {
  const st = getStudent();
  const owned = new Set(st.stickers);
  let page = Math.max(0, STICKER_PAGES.findIndex((p) => p.items.some(([e]) => e === highlight)));

  const backBtn = h('button', { class: 'kid-back', type: 'button' }, '🏠');
  backBtn.addEventListener('click', () => (back ? go(back.name, back.params) : go('studentHome')));
  const tabs = h('div', { class: 'album-tabs' });
  const grid = h('div', { class: 'album-grid' });
  const count = h('div', { class: 'star-pill' }, '📒 ', h('b', `${owned.size}/${ALL_STICKERS.length}`));

  function showPage(i) {
    page = i;
    tabs.replaceChildren(...STICKER_PAGES.map((p, j) => {
      const got = p.items.filter(([e]) => owned.has(e)).length;
      const b = h('button', { class: `album-tab ${j === i ? 'on' : ''}`, type: 'button' }, h('span', p.icon), h('small', `${got}/${p.items.length}`));
      b.addEventListener('click', () => { sfx.tap(); showPage(j); speak(p.title); });
      return b;
    }));
    grid.replaceChildren(...STICKER_PAGES[i].items.map(([e, n]) => {
      const has = owned.has(e);
      const s = h('button', { class: `sticker ${has ? 'owned' : 'missing'} ${e === highlight ? 'new' : ''}`, type: 'button' }, h('span', e));
      s.addEventListener('click', () => {
        if (has) {
          sfx.pop(4);
          animateClass(s, 'bounce');
          burstAt(s, ['✨'], 5);
          speak(n);
        } else {
          speak('Esta pegatina todavía no la tienes. ¡Sigue jugando!');
        }
      });
      return s;
    }));
  }
  showPage(page);

  root.append(h('div', { class: 'kid-page album', style: { background: backgroundCss(st) } },
    h('div', { class: 'kid-top' }, backBtn, h('div', { class: 'kid-title' }, 'Mi álbum'), count),
    tabs,
    h('div', { class: 'album-book' }, grid),
  ));
  speak(owned.size ? `¡Tienes ${owned.size} pegatinas!` : 'Tu álbum está vacío. ¡Juega para ganar pegatinas!');
}
