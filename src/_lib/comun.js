// Utilidades compartidas del colector de analítica.
export const DOMINIO = "getcomponentstudio.com";
const ZONA_MS = -4 * 3600 * 1000; // República Dominicana, UTC-4 todo el año

export const diaRD = (t = Date.now()) => new Date(t + ZONA_MS).toISOString().slice(0, 10);
export const mesRD = (t = Date.now()) => diaRD(t).slice(0, 7);

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|curl|wget|python|node-fetch|axios|go-http|java\/|okhttp|libwww|httpclient|scrapy|phantom|puppeteer|playwright|selenium|facebookexternalhit|embedly|monitor|uptime|pingdom|validator/i;
export const esBot = (ua) => !ua || BOT.test(ua);

export function origenPermitido(origin) {
  if (!origin) return null;
  try {
    const u = new URL(origin);
    if (u.protocol !== "https:") return null;
    const h = u.hostname;
    if (h === DOMINIO || h.endsWith("." + DOMINIO)) return { origin: u.origin, host: h };
  } catch {}
  return null;
}

export function cors(origin) {
  return origin ? { "Access-Control-Allow-Origin": origin, "Vary": "Origin" } : { "Vary": "Origin" };
}

export const vacio = (status, extra = {}) =>
  new Response(null, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex", ...extra } });

export const json = (data, extra = {}) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex", ...extra },
  });

export const tieneNoContar = (req) => /(?:^|;\s*)noContar=1(?:;|$)/.test(req.headers.get("Cookie") || "");

export function limpiar(v, max = 60) {
  return String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);
}

export async function huella(texto) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(buf).slice(0, 12)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function leerCuerpo(req) {
  const t = await req.text();
  if (t.length > 4000) return null;
  try { const o = JSON.parse(t); return o && typeof o === "object" ? o : null; } catch { return null; }
}

let tablasListas = false;
export async function asegurarTablas(DB) {
  if (tablasListas) return;
  await DB.batch([
    DB.prepare("CREATE TABLE IF NOT EXISTS visitas (dia TEXT NOT NULL, host TEXT NOT NULL, hd TEXT NOT NULL, hm TEXT NOT NULL, PRIMARY KEY (dia, host, hd))"),
    DB.prepare("CREATE TABLE IF NOT EXISTS eventos (dia TEXT NOT NULL, host TEXT NOT NULL, tipo TEXT NOT NULL, valor TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (dia, host, tipo, valor))"),
  ]);
  tablasListas = true;
}

export const sumarEvento = (DB, dia, host, tipo, valor) =>
  DB.prepare("INSERT INTO eventos (dia, host, tipo, valor, n) VALUES (?, ?, ?, ?, 1) ON CONFLICT (dia, host, tipo, valor) DO UPDATE SET n = n + 1")
    .bind(dia, host, tipo, valor);

// Filtro común para /api/visita y /api/evento. Devuelve {resp} para cortar, o {o} con el origen válido.
export function filtrar(req) {
  const o = origenPermitido(req.headers.get("Origin"));
  if (req.method === "OPTIONS") return { resp: vacio(204, { ...cors(o?.origin), "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" }) };
  if (!o) return { resp: vacio(403) };
  if (req.method !== "POST") return { resp: vacio(405, cors(o.origin)) };
  if (esBot(req.headers.get("User-Agent")) || tieneNoContar(req)) return { resp: vacio(204, cors(o.origin)) };
  return { o };
}

export function dispositivo(ua) {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "Tableta";
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua)) return "Celular";
  return "Computadora";
}

export function sistema(ua) {
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iPhone-iPad";
  if (/CrOS/i.test(ua)) return "ChromeOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh|Mac OS X/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return "Otro";
}

const FUENTES = [
  [/(^|\.)google\./, "Google"], [/(^|\.)bing\.com$/, "Bing"], [/(^|\.)yahoo\./, "Yahoo"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"], [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, "Facebook"],
  [/(^|\.)instagram\.com$/, "Instagram"], [/(^|\.)(x\.com|twitter\.com|t\.co)$/, "X (Twitter)"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"], [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"], [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)(chatgpt\.com|openai\.com)$/, "ChatGPT"],
];

export const nombreSub = (h) => (h === DOMINIO ? "principal" : h.slice(0, -(DOMINIO.length + 1)));

export function origenLegible(ref) {
  let h = "";
  try { h = ref ? new URL(ref).hostname.toLowerCase() : ""; } catch {}
  if (!h) return "Directo / app / WhatsApp";
  if (h === DOMINIO || h.endsWith("." + DOMINIO)) return `Dentro de getcomponentstudio (${nombreSub(h)})`;
  for (const [re, n] of FUENTES) if (re.test(h)) return n;
  return limpiar(h.replace(/^www\./, ""));
}
