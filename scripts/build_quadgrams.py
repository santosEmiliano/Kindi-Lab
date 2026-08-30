#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import shutil
import sys
import tarfile
import unicodedata
import urllib.request
from array import array
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ALPHABET = "abcdefghijklmnopqrstuvwxyz"
BASE = len(ALPHABET)
ORDER = 4
TABLE_SIZE = BASE**ORDER
FLOOR_RATIO = 0.01

RANK = {char: index for index, char in enumerate(ALPHABET)}

SCRIPT_DIR = Path(__file__).resolve().parent
CACHE_DIR = SCRIPT_DIR / ".cache"
ASSET_DIR = SCRIPT_DIR.parent / "src" / "assets"

LEIPZIG_BASE = "https://downloads.wortschatz-leipzig.de/corpora"
LEIPZIG_LICENSE = "CC BY 4.0 - Leipzig Corpora Collection (wortschatz-leipzig.de)"
DEFAULT_CORPORA = ["spa_news_2023_300K"]


def fold(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text.lower())
    return "".join(char for char in decomposed if char in RANK)


def download(corpus_id: str) -> Path:
    CACHE_DIR.mkdir(exist_ok=True)
    archive = CACHE_DIR / f"{corpus_id}.tar.gz"
    if archive.exists() and archive.stat().st_size > 0:
        return archive
    url = f"{LEIPZIG_BASE}/{corpus_id}.tar.gz"
    print(f"downloading {url}")
    request = urllib.request.Request(url, headers={"User-Agent": "kindi-lab-build/1.0"})
    with urllib.request.urlopen(request) as response, open(archive, "wb") as out:
        shutil.copyfileobj(response, out)
    return archive


def iter_sentences(archive: Path):
    with tarfile.open(archive, "r:gz") as tar:
        member = next(
            (m for m in tar.getmembers() if m.name.endswith("-sentences.txt")), None
        )
        if member is None:
            raise SystemExit(f"no -sentences.txt inside {archive.name}")
        handle = tar.extractfile(member)
        if handle is None:
            raise SystemExit(f"could not read {member.name}")
        for raw in handle:
            line = raw.decode("utf-8", "ignore")
            tab = line.find("\t")
            yield line[tab + 1 :] if tab >= 0 else line


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
            {
                "id": corpus_id,
                "sentences": sentences,
                "url": f"{LEIPZIG_BASE}/{corpus_id}.tar.gz",
            }
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
