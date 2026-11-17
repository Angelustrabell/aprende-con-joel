// Arrastrar y soltar con ratón y pantalla táctil (Pointer Events).
// Si no se mueve, cuenta como toque (onTap).

export function makeDraggable(el, { getTargets, onDrop, onTap, onStart, onEnd, threshold = 10 }) {
  let start = null;
  let dragging = false;
  let hover = null;
  let pointerId = null;

  const targetAt = (x, y) => {
    const targets = getTargets();
    const stack = document.elementsFromPoint(x, y);
    for (const node of stack) {
      if (node === el || el.contains(node)) continue;
      const t = targets.find((tg) => tg === node || tg.contains(node));
      if (t) return t;
    }
    return null;
  };

  const setHover = (t) => {
    if (hover === t) return;
    hover?.classList.remove('drop-hover');
    hover = t;
    hover?.classList.add('drop-hover');
  };

  const reset = (animateBack) => {
    setHover(null);
    el.classList.remove('dragging');
    if (animateBack) {
      el.classList.add('returning');
      el.style.transform = '';
      setTimeout(() => el.classList.remove('returning'), 260);
    } else {
      el.style.transform = '';
    }
    dragging = false;
    start = null;
    pointerId = null;
  };

  const down = (e) => {
    if (el.classList.contains('locked') || (e.button !== undefined && e.button > 0)) return;
    e.preventDefault();
    start = { x: e.clientX, y: e.clientY };
    pointerId = e.pointerId;
    try { el.setPointerCapture(e.pointerId); } catch { /* nada */ }
  };

  const move = (e) => {
    if (!start || e.pointerId !== pointerId) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!dragging && Math.hypot(dx, dy) > threshold) {
      dragging = true;
      el.classList.add('dragging');
      onStart?.(el);
    }
    if (dragging) {
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
      setHover(targetAt(e.clientX, e.clientY));
    }
  };

  const up = async (e) => {
    if (!start || e.pointerId !== pointerId) return;
    const wasDragging = dragging;
    start = null; // a partir de aquí lostpointercapture ya no cancela
    if (!wasDragging) {
      reset(false);
      onTap?.(el, e);
      return;
    }
    const target = targetAt(e.clientX, e.clientY);
    setHover(null);
    let accepted = false;
    if (target) accepted = (await onDrop(el, target)) !== false;
    onEnd?.(el, accepted);
    reset(!accepted);
  };

  const cancel = () => { if (start) reset(true); };

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', cancel);
  el.addEventListener('lostpointercapture', () => { if (start && dragging) cancel(); });
  el.style.touchAction = 'none';

  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', cancel);
  };
}
