-- GetComponent Studio · analítica privada (Cloudflare D1)
CREATE TABLE IF NOT EXISTS visitas (
  dia  TEXT NOT NULL,   -- AAAA-MM-DD, hora de República Dominicana (UTC-4)
  host TEXT NOT NULL,   -- subdominio; '*' = huella global de todo el dominio
  hd   TEXT NOT NULL,   -- huella diaria (SHA-256 truncado, irreversible)
  hm   TEXT NOT NULL,   -- huella mensual
  PRIMARY KEY (dia, host, hd)
);
CREATE TABLE IF NOT EXISTS eventos (
  dia   TEXT NOT NULL,
  host  TEXT NOT NULL,
  tipo  TEXT NOT NULL,
  valor TEXT NOT NULL,
  n     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (dia, host, tipo, valor)
);
