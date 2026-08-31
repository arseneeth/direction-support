# direction.support

Landing page for **Kristina Wang** — counselling psychologist and coach.
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
2. **Certificates.** `#credentials` has four dashed placeholder slots. Drop images
   into `assets/` and replace each `<span class="cert-slot">` with
   `<img src="assets/cert-1.jpg" alt="…">`. The grid styles images already.
3. **Confirm the prices.** `pricing0/1/2` in `translations.js` currently use the
   numbers the live direction.support renders (free intro call, 360€/month).
   wowitskris.com says 99€/60min, and the old `index.html` defaults said
   150–90€ sliding scale — three different sets. Pick one.
4. **Calendly.** The inline embed points at `calendly.com/wowitskrisw/call`.
   It does not render from `localhost` (Calendly blocks unregistered embed
   domains), so verify it once on the real domain. The "Open it in a new tab"
   link under the embed is the fallback either way.

## Design notes

- **Type:** Inter throughout; Caveat only as the signature fallback.
- **Colour:** baby pink + baby blue as flat section blocks, lilac and light
  orange as single-card accents. One near-black for every button — the pastels
  are the environment, the CTA is the only high-contrast thing on the page.
- **Hand-drawn chips** in the hero are plain CSS borders on a pseudo-element with
  an SVG `feTurbulence`/`feDisplacementMap` filter (`#wobble` in `index.html`),
  so the outline wobbles while the text stays crisp. Degrades to a clean pill
  where the filter is unsupported.
- Respects `prefers-reduced-motion`; has a print stylesheet.

### v2: the hairline system

v2 swaps floating shadow-cards for drawn structure, keeping small radii so it
stays warm rather than cold:

- `.modular` turns a grid into one continuous hairline table — `gap:1px` plus
  `box-shadow:0 0 0 1px` on each cell, so adjacent cells share a single rule and
  an empty trailing slot stays blank instead of showing a filled block. Used by
  *How I work*, *Topics* and *Is it safe?*.
- Each modular cell gets a rotated `01/02/03` index from a CSS counter — no
  markup and nothing to translate.
- `.card--ink` is the one solid block per grid, straight off the reference board.
- Big thin outlined circles carry the pricing and journey numerals.
- `.hairlines` is a stretched SVG of diagonal rules behind the hero and contact;
  `.section--ruled` lays faint column rules behind a section.
- `--rule` / `--rule-soft` are the hairline tokens; `--line` stays for softer
  internal dividers.

**Careful with hairline colours on `.shell`:** `.shell` carries the page's
horizontal padding, so painting a divider colour as its `background` (the usual
`gap:1px` trick) bleeds solid bands into that padding. Outline the cells
instead — that's why `.stats` works the way it does.

## Tagline alternatives

The three hero titles are Game-of-Thrones-style epithets. Alternatives are listed
in a comment above the hero in `index.html` — swap `heroTitle1/2/3` in
`translations.js` to try them; the layout takes any length.
