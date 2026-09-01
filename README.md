# direction.support

Landing page for **Kristina Van** — counselling psychologist and coach.
Static HTML/CSS/JS, no build step. Deployed at **direction.support**.

## Run locally

```bash
python3 -m http.server 8123
```

Then open <http://localhost:8123>.

## Files

| File | What's in it |
| --- | --- |
| `index.html` | The whole page. English copy lives here as the no-JS fallback. |
| `translations.js` | **All copy, EN + RU.** This is the file to edit for text and prices. |
| `styles.css` | Design system + layout. |
| `script.js` | Language toggle, mobile nav, scroll-spy, reveal-on-scroll, sticky mobile CTA. |
| `privacy.html` | Privacy policy. |
| `assets/kris.jpg` | Hero portrait. |
| `assets/signature.png` | **Not committed yet** — see below. |

## Editing copy

Everything visible is keyed by `data-i18n` (text), `data-i18n-list` (bullet lists),
or `data-i18n-attr` (attributes). Change the value in `translations.js` under both
`en` and `ru` and the page picks it up — no HTML edits needed.

The two objects must keep identical key sets. To check:

```bash
python3 -c "import re;s=open('translations.js',encoding='utf-8').read();i=s.index('  en: {');j=s.index('  ru: {');k=re.compile(r'^\s{4}(\w+):',re.M);a,b=k.findall(s[i:j]),k.findall(s[j:]);print('only en:',set(a)-set(b));print('only ru:',set(b)-set(a))"
```

## To do before launch

1. **Signature.** Export the hand-drawn `Ван` from Procreate as a transparent PNG
   (≈1200px wide, trimmed tight) and save it as `assets/signature.png`. Until then
   the page falls back to the Caveat typeface automatically — nothing breaks.
2. **Certificates.** `#credentials` is already built for the eleven real
   documents, with captions in both languages. Save them as
   `assets/certs/01.jpg` … `11.jpg` in this order:

   | # | Document |
   |---|---|
   | 01 | Nauka PSI2.0 — diploma, psychological counselling (PSY2.0), 1100 h |
   | 02 | …its supplement, the 27-discipline transcript |
   | 03 | …its supplement, qualification awarded |
   | 04 | Academy of CPE — Business psychology, 256 h |
   | 05 | CoachingUp University — International-level professional coach |
   | 06 | EMDR Flash Institute — schema therapy and CBT, 56 h |
   | 07 | International Institute of Psychology — psychoanalysis, 32 h |
   | 08 | Training Centre "Resource" — first psychological aid, 30 h |
   | 09 | Practical seminar — Interaction with the body, 32 h |
   | 10 | Countertransference — 15 h, Berlin |
   | 11 | Live Coaching — 65 h, Berlin |

   Any file that isn't there yet shows a dashed placeholder rather than a broken
   image, so the block never looks broken while you fill it in. `.jpg` only —
   rename `.png`/`.heic` first, or change the extension in the markup.

   The twelfth cell is a text cell ("originals on request") so the block always
   divides evenly into 2, 3 or 4 columns.

   Note these scans carry a patronymic, registration numbers and signatures.
   That is your call to publish; crop or blur them first if you'd rather not.
3. **Confirm the prices.** `pricing0/1/2` in `translations.js` currently use the
   numbers the live direction.support renders (free intro call, 360€/month).
   wowitskris.com says 99€/60min, and the old `index.html` defaults said
   150–90€ sliding scale — three different sets. Pick one.
4. **Calendly.** The inline embed points at `calendly.com/wowitskrisw/call`.
   It does not render from `localhost` (Calendly blocks unregistered embed
   domains), so verify it once on the real domain. The "Open it in a new tab"
   link under the embed is the fallback either way.

## Design notes

- **Type:** Inter throughout; Caveat only as the signature fallback. **All type
  is one colour, `--ink: #0A103C`** — a deep navy. `--ink-2/3/4` are tints of it,
  not greys. Coloured marks (list bullets, ticks, the hero arrow glyphs, the
  cell glyphs) stay as accents; only *text* is unified.
- **Colour:** bubblegum pink + sky blue, for the dopamine pairing. Flat tints
  as section blocks; gradients where two cells want energy (`.card--tint` is
  pink→sky, `.price-row--main` is pink→lilac→sky). Lilac and light orange are
  the single-cell accents. Buttons are `--ink`, so the CTA is the only
  high-contrast thing on the page.
- **Gradient orbs + grain:** `.blob` elements are soft radial gradients, and
  `.grain` lays an `feTurbulence` SVG data-URI over the hero and contact at low
  opacity with `mix-blend-mode: multiply` — the film-grain feel of the
  watercolour and orb references.
- **Hand-drawn chips** in the hero are plain CSS borders on a pseudo-element with
  an SVG `feTurbulence`/`feDisplacementMap` filter (`#wobble` in `index.html`),
  so the outline wobbles while the text stays crisp. Degrades to a clean pill
  where the filter is unsupported.
- **The portrait surround** is a `::before` layer with an 8-value
  `border-radius` — four elliptical arcs, so the outline is smooth by
  construction: a couple of slow curves, water rather than jitter. A turbulence
  filter was tried here and read as noise at this size; don't reach for one.
  There is no outline ring — the shape is the mark, and the photo sits on top
  as a clean circle.
- **The hero folio line** puts "counselling psychologist" hard left and "coach"
  hard right on one baseline above the name, the way a magazine sets a running
  head against a page number. Its width is matched to the name's, so "coach"
  ends exactly where the surname does. That width can't be expressed in CSS —
  it depends on the language, the viewport, the webfont and whether
  `signature.png` loaded — so `script.js` measures it into `--name-w`.
  It re-measures after `document.fonts.ready` on every language switch:
  the script face loads a different subset per language, and measuring before
  it lands is off by about ten pixels.
- **The hero is a bracketed figure.** The portrait is a plain square held
  between two oversized pink parentheses, with an asterisk to the left. The
  parens are real type: `--fig` sets the photo size, and they are set at a
  fraction of it and stretched with `scaleY(2)`. That matters — parens large
  enough to match the photo's height at their natural width are wide enough to
  push the whole group off a phone screen, since a paren's advance grows with
  its point size.
- **The name** is Inter 200 (closest weight to Helvetica Neue Thin), with the
  signature tucked almost flush against it at 1.42x the name's font size, both
  driven off `--fs` so they scale together.
- On mobile the folio label and its gap shrink, because the folio is only as
  wide as the name there (~195px at 375) and would otherwise wrap to two lines.

### Two traps in this layout

**Column counts must divide the cell count exactly.** Full-bleed grids are wide,
so `auto-fit` happily makes more columns than there are cells and the last row
ends in empty slots — which breaks the solid-rectangle read. Columns are pinned
per breakpoint instead (6 cells: 1/2/3, 3 cells: 1/3, 4 cells: 2/4). Topics has
3 cells, so it skips the 2-column stage via `.grid-3:not(.grid-3--tight)` — and
because `:not()` raises specificity, the wider breakpoint has to repeat that
same selector or it silently loses.

**Careful with hairline colours on `.shell`:** `.shell` carries the page's
horizontal padding, so painting a divider colour as its `background` (the usual
`gap:1px` trick) bleeds solid bands into that padding. Outline the cells
instead — that's why `.stats` works the way it does.

## Tagline alternatives

The hero carries one uppercase line, `heroTagline` in `translations.js` — the
Game-of-Thrones-style epithets joined with "and". Alternatives are listed in a
comment above the hero in `index.html`. It wraps freely, so length is not a
constraint. Note the drawn version dropped "breaker of stereotypes"; add it back
into the same string if you want all three.
