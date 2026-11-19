// GET /api/stats — lectura privada con "Authorization: Bearer <STATS_KEY>".
import { json, vacio, asegurarTablas, diaRD, DOMINIO } from "../_lib/comun.js";

async function claveValida(req, env) {
  const m = /^Bearer\s+(.+)$/.exec(req.headers.get("Authorization") || "");
  if (!m || !env.STATS_KEY) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(m[1].trim())),
    crypto.subtle.digest("SHA-256", enc.encode(env.STATS_KEY)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

export async function stats(req, env) {
  if (req.method !== "GET") return vacio(405);
  if (!(await claveValida(req, env)))
    return new Response(JSON.stringify({ error: "no autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Robots-Tag": "noindex", "WWW-Authenticate": "Bearer" },
    });

  const DB = env.DB;
  await asegurarTablas(DB);
  const url = new URL(req.url);
  const pedido = (url.searchParams.get("host") || "").toLowerCase();
  const host = pedido && pedido !== "*" ? pedido : "*";
  const hoy = diaRD();
  const desde30 = diaRD(Date.now() - 29 * 86400000);
  const desde12m = diaRD(Date.now() - 400 * 86400000).slice(0, 7) + "-01";

  const evQ = host === "*"
    ? DB.prepare("SELECT dia, host, tipo, valor, n FROM eventos WHERE dia >= ? ORDER BY n DESC LIMIT 8000").bind(desde30)
    : DB.prepare("SELECT dia, host, tipo, valor, n FROM eventos WHERE dia >= ? AND host = ? ORDER BY n DESC LIMIT 8000").bind(desde30, host);

  const [dias, porHost, meses, hosts, eventos] = await DB.batch([
    DB.prepare("SELECT dia, COUNT(*) AS n FROM visitas WHERE host = ? AND dia >= ? GROUP BY dia ORDER BY dia").bind(host, desde30),
    DB.prepare("SELECT dia, host, COUNT(*) AS n FROM visitas WHERE host != '*' AND dia >= ? GROUP BY dia, host ORDER BY dia").bind(desde30),
    DB.prepare("SELECT substr(dia, 1, 7) AS mes, COUNT(DISTINCT hm) AS n FROM visitas WHERE host = ? AND dia >= ? GROUP BY mes ORDER BY mes DESC LIMIT 12").bind(host, desde12m),
    DB.prepare("SELECT DISTINCT host FROM visitas WHERE host != '*' ORDER BY host"),
    evQ,
  ]);

  return json({
    dominio: DOMINIO, hoy, host,
    dias: dias.results, diasPorHost: porHost.results, meses: meses.results,
    hosts: hosts.results.map((r) => r.host), eventos: eventos.results,
  }, {
    // Marca este navegador para no contarlo en ningún subdominio.
    "Set-Cookie": `noContar=1; Domain=.${DOMINIO}; Path=/; Max-Age=315360000; Secure; SameSite=Lax`,
  });
}
