/* ─────────────────────────────────────
   main.js – Personal Site Interactions
   ───────────────────────────────────── */

'use strict';

/* ── 1. Starfield Canvas ── */
(function initStars() {
  const canvas = document.getElementById('starsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let W, H, raf;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x:   Math.random() * W,
        y:   Math.random() * H,
        r:   Math.random() * 1.4 + 0.2,
        a:   Math.random(),
        da:  (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
        spd: Math.random() * 0.06 + 0.01,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.a += s.da;
      if (s.a > 1 || s.a < 0) s.da *= -1;
      s.y -= s.spd;
      if (s.y < -2) s.y = H + 2;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 170, 255, ${s.a * 0.8})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    createStars(160);
    cancelAnimationFrame(raf);
    draw();
  }

  window.addEventListener('resize', () => { resize(); createStars(160); });
  init();
})();


/* ── 2. Typing Animation ── */
(function initTyping() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const phrases = [
    'Computer Engineering @ UF',
    'Embedded Systems Builder',
    'Rocket Team · Data Acquisition',
    'Open to Internships 👋',
  ];

  let pi = 0, ci = 0, deleting = false;
  const PAUSE = 2000, SPEED_TYPE = 60, SPEED_DEL = 35;

  function tick() {
    const phrase = phrases[pi];
    if (deleting) {
      ci--;
      el.textContent = phrase.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, SPEED_DEL);
    } else {
      ci++;
      el.textContent = phrase.slice(0, ci);
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(tick, PAUSE);
        return;
      }
      setTimeout(tick, SPEED_TYPE);
    }
  }

  setTimeout(tick, 600);
})();


/* ── 3. Navbar: scroll shadow + active link ── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  function onScroll() {
    /* shadow */
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    /* active link */
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(l => {
      const target = l.getAttribute('href').replace('#', '');
      l.classList.toggle('active', target === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ── 4. Hamburger Menu ── */
(function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  /* close when a link is clicked */
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });
})();


/* ── 5. Scroll-reveal (Intersection Observer) ── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();


/* ── 6. Contact Form (Formspree) ── */
(function initForm() {
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  if (!form || !submitBtn) return;

  // ← Paste your Formspree form ID here (see README comment below)
  const FORMSPREE_ID = 'xdajyvgg';

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Block submission until the ID is set
    if (FORMSPREE_ID === 'YOUR_FORM_ID') {
      setStatus('⚠️ Add your Formspree ID to js/main.js first.', '#f87171');
      return;
    }

    // Loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    setStatus('', '');

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (res.ok) {
        setStatus('✓ Message sent! I\'ll get back to you soon.', '#a78bfa');
        form.reset();
      } else {
        const json = await res.json().catch(() => ({}));
        const msg  = json.errors ? json.errors.map(x => x.message).join(', ') : 'Something went wrong.';
        setStatus('⚠️ ' + msg, '#f87171');
      }
    } catch (_) {
      setStatus('⚠️ Network error — please try emailing me directly.', '#f87171');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  function setStatus(msg, color) {
    status.textContent  = msg;
    status.style.color  = color;
  }

  /*
   * ── HOW TO ACTIVATE ────────────────────────────────────────────
   * 1. Go to https://formspree.io and sign up (free).
   * 2. Click "New Form", give it a name, set the email to
   *    k.chakraborty@ufl.edu, and click Create.
   * 3. Copy the 8-character ID from the endpoint URL shown
   *    (e.g. https://formspree.io/f/abcd1234 → ID is "abcd1234").
   * 4. Replace 'YOUR_FORM_ID' at the top of this function with it.
   * 5. Done — submissions land straight in your UFL inbox.
   * ────────────────────────────────────────────────────────────── */
})();


/* ── 7. Blog Modal ── */
(function initBlogModal() {
  const overlay  = document.getElementById('blogModalOverlay');
  const modal    = document.getElementById('blogModal');
  const closeBtn = document.getElementById('modalClose');
  if (!overlay || !modal) return;

  function openModal(card) {
    document.getElementById('modalDate').textContent  = card.dataset.date  || '';
    document.getElementById('modalTag').textContent   = card.dataset.tag   || '';
    document.getElementById('modalTitle').textContent = card.dataset.title || '';

    // Convert \n\n to paragraphs
    const paragraphs = (card.dataset.full || '').split('\n\n').filter(Boolean);
    document.getElementById('modalBody').innerHTML =
      paragraphs.map(p => `<p>${p}</p>`).join('');

    overlay.classList.add('open');
    modal.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Open on "Read More" click
  document.querySelectorAll('.blog-card .blog-more').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const card = link.closest('.blog-card');
      if (card && card.dataset.full) openModal(card);
    });
  });

  // Close on button, backdrop click, or Escape
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
})();


/* ── 8. Smooth-scroll for in-page links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
