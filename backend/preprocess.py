"""One-shot preprocessing.

Reads ../public/whiskey_data.csv, runs the same NLTK preprocessing the
Flask backend used to do at startup, and writes ../data/whiskey_index.json
in the same row order. The Next.js /api/predict route consumes this file.

Run once locally (and re-run whenever the source CSV changes):
    cd backend
    python preprocess.py
"""
import json
import os

import nltk
import pandas as pd
from nltk import pos_tag
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

nltk.download("punkt_tab")
nltk.download("wordnet")
nltk.download("averaged_perceptron_tagger_eng")
nltk.download("stopwords")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "whiskey_data.csv")
OUT_DIR = os.path.join(ROOT, "data")
OUT = os.path.join(OUT_DIR, "whiskey_index.json")
OUT_STOPWORDS = os.path.join(OUT_DIR, "stopwords.json")

custom_stop_words = set(stopwords.words("english")).union(
    {"whiskey", "whisky", "bottle", "flavor", "taste"}
)
lemmatizer = WordNetLemmatizer()


def preprocess_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    tokens = word_tokenize(text.lower())
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    tokens = [t for t in tokens if t not in custom_stop_words]
    tagged = pos_tag(tokens)
    keywords = [w for w, tag in tagged if tag in ("NN", "NNS", "JJ", "RB")]
    return " ".join(keywords)


def main() -> None:
    df = pd.read_csv(SRC)
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df["preprocessed_description"] = df["description"].apply(preprocess_text)

    records = []
    for _, row in df.iterrows():
        records.append(
            {
                "name": row.get("name", "") if pd.notna(row.get("name")) else "",
                "category": row.get("category", "") if pd.notna(row.get("category")) else "",
                "rating": row.get("rating", "") if pd.notna(row.get("rating")) else "",
                "price": float(row["price"]) if pd.notna(row["price"]) else None,
                "currency": row.get("currency", "") if pd.notna(row.get("currency")) else "",
                "description": row.get("description", "") if pd.notna(row.get("description")) else "",
                "preprocessed_description": row["preprocessed_description"],
            }
        )

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False)
    print(f"Wrote {len(records)} records to {OUT}")

    with open(OUT_STOPWORDS, "w", encoding="utf-8") as f:
        json.dump(sorted(ENGLISH_STOP_WORDS), f)
    print(f"Wrote {len(ENGLISH_STOP_WORDS)} stopwords to {OUT_STOPWORDS}")


if __name__ == "__main__":
    main()
