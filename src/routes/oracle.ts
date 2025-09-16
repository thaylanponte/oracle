import { Router } from 'express';
import { loadOracle, getByPath } from '../lib/oracle.js';
import { searchOracle } from '../lib/search.js';

export const oracleRouter = Router();

// GET /oracle -> retorna o JSON completo
oracleRouter.get('/', (_req, res) => {
  const data = loadOracle();
  res.json(data);
});

// GET /oracle/search?q=termo
oracleRouter.get('/search', (req, res) => {
  const q = String(req.query.q ?? '').trim();
  const limit = Number(req.query.limit ?? 25);
  const data = loadOracle();
  const result = searchOracle(data, q, isNaN(limit) ? 25 : limit);
  res.json(result);
});

// GET /oracle/<chave1>/<chave2>/... -> navega no JSON
oracleRouter.get('/*', (req, res) => {
  const path = req.params[0]
    .split('/')
    .filter(Boolean);

  const data = loadOracle();
  const value = getByPath(data, path);

  if (value === undefined) {
    return res.status(404).json({
      error: 'Path not found',
      path
    });
  }
  res.json({ path, value });
});
