#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import sys
from array import array
from collections import Counter
from datetime import datetime, timezone

from _leipzig import (
    ALPHABET,
    ASSET_DIR,
    LEIPZIG_LICENSE,
    RANK,
    corpus_url,
    download,
    fold,
    iter_sentences,
)

BASE = len(ALPHABET)
ORDER = 4
TABLE_SIZE = BASE**ORDER
FLOOR_RATIO = 0.01
DEFAULT_CORPORA = ["spa_news_2023_300K"]


def quad_index(quad: str) -> int:
    a, b, c, d = (RANK[char] for char in quad)
    return ((a * BASE + b) * BASE + c) * BASE + d


def count_quadgrams(corpora: list[str]):
    counter: Counter[str] = Counter()
    corpora_meta = []
    for corpus_id in corpora:
        archive = download(corpus_id)
        sentences = 0
        for sentence in iter_sentences(archive):
            folded = fold(sentence)
            if len(folded) < ORDER:
                continue
            sentences += 1
            counter.update(
                folded[i : i + ORDER] for i in range(len(folded) - ORDER + 1)
            )
        print(f"  {corpus_id}: {sentences} sentences")
        corpora_meta.append(
            {"id": corpus_id, "sentences": sentences, "url": corpus_url(corpus_id)}
        )
    return counter, corpora_meta


def write_assets(counter: Counter[str], corpora_meta: list[dict]) -> None:
    total = sum(counter.values())
    floor_log10 = math.log10(FLOOR_RATIO / total)

    table = array("f", [floor_log10]) * TABLE_SIZE
    for quad, count in counter.items():
        table[quad_index(quad)] = math.log10(count / total)
    if sys.byteorder != "little":
        table.byteswap()

    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    (ASSET_DIR / "quadgrams-es.bin").write_bytes(table.tobytes())

    meta = {
        "alphabet": ALPHABET,
        "order": ORDER,
        "tableSize": TABLE_SIZE,
        "totalQuadgrams": total,
        "distinctQuadgrams": len(counter),
        "floorLog10": floor_log10,
        "license": LEIPZIG_LICENSE,
        "corpora": corpora_meta,
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "generator": "scripts/build_quadgrams.py",
    }
    (ASSET_DIR / "quadgrams-es.meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n"
    )
    print(
        f"wrote {TABLE_SIZE} entries "
        f"({len(counter)} observed, {total} total, floor {floor_log10:.4f})"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--corpus", action="append", dest="corpora", metavar="ID")
    corpora = parser.parse_args().corpora or DEFAULT_CORPORA

    counter, corpora_meta = count_quadgrams(corpora)
    if not counter:
        raise SystemExit("no quadgrams counted")
    write_assets(counter, corpora_meta)


if __name__ == "__main__":
    main()
