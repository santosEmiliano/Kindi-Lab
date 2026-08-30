#!/usr/bin/env python3
from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone

from _leipzig import (
    ALPHABET,
    ASSET_DIR,
    LEIPZIG_LICENSE,
    corpus_url,
    download,
    fold,
    iter_sentences,
)

CORPUS_ID = "spa_news_2023_300K"


def main() -> None:
    counts: Counter[str] = Counter()
    sentences = 0
    for sentence in iter_sentences(download(CORPUS_ID)):
        folded = fold(sentence)
        if not folded:
            continue
        sentences += 1
        counts.update(folded)

    total = sum(counts.values())
    frequencies = {letter: counts[letter] / total for letter in ALPHABET}

    meta = {
        "frequencies": frequencies,
        "totalLetters": total,
        "corpus": {
            "id": CORPUS_ID,
            "url": corpus_url(CORPUS_ID),
            "sentences": sentences,
        },
        "license": LEIPZIG_LICENSE,
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "generator": "scripts/build_letter_freq.py",
    }
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    (ASSET_DIR / "letter-freq-es.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    top = sorted(frequencies.items(), key=lambda item: item[1], reverse=True)[:6]
    print(
        f"wrote 26 letter frequencies from {total} letters; "
        f"top: {', '.join(f'{letter} {value:.3f}' for letter, value in top)}"
    )


if __name__ == "__main__":
    main()
