import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { oracleRouter } from './routes/oracle.js';
import { loadOracle } from './lib/oracle.js';
import { errorHandler } from './middleware/error.js';

const app = express();

const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? '*')
  .split(',')
  .map(s => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || CORS_ORIGINS.includes('*') || CORS_ORIGINS.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(morgan('tiny'));
app.use(express.json({ limit: '256kb' }));

// Healthcheck
app.get('/health', (_req, res) => {
  try {
    loadOracle(false);
    res.json({ status: 'ok' });
  } catch {
    res.status(500).json({ status: 'error' });
  }
});

// Routes
app.use('/oracle', oracleRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[oracle] listening on port ${PORT}`);
});
app.get('/', (_req, res) => {
  res.json({
    message: 'Oracle ativo. Use /health, /oracle, /oracle/search?q= ou /oracle/<path>'
  });
});
