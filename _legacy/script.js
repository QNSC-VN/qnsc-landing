/* ============================================
   QNSC Landing Page — JavaScript
   Particles, Scroll Reveals, Counters, Nav
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initParticles();
  initScrollReveal();
  initCounters();
  initMobileMenu();
  initContactForm();
  // Populate text from translations.js (English only).
  if (typeof translations !== 'undefined') setLanguage('en');
});

/* --- Navbar Scroll Effect --- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        // Close mobile menu
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
          const toggleSpans = document.querySelectorAll('.nav-toggle span');
          if (toggleSpans.length === 3) {
            toggleSpans[0].style.transform = '';
            toggleSpans[1].style.opacity = '';
            toggleSpans[2].style.transform = '';
          }
        }
      }
    });
  });
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('active');
    const spans = toggle.querySelectorAll('span');
    if (links.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
}

/* --- Particle Network Background --- */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h, animId;
  const PARTICLE_COUNT = 80;
  const MAX_DIST = 150;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 67, 47, ${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x, dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(180, 67, 47, ${0.12 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    animId = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
}

/* --- Scroll Reveal --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!reveals.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => observer.observe(el));
}

/* --- Counter Animation --- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        animateCount(el, target, prefix, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  counters.forEach(el => observer.observe(el));
}

function animateCount(el, target, prefix, suffix) {
  const duration = 2000;
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* --- Contact Form --- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const btnText = document.getElementById('submit-btn-text') || btn;
    const currentLang = document.documentElement.lang || 'en';
    const dict = (typeof translations !== 'undefined' && translations[currentLang]) ? translations[currentLang] : {};
    
    const originalText = btnText.innerHTML;
    btnText.innerHTML = dict['frm_btn_sending'] || 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btnText.innerHTML = dict['frm_btn_sent'] || 'Message Sent!';
      btn.style.background = 'linear-gradient(90deg, #D9694F, #B4432F)';
      form.reset();
      setTimeout(() => {
        btnText.innerHTML = originalText;
        btn.disabled = false;
        btn.style.background = '';
      }, 3000);
    }, 1500);
  });
}

/* --- Apply Translations (English only) --- */
function setLanguage(lang) {
  if (typeof translations === 'undefined' || !translations[lang]) return;
  document.documentElement.lang = lang;
  const dict = translations[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });
}
