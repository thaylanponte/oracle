// Busca simples com ranking: pontua matches em chaves, caminhos e valores.
type Hit = {
  path: string[];
  key: string;
  value: unknown;
  score: number;
};

function norm(s: string) {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function searchOracle(root: unknown, query: string, limit = 25) {
  const q = norm(query).trim();
  if (!q) return { query, total: 0, results: [] as Hit[] };

  const results: Hit[] = [];

  function walk(node: unknown, path: string[]) {
    if (node && typeof node === 'object') {
      if (Array.isArray(node)) {
        node.forEach((v, i) => walk(v, path.concat(String(i))));
        return;
      }
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        const keyNorm = norm(k);
        let score = 0;
        if (keyNorm.includes(q)) score += 5;

        // Path weight
        const pathStr = norm(path.concat(k).join('.'));
        if (pathStr.includes(q)) score += 3;

        // Value weight
        if (typeof v === 'string') {
          const valNorm = norm(v);
          if (valNorm.includes(q)) score += 4;
        } else if (typeof v === 'number') {
          if (String(v).includes(q)) score += 2;
        } else if (typeof v === 'object' && v !== null) {
          // shallow stringification hint
          const hint = norm(JSON.stringify(v).slice(0, 400));
          if (hint.includes(q)) score += 1;
        }

        if (score > 0) {
          results.push({ path, key: k, value: v, score });
        }
        walk(v, path.concat(k));
      }
    }
  }

  walk(root, []);
  results.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));

  return {
    query,
    total: results.length,
    results: results.slice(0, limit).map(r => ({
      path: r.path.concat(r.key),
      score: r.score,
      preview:
        typeof r.value === 'string' || typeof r.value === 'number'
          ? r.value
          : Array.isArray(r.value)
          ? `[array ${r.value.length}]`
          : r.value && typeof r.value === 'object'
          ? '{object}'
          : r.value
    }))
  };
}
