# Kindi Lab

Client-side web app that encrypts and decrypts a sentence with **Caesar** or
**Atbash** over a configurable character set, and on decryption works out
**automatically** which method was used and, for Caesar, the shift, with no
human in the loop, through statistical analysis of Spanish text.

Named after Abu Yusuf al-Kindi, who in Baghdad (~850 CE) wrote the first known
treatise on cryptanalysis by frequency analysis. This project is the individual
assignment for *Seguridad en Sistemas de Cómputo* (UAA); the user interface and
example text are in Spanish.

- **Live app:** https://santosemiliano.github.io/Kindi-Lab/
- **Source:** this repository

Everything runs in the browser. There is no backend and no key exchange: the
decryptor is given only the ciphertext and the character set.

## How it works

### The character set (the ring)

The user supplies the set of characters cipher operations act on. Kindi Lab
deduplicates it — keeping the first occurrence of any repeated character — and
treats it as a ring of size `N`, **in the order it was given**. The ring is not
re-sorted: if a ciphertext was produced with a specific alphabet order (e.g. by
hand, or by another tool), decryption only recovers it if the same order is
supplied here. Any character not on the ring (spaces, punctuation, line
breaks) passes through untouched.

Input is normalized to Unicode NFC first, so a character pasted in decomposed
form (a base letter plus a combining mark) occupies a single ring position
instead of one per code point. Built-in presets: `spanish-upper` (A–Z + Ñ, 27
— the default), `spanish-mixed` (upper + lower + Ññ, 53), `spanish-accents`
(A–Z Ñ + ÁÉÍÓÚÜ, 33) and `ascii-printable` (0x20–0x7E, 95). A custom set is
also accepted, including arbitrary Unicode. The same ring is used to encrypt
and to decrypt.

The ring visualization caps itself at 50 visible cards (`MAX_VISIBLE_CARDS`):
larger charsets fold the rest behind a "portal" at the back of the ring rather
than rendering hundreds of DOM nodes. This is a rendering cap only — the
cipher itself operates on the full ring regardless of size.

### Ciphers

- **Caesar:** `out[i] = ring[(index(in[i]) + k) mod N]`. Decryption is the same
  with `-k`. `k` is the shift the user picks.
- **Atbash:** `out[i] = ring[N - 1 - index(in[i])]`. No key; it is its own
  inverse.

Both are pure functions of a few lines.

### Automatic detection on decryption

The decryptor never receives the method or the shift. It:

1. **Generates candidates:** one Atbash plus `N - 1` Caesar shifts (`1..N-1`).
2. **Scores each candidate:** on its `a-z` projection (lowercased, accents folded,
   non-letters dropped) with two signals:
   - **Quadgram log-probability** (primary): the mean `log10 P(quadgram)` over
     every 4-letter window, against a table built from a Spanish corpus, with a
     floor so an unseen quadgram never yields `-inf`.
   - **Valid-word ratio** (confirmation): the fraction of whitespace-separated
     tokens of length ≥ 2 that appear in a Spanish dictionary.
3. **Chooses:** candidates whose projection is shorter than 60 % of the longest
   are dropped; among those within `0.05` of the best mean quadgram score, ties
   break on word ratio and then on the fraction of lowercase letters.
4. **Reports:** one line of plaintext, the method and shift, and a confidence
   value in `[0, 1]`. The candidate list is never shown, since that would be a
   human in the loop.

### al-Kindi frequency panel

The decrypt view shows a histogram of letter frequencies in the ciphertext
against the expected frequencies of Spanish (al-Kindi's original technique). It
is evidence for the chosen answer, not part of choosing it. A data-table view of
the same figures is available for screen readers.

## Not a real cipher

Caesar and Atbash are teaching ciphers, not secure encryption. Kindi Lab exists
to show exactly that: a monoalphabetic cipher leaks the statistics of its
plaintext, so it falls to frequency analysis with no key — the point al-Kindi
made over a thousand years ago. Do not use this to protect anything.

## Running locally

Prerequisites: **Node 22** (see `.nvmrc`) and **pnpm** (pinned via the
`packageManager` field in `package.json`).

```sh
pnpm install
pnpm dev          # start the dev server
pnpm test         # watch mode; pnpm test:run for a single pass
pnpm lint         # oxlint
pnpm build        # type-check (tsc -b) and produce dist/
pnpm preview      # serve the production build
```

## Project layout

```
src/
  lib/
    charset.ts          ring construction and presets
    charsets.ts          UI-facing view of the presets
    ciphers.ts           Caesar and Atbash
    spanish-data.ts      lazy fetch + decode of the language model
    letter-histogram.ts  a-z letter counts for the al-Kindi panel
    detect/              candidates, scoring, selection, recovery cases
  components/            React UI (ring, mirror band, input pill, verdict, ...)
  assets/                the pre-built language model (see below)
  App.tsx                composes the single view
scripts/                 offline Python that regenerates the language model
```

`docs/Documento-Formal-Kindi-Lab.docx` is the formal assignment deliverable
(see below). It is kept locally and submitted separately; it is not tracked
by git and does not get pushed to this repository.

## The Spanish language model

Three static assets, generated offline and committed, loaded lazily on the first
decryption (~380 KB gzip total):

| Asset | What | Source |
|---|---|---|
| `quadgrams-es.bin` | dense `Float32Array` of 26⁴ log-probabilities | Leipzig `spa_news_2023_300K` corpus (CC BY 4.0) |
| `words-es.txt` | 51,696 lowercase words | `an-array-of-spanish-words` (MIT) ∩ words with corpus frequency ≥ 2 |
| `letter-freq-es.json` | 26 `a-z` frequencies for the histogram | same Leipzig corpus |

Each asset ships with a `*.meta.json` (or inline metadata) recording the source
corpus, license and generation parameters. To regenerate them:

```sh
python3 scripts/build_quadgrams.py
python3 scripts/build_dictionary.py
python3 scripts/build_letter_freq.py
```

The scripts use only the Python standard library and download the corpus
themselves. They run at build time only; nothing Python is deployed.

## Tests

Vitest (`pnpm test:run`, 86 tests). The engine is checked with fixed vectors and
round-trip properties over every preset; the loaders, scorers and selector run
against the real assets. `src/lib/detect/recovery.test.ts` holds 52 triples
(real Spanish plaintext / preset / method / shift) across all four presets and
both ciphers and requires **100 % recovery** of method, shift and plaintext.

A separate, manual end-to-end sweep (fuzzing round-trip, normalization edge
cases, auto-detection, and a real-browser pass over a hostile corpus — kanji,
astral code points, ZWJ sequences, zalgo, RTL, surrogate pairs, custom
charsets) is not part of this suite; it lives in the project's own notes, not
in the repository.

## Deployment

GitHub Actions. `ci.yml` runs lint, tests and the build on every pull request;
`deploy.yml` builds on `main` and publishes `dist/` to GitHub Pages. Vite's
`base` is `/Kindi-Lab/` so asset URLs resolve under the project subpath.

## Secure code documentation

The assignment requires the code to be "documented securely": no plain-text
explanation of what a critical function does lives in the source itself.
Instead, each cipher/detection function and a few key UI wiring points carry a
one-line `// [KINDI:XXXXXX]` tag — a random identifier and nothing else. The
explanation of what each identifier does, and how it fits the rest of the
system, lives only in `docs/Documento-Formal-Kindi-Lab.docx` — the formal
deliverable, kept out of git and submitted separately, not part of this
repository. Reading the source alone does not reconstruct the design; the
document does.

## Integrity verification

To let anyone confirm they cloned the exact project state that was submitted,
this checksum covers every file tracked by git (paths sorted, each file hashed
individually, then the sorted `hash  path` manifest hashed again) — the same
idea as a Linux distribution's ISO checksum, adapted so it isn't thrown off by
file permissions, timestamps, or `.git`/`node_modules`/`dist` noise:

```
SHA-256 (project manifest): 363a929724c5fe6732cc88145a176d85d945c760613652b27d43fd10544995c6
```

Regenerate it from the repository root with:

```sh
git ls-files -z | sort -z | while IFS= read -r -d '' f; do
  printf '%s  %s\n' "$(openssl dgst -sha256 "$f" | awk '{print $2}')" "$f"
done | openssl dgst -sha256
```

This value reflects the tracked files **at the moment it was generated**. Any
later commit — including one that only edits this number — changes the tree
and invalidates it; regenerate and update it after each commit that should be
verifiable.

## Credits & licenses

- **al-Kindi** — *A Manuscript on Deciphering Cryptographic Messages*, Baghdad
  ~850 CE; the first known treatise on frequency analysis.
- **Corpus** — Leipzig Corpora Collection, `spa_news_2023_300K`, CC BY 4.0.
- **Dictionary seed** — `an-array-of-spanish-words`, MIT.

This project's own code is released under the MIT License — see `LICENSE`.
