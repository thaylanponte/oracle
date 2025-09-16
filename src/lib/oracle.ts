import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Oracle } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, '../../data/oracle.json');

let cache: Oracle | null = null;
let lastLoaded = 0;

export function loadOracle(force = false): Oracle {
  const now = Date.now();
  if (!force && cache && now - lastLoaded < 60_000) return cache; // 60s cache

  const raw = fs.readFileSync(dataPath, 'utf-8');
  const json = JSON.parse(raw) as Oracle;
  cache = json;
  lastLoaded = now;
  return json;
}

export function getByPath(obj: unknown, segments: string[]): unknown {
  let cur: any = obj;
  for (const seg of segments) {
    if (cur == null || typeof cur !== 'object') return undefined;
    if (!(seg in cur)) return undefined;
    cur = cur[seg];
  }
  return cur;
}
