// GetComponent Studio — landing interactions
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- i18n: Spanish lives in the HTML, English here ---------- */
  const en = {
    'nav.games': 'Games', 'nav.mobile': 'Mobile', 'nav.apps': 'Apps', 'nav.studio': 'Studio', 'nav.contact': 'Contact',
    'hero.eyebrow': 'Independent game studio',
    'hero.t1': 'We simulate reality.', 'hero.t2': 'We invent worlds.',
    'hero.lead': 'From an airport control tower to a kingdom swallowed by fog. We make video games and simulators for PC and mobile.',
    'hero.cta1': 'See the games', 'hero.cta2': 'Play the demo on Steam',
    'stats.pc': 'PC games in development', 'stats.mobile': 'mobile games', 'stats.apps': 'published apps', 'stats.langs': 'languages',
    'games.eyebrow': 'In development · Steam', 'games.title': 'Two worlds. One studio.',
    'ats.tag': 'SIMULATOR · IN DEVELOPMENT',
    'ats.lead': 'Take over the tower. Clear takeoffs, sequence landings and keep every flight safe using real air traffic control procedures.',
    'ats.f1': 'levels built on real-life situations', 'ats.f2': 'real controller procedures', 'ats.f3': 'badges for every perfect level', 'ats.f4': 'radio failures, emergencies and threats',
    'cta.wishlist': 'Add to your wishlist', 'cta.demo': 'Play the free demo',
    'kok.tag': 'Action RPG · Demo available',
    'kok.lead': 'A thick fog covered the village and brought creatures that spread chaos. Explore, fight and find out where it comes from. The fog is only the beginning.',
    'kok.f1t': 'Tense combat', 'kok.f1': 'Over-the-shoulder camera where every hit matters.',
    'kok.f2t': 'Unique bosses', 'kok.f2': 'Fights with their own mechanics.',
    'kok.f3t': 'Explore and solve', 'kok.f3': 'Puzzles, inventory and secrets.',
    'kok.f4t': 'Environmental story', 'kok.f4': 'The world tells you what happened.',
    'mob.eyebrow': 'Mobile games · iOS and Android', 'mob.title': 'Short sessions. One more round.',
    'wall.tag': 'Coming soon', 'wall.more': 'See the game →',
    'wall.lead': 'Turn-based strategy in pixel art. Reach the goal first and slow your rival down with walls, but you can never close off their whole path.',
    'wall.c1': '10 campaign levels', 'wall.c2': '5 game modes', 'wall.c3': 'Boss: the Golem', 'wall.c4': 'Up to 4 players',
    'duck.sub': 'One-tap arcade',
    'duck.text': 'Your duck swings like a pendulum. Tap to let go, fly and land on the platform. Chain perfect landings.',
    'word.sub': 'Word puzzle · 11 languages',
    'word.text': '16 words, 4 hidden groups. Find what links them before you run out of tries. New levels every day.',
    'apps.eyebrow': 'Beyond games', 'apps.title': 'We also build useful apps.',
    'kero.sub': 'Income and expense tracker',
    'kero.text': 'Track your money without friction and see where it goes each month. Personal finance made simple.',
    'ede.sub': 'Power outages in the Dominican Republic',
    'ede.text': 'Scheduled outages from Edeeste, Edesur and Edenorte in one app, with alerts before each one.',
    'studio.eyebrow': 'The studio', 'studio.title': 'A small team with big games in mind.',
    'studio.p1': 'GetComponent Studio is an independent studio founded by William Hiciano. We started out building real-life simulators and today we make everything from a control tower to a dark fantasy kingdom.',
    'studio.p2': 'We like games you understand in seconds and master over weeks. We design, code and publish every title ourselves.',
    'studio.v1t': 'Realism', 'studio.v1': 'Simulators based on real procedures.',
    'studio.v2t': 'Original worlds', 'studio.v2': 'Stories and universes of our own.',
    'studio.v3t': 'For everyone', 'studio.v3': 'Games translated into up to 11 languages.',
    'contact.title': "Let's talk", 'contact.lead': 'Press, collaborations, publishing or just to say hi.',
    'footer.rights': 'All trademarks belong to their owners.',
    'footer.privacy': 'Privacy Policy', 'footer.terms': 'Terms of Service', 'footer.sale': 'Terms of Sale', 'footer.delete': 'Delete my data',
    'pad.sub': 'Your office that posts for you · PC (Windows)',
    'pad.text': 'A pixel-art office that works on your social media for you. Its staff cut your long videos into clips, add subtitles, write titles and descriptions, and publish them on YouTube, Instagram and TikTok at the time you choose. They can also reply to people who comment on your videos. Everything runs on your PC and nothing is published without your approval.',
    'pad.more': 'Learn more →', 'pad.privacy': 'Privacy Policy →', 'pad.terms': 'Terms →',
  };
  const nodes = $$('[data-i18n]');
  const es = Object.fromEntries(nodes.map(n => [n.dataset.i18n, n.textContent]));
  const setLang = (lang) => {
    const dict = lang === 'en' ? en : es;
    nodes.forEach(n => { if (dict[n.dataset.i18n]) n.textContent = dict[n.dataset.i18n]; });
    document.documentElement.lang = lang;
    $$('#lang span').forEach(s => s.classList.toggle('on', s.textContent.toLowerCase() === lang));
    try { localStorage.setItem('lang', lang); } catch {}
  };
  let lang = 'es';
  try { lang = localStorage.getItem('lang') || (navigator.language.startsWith('es') ? 'es' : 'en'); } catch {}
  if (lang !== 'es') setLang(lang);
  $('#lang').addEventListener('click', () => { lang = lang === 'es' ? 'en' : 'es'; setLang(lang); });

  /* ---------- nav ---------- */
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const toggleMenu = (open) => { links.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
  burger.addEventListener('click', () => toggleMenu(!links.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.tagName === 'A') toggleMenu(false); });

  /* ---------- hero video crossfade ---------- */
  const vids = $$('.hero__media video'), names = ['The Knight of The Kingdom', 'Americas Tower Simulator'];
  if (vids.length > 1 && !reduced) {
    let cur = 0;
    setInterval(() => {
      const next = (cur + 1) % vids.length;
      vids[next].play().catch(() => {});
      vids[next].classList.add('on'); vids[cur].classList.remove('on');
      const old = vids[cur]; setTimeout(() => old.pause(), 1500);
      cur = next; $('#nowPlaying').textContent = names[cur];
    }, 9000);
  }

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('img', lb);
  $$('.shot').forEach(b => b.addEventListener('click', () => { lbImg.src = b.dataset.full; lb.hidden = false; }));
  const closeLb = () => { lb.hidden = true; lbImg.removeAttribute('src'); };
  lb.addEventListener('click', closeLb);
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeLb(); toggleMenu(false); } });

  $('#year').textContent = new Date().getFullYear();

  /* ---------- motion (GSAP). Content stays visible if GSAP fails to load ---------- */
  if (reduced || !window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.to('.hero__media', { yPercent: 14, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  $$('.reveal').forEach(el => gsap.from(el, {
    y: 46, opacity: 0, duration: .9, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
  }));

  $$('.game__bg').forEach(bg => gsap.fromTo(bg, { yPercent: -8 }, {
    yPercent: 8, ease: 'none', scrollTrigger: { trigger: bg.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
  }));

  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  // screenshots tilt toward the pointer
  $$('.shot--main').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { rotateY: ((e.clientX - r.left) / r.width - .5) * 8, rotateX: -((e.clientY - r.top) / r.height - .5) * 8, transformPerspective: 900, duration: .4 });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: .6 }));
  });
})();
