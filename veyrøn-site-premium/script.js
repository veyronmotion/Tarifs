(() => {
  'use strict';
  const root = document.documentElement;
  const body = document.body;
  body.classList.remove('no-js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile navigation: keyboard and link-friendly.
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#site-menu');
  const closeMenu = () => { if (!toggle || !menu) return; toggle.setAttribute('aria-expanded','false'); menu.classList.remove('is-open'); };
  toggle?.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); menu.classList.toggle('is-open', open); });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // Reveal layers with a graceful visible fallback.
  const revealItems = document.querySelectorAll('[data-reveal], .plan, .step, .review, .media-card, .video-card, .split-card, .faq details');
  if (reduced || !('IntersectionObserver' in window)) revealItems.forEach(el => el.classList.add('is-visible'));
  else {
    revealItems.forEach((el, i) => { el.style.setProperty('--reveal-delay', `${Math.min((i % 6) * 70, 350)}ms`); el.classList.add('will-reveal'); });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), {threshold:.12, rootMargin:'0px 0px -8%'});
    revealItems.forEach(el => observer.observe(el));
  }

  // Hero entrance and restrained background parallax.
  if (!reduced) {
    document.querySelector('.hero')?.classList.add('hero-ready');
    const hero = document.querySelector('.hero');
    let ticking = false;
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(() => { if (hero) hero.style.setProperty('--hero-shift', `${Math.min(window.scrollY * .08, 28)}px`); ticking=false; }); ticking=true; } }, {passive:true});
  }

  // Header state + scrollspy.
  const nav = document.querySelector('.nav');
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const updateNav = () => { nav?.classList.toggle('scrolled', window.scrollY > 24); const y=window.scrollY+130; let current=sections[0]?.id; sections.forEach(s=>{if(s.offsetTop<=y) current=s.id;}); navLinks.forEach(a=>a.classList.toggle('section-active', a.getAttribute('href') === '#'+current)); };
  window.addEventListener('scroll', updateNav, {passive:true}); updateNav();

  // Offer tabs with crossfade.
  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    const scope=tab.closest('#offers'); scope?.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on', t===tab));
    scope?.querySelectorAll('.plans').forEach(p=> { const active=p.dataset.type===tab.dataset.type; p.classList.toggle('hidden',!active); p.classList.toggle('tab-enter',active); });
  }));

  // Before/after sliders, including a single gentle demo sweep.
  document.querySelectorAll('.compare-range').forEach(range => {
    const frame=range.closest('.compare-frame');
    const set=()=>frame.style.setProperty('--position', `${range.value}%`);
    range.addEventListener('input',()=>{ range.dataset.touched='true'; set(); });
    ['pointerdown','focus'].forEach(evt=>range.addEventListener(evt,()=>range.dataset.touched='true'));
  });
  document.querySelectorAll('.compare-tab').forEach(tab => tab.addEventListener('click',()=>{
    const root=tab.closest('.comparison-section'), index=tab.dataset.compare;
    root.querySelectorAll('.compare-tab').forEach(t=>{const on=t===tab;t.classList.toggle('on',on);t.setAttribute('aria-selected',String(on));});
    root.querySelectorAll('.comparison-viewer').forEach(v=>{const on=v.dataset.viewer===index;v.classList.toggle('on',on); if(on && !reduced) setTimeout(()=>v.classList.add('tab-enter'),10);});
  }));
  if (!reduced) {
    const compareRoot = document.querySelector('.comparison-section');
    if (compareRoot) {
      const demoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting || entry.target.dataset.demo === 'done') return;
          const range = compareRoot.querySelector('.comparison-viewer.on .compare-range');
          if (range && !range.dataset.touched) {
            const start = 50, end = 72, t0 = performance.now();
            const go = now => {
              if (range.dataset.touched) return;
              const progress = Math.min((now - t0) / 900, 1);
              range.value = String(Math.round(start + (end - start) * progress));
              range.closest('.compare-frame').style.setProperty('--position', range.value + '%');
              if (progress < 1) requestAnimationFrame(go);
            };
            requestAnimationFrame(go);
          }
          entry.target.dataset.demo = 'done';
        });
      }, {threshold: .35});
      demoObserver.observe(compareRoot);
    }
  }

  // FAQ: native details retained for no-JS; animate height when JS is active.
  document.querySelectorAll('.faq details').forEach(detail=>{ const summary=detail.querySelector('summary'); summary?.addEventListener('click', e=>{e.preventDefault(); const open=!detail.open; if(open){detail.open=true; requestAnimationFrame(()=>detail.classList.add('faq-open'));} else {detail.classList.remove('faq-open'); setTimeout(()=>{detail.open=false},260);} }); });

  document.querySelector('#booking-form')?.addEventListener('submit', e => { e.preventDefault(); const f=new FormData(e.target); const subject=encodeURIComponent(root.lang==='fr'?'Demande de réservation VEYRØN':'VEYRØN booking request'); const body=encodeURIComponent([...f.entries()].map(([k,v])=>`${k}: ${v}`).join('\n')); location.href=`mailto:veyron.motion@gmail.com?subject=${subject}&body=${body}`; });
})();
