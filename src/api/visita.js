// POST /api/visita — una vez por pestaña: visitante único, página de entrada, origen, dispositivo, sistema y país.
import { filtrar, cors, vacio, leerCuerpo, asegurarTablas, diaRD, mesRD, huella, sumarEvento, dispositivo, sistema, origenLegible, limpiar } from "../_lib/comun.js";

export async function visita(req, env) {
  const f = filtrar(req);
  if (f.resp) return f.resp;
  const { origin, host } = f.o;
  const body = await leerCuerpo(req);
  if (!body) return vacio(400, cors(origin));

  const DB = env.DB;
  await asegurarTablas(DB);
  const ip = req.headers.get("CF-Connecting-IP") || "0.0.0.0";
  const ua = req.headers.get("User-Agent") || "";
  const dia = diaRD(), mes = mesRD();
  const [hd, hm] = await Promise.all([huella(`d|${env.STATS_KEY}|${dia}|${ip}`), huella(`m|${env.STATS_KEY}|${mes}|${ip}`)]);

  let ruta = "/";
  try { ruta = new URL(String(body.path || "/"), "https://x").pathname; } catch {}
  ruta = limpiar(ruta) || "/";

  const ins = DB.prepare("INSERT OR IGNORE INTO visitas (dia, host, hd, hm) VALUES (?, ?, ?, ?)");
  const [rHost] = await DB.batch([
    ins.bind(dia, host, hd, hm),
    ins.bind(dia, "*", hd, hm),
    sumarEvento(DB, dia, host, "pagina", ruta),
    sumarEvento(DB, dia, host, "origen", origenLegible(body.ref)),
  ]);

  if (rHost.meta.changes > 0) {
    let pais = String(req.cf?.country || req.headers.get("CF-IPCountry") || "XX").toUpperCase().slice(0, 2);
    if (!/^[A-Z0-9]{2}$/.test(pais)) pais = "XX";
    await DB.batch([
      sumarEvento(DB, dia, host, "disp", dispositivo(ua)),
      sumarEvento(DB, dia, host, "so", sistema(ua)),
      sumarEvento(DB, dia, host, "pais", pais),
    ]);
  }

  if (Math.random() < 0.01) {
    const corte = diaRD(Date.now() - 400 * 86400000);
    await DB.batch([
      DB.prepare("DELETE FROM visitas WHERE dia < ?").bind(corte),
      DB.prepare("DELETE FROM eventos WHERE dia < ?").bind(corte),
    ]);
  }
  return vacio(204, cors(origin));
}
