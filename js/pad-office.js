// Pixel Agent Department: agentes pixel art animados encima de la captura de la oficina.
// Coordenadas en píxeles de la captura (1280×630); los sprites son hojas de 4 cuadros × 8 filas de 32 px.
(() => {
  const stage = document.getElementById('padStage');
  if (!stage) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 1280, H = 630, SPR = 'assets/apps/pad-sprites/';
  const DIRS = { down: 0, left: 1, right: 2, up: 3 };
  const lang = () => (document.documentElement.lang || 'es').startsWith('en') ? 'en' : 'es';

  const TXT = {
    es: {
      worker: ['¡Manejamos tus redes sociales!', 'Cortamos tus videos en clips', 'Publicamos en YouTube, Instagram y TikTok', 'Nada se publica sin tu aprobación'],
      boss: '¡Hay trabajo que hacer! ¡Tú, holgazán, a trabajar!',
      reply: '¡Ya voy, jefe!',
    },
    en: {
      worker: ['We can manage your social media!', 'We cut your videos into clips', 'We post on YouTube, Instagram and TikTok', 'Nothing goes live without your OK'],
      boss: "There's work to do! You, slacker, get to work!",
      reply: 'On it, boss!',
    },
  };

  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  stage.appendChild(layer);

  const actors = [];
  const actor = (sheet, x, y, dir = 'down') => {
    const el = document.createElement('div');
    el.className = 'pad-actor';
    el.style.backgroundImage = `url(${SPR}${sheet}.png)`;
    const bubble = document.createElement('div');
    bubble.className = 'pad-bubble';
    el.appendChild(bubble);
    layer.appendChild(el);
    const a = { el, bubble, x, y, dir, path: [], speed: 150, t: Math.random() * 4, done: null, gone: false };
    actors.push(a);
    draw(a);
    return a;
  };

  function draw(a) {
    const walking = a.path.length > 0;
    const fps = walking ? 8 : 4;
    const col = reduced ? 0 : Math.floor(a.t * fps) % 4;
    const row = (walking ? 4 : 0) + DIRS[a.dir];
    a.el.style.backgroundPosition = `${col * 100 / 3}% ${row * 100 / 7}%`;
    a.el.style.left = `${a.x / W * 100}%`;
    a.el.style.top = `${a.y / H * 100}%`;
    a.el.style.zIndex = Math.round(a.y);
  }

  const say = (a, text, ms, boss) => new Promise(res => {
    a.bubble.textContent = text;
    a.bubble.classList.toggle('pad-bubble--boss', !!boss);
    a.bubble.classList.add('on');
    if (ms) setTimeout(() => { a.bubble.classList.remove('on'); res(); }, ms); else res();
  });

  // Camina por una lista de puntos [x, y]; resuelve al llegar al último.
  const walk = (a, points, speed = 150) => new Promise(res => { a.path = points.slice(); a.speed = speed; a.done = res; });
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // El empleado que ya estaba: idle y cuadro de diálogo con mensajes que se van turnando.
  const worker = actor('worker', 860, 330, 'down');
  let workerMsg = 0, workerTalking = true;
  const workerLoop = async () => {
    while (true) {
      if (workerTalking) await say(worker, TXT[lang()].worker[workerMsg++ % TXT.es.worker.length], 3600);
      await wait(900);
    }
  };

  if (reduced) { say(worker, TXT[lang()].worker[0]); return; }

  let last = 0, visible = false, running = false;
  const tick = now => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    for (const a of actors) {
      if (a.gone) continue;
      a.t += dt;
      if (a.path.length) {
        const [tx, ty] = a.path[0];
        const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy), step = a.speed * dt;
        if (Math.abs(dx) > Math.abs(dy)) a.dir = dx > 0 ? 'right' : 'left'; else if (d) a.dir = dy > 0 ? 'down' : 'up';
        if (d <= step) { a.x = tx; a.y = ty; a.path.shift(); if (!a.path.length && a.done) { const r = a.done; a.done = null; r(); } }
        else { a.x += dx / d * step; a.y += dy / d * step; }
      }
      draw(a);
    }
    if (visible) requestAnimationFrame(tick); else running = false;
  };

  // Rutas: entran por la puerta de vidrio y salen por arriba a la izquierda o por la derecha.
  const DOOR = [[675, 700], [675, 430]];
  const ROUTES = [
    [...DOOR, [380, 430], [380, -60]],
    [...DOOR, [1000, 430], [1000, 120], [1360, 120]],
  ];
  const SHEETS = ['agent-purple', 'agent-teal', 'agent-green', 'agent-yellow'];
  const sendAgent = async (i, speed = 170) => {
    const a = actor(SHEETS[i % SHEETS.length], 675, 700, 'up');
    await walk(a, ROUTES[i % ROUTES.length], speed + Math.random() * 40);
    a.gone = true; a.el.remove(); actors.splice(actors.indexOf(a), 1);
  };

  const scene = async () => {
    // Llega el jefe y regaña al holgazán.
    const boss = actor('boss', 675, 700, 'up');
    await walk(boss, [[675, 440], [560, 440]], 140);
    boss.dir = 'right';
    workerTalking = false; worker.bubble.classList.remove('on');
    worker.dir = 'left';
    await say(boss, TXT[lang()].boss, 3400, true);
    await say(worker, TXT[lang()].reply, 1800);
    worker.dir = 'down'; workerTalking = true;
    // Los agentes entran corriendo a trabajar.
    for (let i = 0; i < 4; i++) { sendAgent(i, 200); await wait(800); }
    await wait(2500);
    await walk(boss, [[675, 440], [675, 700]], 140);
    boss.gone = true; boss.el.remove(); actors.splice(actors.indexOf(boss), 1);
    // Después, de vez en cuando pasa alguien.
    let n = 0;
    while (true) { await wait(5000 + Math.random() * 4000); if (visible) sendAgent(n++); }
  };

  let started = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (!visible) return;
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
    if (!started) { started = true; workerLoop(); setTimeout(scene, 700); }
  }, { threshold: 0.35 }).observe(stage);
})();
