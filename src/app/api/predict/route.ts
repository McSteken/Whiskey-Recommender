import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getStopwords, topKSimilar } from "./tfidf";

export const runtime = "nodejs";

interface IndexRow {
  name: string;
  category: string;
  rating: string | number;
  price: number | null;
  currency: string;
  description: string;
  preprocessed_description: string;
}

let cachedIndex: IndexRow[] | null = null;

function getIndex(): IndexRow[] {
  if (cachedIndex) return cachedIndex;
  const p = path.join(process.cwd(), "data", "whiskey_index.json");
  cachedIndex = JSON.parse(fs.readFileSync(p, "utf-8")) as IndexRow[];
  return cachedIndex;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const index: number = body.index;
    const maxPrice: number =
      typeof body.maxPrice === "number" && isFinite(body.maxPrice)
        ? body.maxPrice
        : Number.MAX_SAFE_INTEGER;

    const data = getIndex();
    if (typeof index !== "number" || index < 0 || index >= data.length) {
      return NextResponse.json({ error: "Index out of bounds" }, { status: 400 });
    }

    const original = data[index];

    const filtered: { row: IndexRow; originalIdx: number }[] = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row.price !== null && row.price <= maxPrice) {
        filtered.push({ row, originalIdx: i });
      }
    }

    if (filtered.length === 0) {
      return NextResponse.json([]);
    }

    const docs = filtered.map((f) => f.row.preprocessed_description ?? "");
    const stopwords = getStopwords();

    const top = topKSimilar(
      docs,
      original.preprocessed_description ?? "",
      filtered.length,
      stopwords,
    );

    const results = [];
    for (const { index: i, score } of top) {
      const candidate = filtered[i].row;
      if (candidate.name === original.name) continue;
      results.push({ ...candidate, similarity_score: score });
      if (results.length >= 10) break;
    }

    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
