/* animations.js — adds motion without touching your HTML structure */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  root.classList.add('js-anim');

  /* ---- Loader ---- */
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.innerHTML = '<div class="ld-panel top"></div><div class="ld-panel bottom"></div><div class="ld-logo">Richhat<span>.</span></div>';
  document.body.prepend(loader);

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    root.classList.add('loaded');
    setTimeout(() => loader.remove(), 1500);
  };
  if (reduce) start();
  else {
    if (document.readyState === 'complete') setTimeout(start, 700);
    else window.addEventListener('load', () => setTimeout(start, 700));
    setTimeout(start, 3500); // safety net
  }

  /* ---- Split hero title into masked lines ---- */
  const title = document.querySelector('.hero-title');
  if (title) {
    const parts = title.innerHTML.split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean);
    title.innerHTML = parts.map((p, i) =>
      `<span class="line"><span class="line-in" style="--i:${i}">${p}</span></span>`).join('');
  }

  /* ---- Terminal lines stagger ---- */
  document.querySelectorAll('.term-body > div').forEach((el, i) => el.style.setProperty('--n', i));

  /* ---- Hero orbs + sparkles ---- */
  const home = document.getElementById('home');
  if (home && !reduce) {
    ['o1', 'o2', 'o3'].forEach(c => {
      const o = document.createElement('div');
      o.className = 'hero-orb ' + c;
      home.prepend(o);
    });
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.textContent = '✦';
      s.style.cssText = `left:${6 + Math.random() * 88}%;top:${8 + Math.random() * 80}%;` +
        `font-size:${10 + Math.random() * 16}px;animation-delay:${(Math.random() * 3).toFixed(2)}s;` +
        `animation-duration:${(2.6 + Math.random() * 2).toFixed(2)}s`;
      home.appendChild(s);
    }
  }

  /* ---- Assign scroll-reveal variants ---- */
  const assign = (sel, anim, step = 90, alt) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.dataset.anim = alt ? (i % 2 ? alt : anim) : anim;
      el.style.setProperty('--d', i * step + 'ms');
    });
  };
  assign('.section-head', 'blur', 0);
  assign('.about-text', 'left', 0);
  assign('.stat-card', 'right', 140);
  assign('.badge', 'pop', 120);
  assign('.skill-card', 'pop', 80);
  assign('.project-card', 'flip', 140);
  assign('.tl-item', 'left', 0, 'right');
  assign('.contact-info', 'left', 0);
  assign('#contactForm', 'right', 0);
  assign('.contact-row', 'up', 120);
  assign('footer .container > *', 'up', 120);

  /* ---- 3D tilt (desktop only) ---- */
  if (fine && !reduce) {
    document.querySelectorAll('.project-card,.skill-card,.stat-card,.term-card,.badge').forEach(el => {
      el.classList.add('tilt');
      if (!el.dataset.anim) setTimeout(() => el.classList.add('ready'), 2600);
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
        el.style.setProperty('--ty', '-6px');
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--ty', '0px');
      });
    });

    /* magnetic buttons */
    document.querySelectorAll('.btn-solid,.btn-outline,.submit-btn,.social-btn,.project-link').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px');
        el.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px');
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });

    /* cursor glow */
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; glow.classList.add('on'); });
    document.addEventListener('mouseleave', () => glow.classList.remove('on'));
    (function loop() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      glow.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---- Reveal observer ---- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in');
      if (el.classList.contains('tilt')) {
        const d = parseInt(el.style.getPropertyValue('--d')) || 0;
        setTimeout(() => el.classList.add('ready'), 1000 + d);
      }
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-anim]').forEach(el => io.observe(el));

  /* ---- Scroll progress bar ---- */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      root.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
      ticking = false;
    });
  }, { passive: true });

  /* ---- Active nav link ---- */
  const links = [...document.querySelectorAll('.nav-links a,#mobileMenu a')];
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => navIO.observe(s));
})();
