/* ═══════════════════════════════════════════════════════════
   VOLTEX — main.js
   Initializes Lightning canvases, nav, animations, form
═══════════════════════════════════════════════════════════ */

/* ── HERO LIGHTNING ──────────────────────────────────────── */
const heroCanvas = document.getElementById('heroCanvas');
const heroLightning = new Lightning(heroCanvas, { hue: 220, speed: 0.8, intensity: 1.2, size: 0.9 });
heroLightning.start();

/* ── SERVICES BG LIGHTNING ───────────────────────────────── */
const servicesCanvas = document.getElementById('servicesCanvas');
const servicesLightning = new Lightning(servicesCanvas, { hue: 270, speed: 0.5, intensity: 0.7, size: 1.1 });
servicesLightning.start();

/* ── ABOUT LIGHTNING ─────────────────────────────────────── */
const aboutCanvas = document.getElementById('aboutCanvas');
const aboutLightning = new Lightning(aboutCanvas, { hue: 200, speed: 0.7, intensity: 1.0, size: 0.8 });
aboutLightning.start();

/* ── CONTACT LIGHTNING ───────────────────────────────────── */
const contactCanvas = document.getElementById('contactCanvas');
const contactLightning = new Lightning(contactCanvas, { hue: 220, speed: 0.9, intensity: 1.4, size: 1.0 });
contactLightning.start();

/* ── CARD HOVER LIGHTNING ────────────────────────────────── */
const cardLightnings = new Map();

document.querySelectorAll('.project-card').forEach(card => {
  const canvas = card.querySelector('.card-canvas');
  if (!canvas) return;

  const hue = parseFloat(canvas.dataset.hue) || 220;
  const speed = parseFloat(canvas.dataset.speed) || 1.0;
  const intensity = parseFloat(canvas.dataset.intensity) || 1.0;
  const size = parseFloat(canvas.dataset.size) || 1.0;

  const bolt = new Lightning(canvas, { hue, speed, intensity, size });
  cardLightnings.set(card, bolt);

  let entered = false;
  card.addEventListener('mouseenter', () => {
    if (!entered) { bolt.start(); entered = true; }
  });
  card.addEventListener('mouseleave', () => {
    bolt.stop(); entered = false;
  });
  card.addEventListener('focus', () => { if (!entered) { bolt.start(); entered = true; } });
  card.addEventListener('blur', () => { bolt.stop(); entered = false; });
});

/* ── NAVBAR SCROLL BEHAVIOUR ─────────────────────────────── */
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 40);
  navbar.classList.toggle('hidden', y > lastScroll + 10 && y > 200);
  navbar.classList.toggle('visible', y < lastScroll - 10);
  lastScroll = y;
}, { passive: true });

/* ── HAMBURGER ───────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('mobile-open');
});

/* ── SMOOTH SECTION REVEAL (IntersectionObserver) ─────────── */
const revealItems = document.querySelectorAll(
  '.project-card, .service-item, .testimonial, .about-left, .about-right, .contact-inner'
);
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealItems.forEach(el => { el.classList.add('will-reveal'); revealObserver.observe(el); });

/* ── CONTACT FORM ────────────────────────────────────────── */
const form = document.getElementById('contactForm');
const successMsg = document.getElementById('form-success');
form.addEventListener('submit', e => {
  e.preventDefault();
  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Sending…';

  setTimeout(() => {
    form.reset();
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Send Message';
    successMsg.hidden = false;
    setTimeout(() => { successMsg.hidden = true; }, 4000);
  }, 1200);
});

/* ── CURSOR GLOW ─────────────────────────────────────────── */
const glow = document.createElement('div');
glow.id = 'cursor-glow';
document.body.appendChild(glow);
let glowX = 0, glowY = 0, curX = 0, curY = 0;
document.addEventListener('mousemove', e => { glowX = e.clientX; glowY = e.clientY; });

(function animateCursor() {
  curX += (glowX - curX) * 0.1;
  curY += (glowY - curY) * 0.1;
  glow.style.transform = `translate(${curX - 200}px, ${curY - 200}px)`;
  requestAnimationFrame(animateCursor);
})();

/* ── MAGNETIC BUTTONS ────────────────────────────────────── */
document.querySelectorAll('.btn-primary, .btn-ghost, .btn-nav').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ── COUNTER ANIMATION ───────────────────────────────────── */
function animateCounter(el, end, suffix = '') {
  let start = 0;
  const dur = 1800;
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min((now - t0) / dur, 1);
    const val = Math.round(p * end);
    el.textContent = val + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const nums = e.target.querySelectorAll('.stat-num');
      nums.forEach(n => {
        const text = n.textContent;
        if (text.includes('+')) animateCounter(n, parseInt(text), '+');
        else if (text.includes('%')) animateCounter(n, parseInt(text), '%');
        else if (text.includes('★')) n.textContent = '5★';
      });
      statsObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

/* ── PARALLAX HERO TEXT ──────────────────────────────────── */
const heroContent = document.querySelector('.hero-content');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroContent) {
    heroContent.style.transform = `translateY(${y * 0.3}px)`;
    heroContent.style.opacity = 1 - y / 600;
  }
}, { passive: true });
