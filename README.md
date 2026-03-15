# direction.support

Personal website for Kris Wang — psychologist and coach. Hosted at **direction.support**.

## Stack

- Static HTML, CSS, and minimal JavaScript
- No build step; deploy the repo as-is to any static host

## Run locally

Open `index.html` in a browser, or use a simple server:

```bash
# Python
python3 -m http.server 8000

# Node (npx)
npx serve .
```

Then visit `http://localhost:8000`.

## Deploy

Upload the project root to your host and point the domain **direction.support** at it.

- **Netlify / Vercel:** Connect the repo or drag-and-drop the folder; set the publish directory to `.` (root).
- **Any static host:** Upload `index.html`, `privacy.html`, `styles.css`, and `script.js`.

## Files

- `index.html` — Main single-page site (Hero, About, Approach, Topics, Pricing, Testimonials, Contact)
- `privacy.html` — Privacy policy
- `styles.css` — Layout and design (Inter font, sunset palette, responsive)
- `script.js` — Mobile menu toggle

## Design

- **Font:** Inter (Google Fonts)
- **Colors:** Warm off-white/cream backgrounds, terracotta/orange accents (#E47253), dark brown/grey text (#5B433C, #3A3A3A)
- **Tone:** Calm, clear, supportive — aligned with mental-health best practices and single-practitioner positioning
