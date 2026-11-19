// GetComponent Studio Worker: páginas índice + colector privado de analítica (/api/*).
// Todo lo demás se sirve tal cual desde los archivos estáticos (sin redirecciones).
import { visita } from "./api/visita.js";
import { evento } from "./api/evento.js";
import { stats } from "./api/stats.js";

const INDICES = new Set(["/", "/wallsmith/", "/wordconnect/", "/duckswing/", "/estadisticas/"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/visita") return await visita(request, env);
      if (url.pathname === "/api/evento") return await evento(request, env);
      if (url.pathname === "/api/stats") return await stats(request, env);
    } catch (e) {
      console.error("analitica", e);
      return new Response(null, { status: 500, headers: { "Cache-Control": "no-store" } });
    }
    if (url.pathname === "/estadisticas") return Response.redirect(url.origin + "/estadisticas/", 301);
    if (INDICES.has(url.pathname)) url.pathname += "index.html";
    return env.ASSETS.fetch(new Request(url, request));
  },
};
