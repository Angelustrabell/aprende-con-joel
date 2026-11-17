// Efectos visuales: confeti y estallidos de estrellas.

let particles = [];
let running = false;

function canvas() {
  const c = document.getElementById('fx-canvas');
  const dpr = window.devicePixelRatio || 1;
  if (c.width !== window.innerWidth * dpr || c.height !== window.innerHeight * dpr) {
    c.width = window.innerWidth * dpr;
    c.height = window.innerHeight * dpr;
  }
  return c;
}

const COLORS = ['#ff5a5f', '#ffd23f', '#2ec4ff', '#2ecc71', '#a66cff', '#ff9f1c', '#ff6fb5'];

export function confetti(amount = 160) {
  const c = canvas();
  const dpr = window.devicePixelRatio || 1;
  for (let i = 0; i < amount; i++) {
    particles.push({
      x: (Math.random() * window.innerWidth) * dpr,
      y: (-20 - Math.random() * window.innerHeight * 0.5) * dpr,
      vx: (Math.random() - 0.5) * 4 * dpr,
      vy: (2 + Math.random() * 4) * dpr,
      w: (8 + Math.random() * 10) * dpr,
      h: (5 + Math.random() * 8) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
    });
  }
  if (!running) {
    running = true;
    requestAnimationFrame(() => loop(c));
  }
}

function loop(c) {
  const g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  particles = particles.filter((p) => p.y < c.height + 40 && p.life < 420);
  for (const p of particles) {
    p.life++;
    p.x += p.vx + Math.sin(p.life / 12) * 0.8;
    p.y += p.vy;
    p.vy += 0.03;
    p.rot += p.vr;
    g.save();
    g.translate(p.x, p.y);
    g.rotate(p.rot);
    g.fillStyle = p.color;
    g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.life / 8)));
    g.restore();
  }
  if (particles.length) requestAnimationFrame(() => loop(c));
  else {
    running = false;
    g.clearRect(0, 0, c.width, c.height);
  }
}

export function stopConfetti() {
  particles = [];
}

export function burst(x, y, emojis = ['⭐', '✨', '🌟'], n = 9) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'burst';
    s.textContent = emojis[i % emojis.length];
    const angle = (Math.PI * 2 * i) / n + Math.random() * 0.5;
    const dist = 60 + Math.random() * 70;
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
}

export function burstAt(el, emojis, n) {
  if (!el || !el.isConnected) return;
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, emojis, n);
}

// Una estrella vuela de un elemento a otro (por ejemplo al contador de estrellas).
export function flyStar(fromEl, toEl, emoji = '⭐') {
  if (!fromEl || !toEl) return;
  const a = fromEl.getBoundingClientRect();
  const b = toEl.getBoundingClientRect();
  const s = document.createElement('span');
  s.className = 'fly-star';
  s.textContent = emoji;
  s.style.left = `${a.left + a.width / 2}px`;
  s.style.top = `${a.top + a.height / 2}px`;
  document.body.appendChild(s);
  requestAnimationFrame(() => {
    s.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(0.6)`;
    s.style.opacity = '0.3';
  });
  setTimeout(() => s.remove(), 900);
}
