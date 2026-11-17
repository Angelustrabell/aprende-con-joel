// Efectos de sonido sintetizados (no necesitan archivos).
import { settings } from './store.js';

let ctx = null;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function vol() {
  const s = settings();
  return s.sounds ? (s.volume ?? 0.8) : 0;
}

function tone(freq, start, dur, type = 'sine', gain = 0.2, slideTo = null) {
  const v = vol();
  if (!v) return;
  const c = ac();
  const t0 = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * v), t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export const sfx = {
  tap() { tone(700, 0, 0.07, 'sine', 0.12); },
  pop(i = 0) { tone(420 + i * 55, 0, 0.09, 'triangle', 0.18, 620 + i * 55); },
  correct() {
    [523.25, 659.25, 783.99].forEach((f, i) => tone(f, i * 0.08, 0.16, 'triangle', 0.2));
    tone(1046.5, 0.24, 0.32, 'triangle', 0.16);
  },
  wrong() {
    tone(330, 0, 0.14, 'sine', 0.16);
    tone(262, 0.13, 0.24, 'sine', 0.16);
  },
  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => tone(f, i * 0.11, i === notes.length - 1 ? 0.6 : 0.16, 'triangle', 0.2));
    notes.forEach((f, i) => tone(f / 2, i * 0.11, 0.14, 'sine', 0.08));
  },
  star() {
    tone(1318.5, 0, 0.12, 'sine', 0.14);
    tone(1760, 0.08, 0.22, 'sine', 0.12);
  },
  flip() { tone(600, 0, 0.06, 'triangle', 0.1, 900); },
  whoosh() { tone(300, 0, 0.25, 'sawtooth', 0.04, 1200); },
  unlock() { [392, 523.25, 659.25, 783.99].forEach((f, i) => tone(f, i * 0.07, 0.2, 'square', 0.06)); },
};
