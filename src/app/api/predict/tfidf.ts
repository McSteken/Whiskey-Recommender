import fs from "node:fs";
import path from "node:path";

const TOKEN_RE = /[a-zA-Z]{2,}/g;

let cachedStopwords: Set<string> | null = null;

export function getStopwords(): Set<string> {
  if (cachedStopwords) return cachedStopwords;
  const p = path.join(process.cwd(), "data", "stopwords.json");
  const arr = JSON.parse(fs.readFileSync(p, "utf-8")) as string[];
  cachedStopwords = new Set(arr);
  return cachedStopwords;
}

export function tokenize(text: string, stopwords: Set<string>): string[] {
  const out: string[] = [];
  const matches = text.toLowerCase().match(TOKEN_RE);
  if (!matches) return out;
  for (const t of matches) {
    if (!stopwords.has(t)) out.push(t);
  }
  return out;
}

export interface SimilarityResult {
  index: number;
  score: number;
}

export function topKSimilar(
  docs: string[],
  queryDoc: string,
  k: number,
  stopwords: Set<string>,
): SimilarityResult[] {
  const tokenized = docs.map((d) => tokenize(d, stopwords));
  const queryTokens = tokenize(queryDoc, stopwords);

  const df = new Map<string, number>();
  for (const tokens of tokenized) {
    const seen = new Set<string>();
    for (const t of tokens) {
      if (!seen.has(t)) {
        seen.add(t);
        df.set(t, (df.get(t) ?? 0) + 1);
      }
    }
  }

  const n = docs.length;
  const idf = new Map<string, number>();
  for (const [term, freq] of df.entries()) {
    idf.set(term, Math.log((1 + n) / (1 + freq)) + 1);
  }

  const vectorize = (tokens: string[]): Map<string, number> => {
    const tf = new Map<string, number>();
    for (const t of tokens) {
      const w = idf.get(t);
      if (w === undefined) continue;
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }
    let sumSq = 0;
    const vec = new Map<string, number>();
    for (const [term, count] of tf.entries()) {
      const v = count * (idf.get(term) as number);
      vec.set(term, v);
      sumSq += v * v;
    }
    const norm = Math.sqrt(sumSq);
    if (norm > 0) {
      for (const [term, v] of vec.entries()) vec.set(term, v / norm);
    }
    return vec;
  };

  const queryVec = vectorize(queryTokens);

  const results: SimilarityResult[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const docVec = vectorize(tokenized[i]);
    let dot = 0;
    const [smaller, larger] =
      queryVec.size < docVec.size ? [queryVec, docVec] : [docVec, queryVec];
    for (const [term, v] of smaller.entries()) {
      const u = larger.get(term);
      if (u !== undefined) dot += v * u;
    }
    results[i] = { index: i, score: dot };
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, k);
}
