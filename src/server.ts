import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { OracleStore } from "./lib/oracle.js";

const PORT = Number(process.env.PORT ?? 3009);
const ORACLE_JSON_PATH = process.env.ORACLE_JSON_PATH ?? "./data/oracle.json";
const ORACLE_ADMIN_TOKEN = process.env.ORACLE_ADMIN_TOKEN ?? "";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

const app = express();
app.use(
  cors({
    origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(",").map(s => s.trim()),
    credentials: false
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

const store = new OracleStore(ORACLE_JSON_PATH);

/** Rota raiz opcional – evita 404 no "/" */
app.get("/", (_req, res) => {
  res.type("html").send(`
    <meta charset="utf-8"/>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;padding:24px;line-height:1.5}
      code{background:#f4f4f5;padding:2px 6px;border-radius:6px}
      a{color:#2563eb;text-decoration:none}
    </style>
    <h1>Oracle API</h1>
    <p>Servidor online. Endpoints úteis:</p>
    <ul>
      <li><a href="/health">GET /health</a></li>
      <li><a href="/oracle">GET /oracle</a></li>
      <li><a href="/oracle/search?q=ciss">GET /oracle/search?q=TERMO</a></li>
      <li><a href="/oracle/sistemas/CISSPoder/regras_custo">GET /oracle/&lt;caminho&gt;</a></li>
    </ul>
    <p>Carregando de: <code>${ORACLE_JSON_PATH}</code></p>
  `);
});

// Healthcheck
app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Retorna tudo (com loadedAt)
app.get("/oracle", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(store.all());
});

// Busca simples via query (?q=termo)
app.get("/oracle/search", (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) return res.status(400).json({ error: "Parâmetro q é obrigatório" });
  const result = store.find(q);
  res.setHeader("Cache-Control", "no-store");
  res.json({ q, ...result });
});

// Caminho hierárquico: /oracle/sistemas/CISSPoder/regras_custo
app.get("/oracle/*", (req, res) => {
  const path = (req.params[0] ?? "")
    .split("/")
    .map(s => s.trim())
    .filter(Boolean);
  const node = store.getByPath(path);
  if (typeof node === "undefined") {
    return res.status(404).json({ error: "Caminho não encontrado", path });
  }
  res.setHeader("Cache-Control", "public, max-age=60");
  res.json(node);
});

// Reload do arquivo em disco (proteja com token)
app.post("/admin/reload", (req, res) => {
  const token = req.header("x-admin-token") ?? "";
  if (!ORACLE_ADMIN_TOKEN || token !== ORACLE_ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const result = store.reload();
  res.json({ ...result, file: ORACLE_JSON_PATH });
});

app.listen(PORT, () => {
  console.log(`Oracle API rodando em http://localhost:${PORT}`);
});
