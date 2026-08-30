#!/usr/bin/env python3
from __future__ import annotations

import json
from datetime import datetime, timezone

from _leipzig import (
    ASSET_DIR,
    LEIPZIG_LICENSE,
    REPO_DIR,
    corpus_url,
    download,
    fold,
    iter_words,
)

CORPUS_ID = "spa_news_2023_300K"
MIN_CORPUS_FREQ = 2
MIN_LENGTH = 2

PACKAGE = "an-array-of-spanish-words"
PACKAGE_LICENSE = "MIT - an-array-of-spanish-words (github.com/words/an-array-of-spanish-words)"
PACKAGE_JSON = REPO_DIR / "node_modules" / PACKAGE / "index.json"


def corpus_frequencies(corpus_id: str) -> dict[str, int]:
    frequencies: dict[str, int] = {}
    for word, count in iter_words(download(corpus_id)):
        folded = fold(word)
        if folded:
            frequencies[folded] = frequencies.get(folded, 0) + count
    return frequencies


def load_vocabulary() -> list[str]:
    if not PACKAGE_JSON.exists():
        raise SystemExit(f"missing {PACKAGE_JSON}; run: pnpm add -D {PACKAGE}")
    return json.loads(PACKAGE_JSON.read_text(encoding="utf-8"))


def main() -> None:
    frequencies = corpus_frequencies(CORPUS_ID)

    kept: set[str] = set()
    for word in load_vocabulary():
        folded = fold(word)
        if len(folded) < MIN_LENGTH:
            continue
        if frequencies.get(folded, 0) >= MIN_CORPUS_FREQ:
            kept.add(folded)

    words = sorted(kept)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    (ASSET_DIR / "words-es.txt").write_text(
        "\n".join(words) + "\n", encoding="utf-8"
    )

    meta = {
        "count": len(words),
        "minCorpusFrequency": MIN_CORPUS_FREQ,
        "minLength": MIN_LENGTH,
        "folding": "lowercase, NFD, drop non a-z",
        "sources": [
            {"name": PACKAGE, "role": "vocabulary", "license": PACKAGE_LICENSE},
            {
                "name": CORPUS_ID,
                "role": "frequency filter",
                "url": corpus_url(CORPUS_ID),
                "license": LEIPZIG_LICENSE,
            },
        ],
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "generator": "scripts/build_dictionary.py",
    }
    (ASSET_DIR / "words-es.meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(
        f"wrote {len(words)} words "
        f"(vocabulary filtered to corpus freq >= {MIN_CORPUS_FREQ})"
    )


if __name__ == "__main__":
    main()
