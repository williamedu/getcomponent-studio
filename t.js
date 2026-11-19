/* GetComponent Studio · analítica privada, sin cookies de seguimiento.
   Uso: <script src="https://getcomponentstudio.com/t.js" defer></script>
   Clics propios: <button data-evt="Nombre legible">  ·  Eventos: window.edtEvento('abierto', 'Nombre') */
(function () {
  var noop = function () {};
  window.edtEvento = noop;
  try {
    var h = location.hostname;
    if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || location.protocol !== 'https:') return;
    if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
    if (/(?:^|;\s*)noContar=1(?:;|$)/.test(document.cookie)) return;
    try { if (localStorage.getItem('noContar') === '1') return; } catch (e) {}
  } catch (e) { return; }

  var DOM = 'getcomponentstudio.com';
  var src = (document.currentScript && document.currentScript.src) || 'https://' + DOM + '/t.js';
  var API = new URL(src).origin + '/api/';
  var quedan = 80;

  function limpiar(v) { return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60); }
  function enviar(ruta, datos) {
    var cuerpo = JSON.stringify(datos);
    try { if (navigator.sendBeacon && navigator.sendBeacon(API + ruta, new Blob([cuerpo], { type: 'text/plain' }))) return; } catch (e) {}
    try { fetch(API + ruta, { method: 'POST', body: cuerpo, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(noop); } catch (e) {}
  }
  function evento(tipo, valor) {
    valor = limpiar(valor);
    if (!valor || quedan <= 0) return;
    quedan--;
    enviar('evento', { tipo: String(tipo), valor: valor });
  }
  window.edtEvento = evento;

  // Una visita por pestaña y subdominio: ruta de entrada + de dónde llega.
  try {
    if (!sessionStorage.getItem('edtV')) {
      sessionStorage.setItem('edtV', '1');
      enviar('visita', { path: location.pathname, ref: document.referrer || '' });
    }
  } catch (e) { enviar('visita', { path: location.pathname, ref: document.referrer || '' }); }

  var esDom = function (x) { return x === DOM || x.slice(-(DOM.length + 1)) === '.' + DOM; };
  var sub = function (x) { return x === DOM ? 'principal' : x.slice(0, -(DOM.length + 1)); };
  function etiqueta(el) { return limpiar(el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || (el.querySelector('img') && el.querySelector('img').alt) || ''); }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest && e.target.closest('a, button');
    if (!el) return;
    var marca = el.getAttribute('data-evt');
    if (marca) return evento('clic', marca);
    var href = el.getAttribute('href');
    if (!href || el.tagName !== 'A') return;
    var u; try { u = new URL(href, location.href); } catch (x) { return; }
    if (u.protocol === 'mailto:') return evento('clic', 'Correo: ' + u.pathname);
    if (!/^https?:$/.test(u.protocol)) return;
    var d = u.hostname.replace(/^www\./, '');
    if (/apps\.apple\.com$|itunes\.apple\.com$/.test(d)) return evento('clic', 'App Store · ' + etiqueta(el));
    if (/play\.google\.com$/.test(d)) return evento('clic', 'Google Play · ' + etiqueta(el));
    if (/store\.steampowered\.com$/.test(d)) return evento('clic', 'Steam · ' + etiqueta(el));
    if (esDom(u.hostname)) { if (u.hostname !== location.hostname) evento('clic', 'Va a ' + sub(u.hostname)); return; }
    evento('clic', 'Sale a ' + d);
  }, true);

  // Buscador genérico: <input type="search"> o [data-buscar]. Para "sin resultados" el sitio llama edtEvento('busqueda_vacia', texto).
  var t;
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el || !el.matches || !el.matches('input[type="search"], [data-buscar]')) return;
    clearTimeout(t);
    t = setTimeout(function () {
      var q = String(el.value || '').toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim();
      if (q.length >= 3 && q.length <= 40) evento('busqueda', q);
    }, 1500);
  }, true);
})();
