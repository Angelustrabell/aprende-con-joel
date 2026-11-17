// Creación de elementos sin frameworks.
// h('button', { class: 'btn', onclick: fn }, 'Texto', otroNodo)

const PROPS_AFTER = ['value', 'checked', 'selected', 'disabled', 'indeterminate'];

export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  const after = {};
  if (attrs && (attrs instanceof Node || typeof attrs !== 'object' || Array.isArray(attrs))) {
    children.unshift(attrs);
    attrs = null;
  }
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') {
      for (const [sk, sv] of Object.entries(v)) {
        if (sk.startsWith('--')) el.style.setProperty(sk, sv);
        else el.style[sk] = sv;
      }
    } else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (PROPS_AFTER.includes(k)) after[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, children);
  for (const [k, v] of Object.entries(after)) el[k] = v;
  return el;
}

export function append(el, children) {
  for (const c of [children].flat(Infinity)) {
    if (c == null || c === false || c === true) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function clear(el) {
  el.replaceChildren();
  return el;
}

// Reinicia una animación CSS (para sacudir, rebotar, etc.).
export function animateClass(el, cls, ms = 600) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}

// Botón que hay que mantener pulsado (para entrar al modo papá).
export function holdButton(el, ms, onComplete) {
  let timer = null;
  let raf = null;
  let start = 0;
  const reset = () => {
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    timer = null;
    el.style.setProperty('--hold', '0');
    el.classList.remove('holding');
  };
  const tick = () => {
    const p = Math.min(1, (performance.now() - start) / ms);
    el.style.setProperty('--hold', String(p));
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    start = performance.now();
    el.classList.add('holding');
    raf = requestAnimationFrame(tick);
    timer = setTimeout(() => { reset(); onComplete(); }, ms);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, reset));
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Observa el tamaño de un elemento y llama a fn(width, height). Devuelve la función para dejar de observar.
export function onResize(el, fn) {
  let last = '';
  const ro = new ResizeObserver(() => {
    const r = el.getBoundingClientRect();
    const key = `${Math.round(r.width)}x${Math.round(r.height)}`;
    if (key === last || r.width === 0) return;
    last = key;
    fn(r.width, r.height);
  });
  ro.observe(el);
  return () => ro.disconnect();
}
