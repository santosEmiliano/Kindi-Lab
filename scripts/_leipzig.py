from __future__ import annotations

import shutil
import tarfile
import unicodedata
import urllib.request
from pathlib import Path

ALPHABET = "abcdefghijklmnopqrstuvwxyz"
RANK = {char: index for index, char in enumerate(ALPHABET)}

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_DIR = SCRIPT_DIR.parent
CACHE_DIR = SCRIPT_DIR / ".cache"
ASSET_DIR = REPO_DIR / "src" / "assets"

LEIPZIG_BASE = "https://downloads.wortschatz-leipzig.de/corpora"
LEIPZIG_LICENSE = "CC BY 4.0 - Leipzig Corpora Collection (wortschatz-leipzig.de)"


def fold(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text.lower())
    return "".join(char for char in decomposed if char in RANK)


def corpus_url(corpus_id: str) -> str:
    return f"{LEIPZIG_BASE}/{corpus_id}.tar.gz"


def download(corpus_id: str) -> Path:
    CACHE_DIR.mkdir(exist_ok=True)
    archive = CACHE_DIR / f"{corpus_id}.tar.gz"
    if archive.exists() and archive.stat().st_size > 0:
        return archive
    url = corpus_url(corpus_id)
    print(f"downloading {url}")
    request = urllib.request.Request(url, headers={"User-Agent": "kindi-lab-build/1.0"})
    with urllib.request.urlopen(request) as response, open(archive, "wb") as out:
        shutil.copyfileobj(response, out)
    return archive


def _open_member(tar: tarfile.TarFile, archive: Path, suffix: str):
    member = next((m for m in tar.getmembers() if m.name.endswith(suffix)), None)
    if member is None:
        raise SystemExit(f"no {suffix} inside {archive.name}")
    handle = tar.extractfile(member)
    if handle is None:
        raise SystemExit(f"could not read {member.name}")
    return handle


def iter_sentences(archive: Path):
    with tarfile.open(archive, "r:gz") as tar:
        for raw in _open_member(tar, archive, "-sentences.txt"):
            line = raw.decode("utf-8", "ignore")
            tab = line.find("\t")
            yield line[tab + 1 :] if tab >= 0 else line


def iter_words(archive: Path):
    with tarfile.open(archive, "r:gz") as tar:
        for raw in _open_member(tar, archive, "-words.txt"):
            parts = raw.decode("utf-8", "ignore").rstrip("\n").split("\t")
            if len(parts) >= 3 and parts[2].isdigit():
                yield parts[1], int(parts[2])
