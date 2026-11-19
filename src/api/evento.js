// POST /api/evento — clics, lo que abren y búsquedas. Suma 1 al total del día.
import { filtrar, cors, vacio, leerCuerpo, asegurarTablas, diaRD, sumarEvento, limpiar } from "../_lib/comun.js";

const TIPOS = new Set(["clic", "abierto", "busqueda", "busqueda_vacia"]);

export async function evento(req, env) {
  const f = filtrar(req);
  if (f.resp) return f.resp;
  const { origin, host } = f.o;
  const body = await leerCuerpo(req);
  const tipo = body && String(body.tipo || "");
  let valor = body && limpiar(body.valor);
  if (!body || !TIPOS.has(tipo) || !valor) return vacio(400, cors(origin));
  if (tipo.startsWith("busqueda")) {
    valor = valor.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim();
    if (valor.length < 3 || valor.length > 40) return vacio(400, cors(origin));
  }
  await asegurarTablas(env.DB);
  await sumarEvento(env.DB, diaRD(), host, tipo, valor).run();
  return vacio(204, cors(origin));
}
