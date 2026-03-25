# New World Standard — Cursor Project Context

Paste this at the start of any Cursor conversation about this project.

---

## Project overview

This is **New World Standard** (newworldstandard.com), a static HTML journalism platform
deployed on Netlify. No frameworks, no build step. Plain HTML + CSS + JS.

## File structure

```
newworldstandard/
├── index.html          ← Homepage — DO NOT use any other HTML file for the homepage
├── article.html        ← Article template
├── css/
│   ├── tokens.css      ← All CSS variables (colours, fonts). Edit here, not inline.
│   ├── base.css        ← Topbar, footer, reset. Shared across all pages.
│   ├── home.css        ← Masthead, slider, section nav, mission band. Homepage only.
│   └── article.css     ← Article header, body, author card. Article page only.
├── js/
│   ├── utils.js        ← Auto date (runs on DOMContentLoaded). Used on all pages.
│   ├── slider.js       ← Slider logic. Used only on index.html.
│   └── likes.js        ← Like counter. Used only on article.html.
├── images/
│   ├── articles/       ← Article cover images
│   ├── authors/        ← Author photos
│   └── og/             ← Social sharing images (1200x630px)
├── netlify/functions/
│   └── likes.js        ← Netlify serverless function for like counts
├── netlify.toml        ← Netlify config
└── package.json        ← One dependency: @netlify/blobs (for likes function)
```

## Design system

All colours and fonts are CSS variables defined in `css/tokens.css`.
**Never hardcode hex values.** Always use the variable.

Key variables:
- `--black: #101211` — page background
- `--surface: #161A17` — elevated surfaces
- `--content-bg: #12160F` — article body background (darker)
- `--emerald-mid: #3D6352` — accent borders, pull quote lines
- `--wasabi: #809076` — labels, category tags
- `--ink: #E8DFD0` — primary text / headlines
- `--ink-mid: #B5AA98` — body text
- `--ink-light: #6E6860` — meta, captions
- `--serif: 'Playfair Display', Georgia, serif` — all headlines
- `--sans: 'DM Sans', system-ui, sans-serif` — all body and UI

## Slider — how it works

The slider is in `index.html` + `css/home.css` + `js/slider.js`.

**Critical CSS rules that make it work:**
```css
.slider-wrap  { position: relative; overflow: hidden; }
.slider-track { display: flex; width: 100%; }   /* width:100% is CRITICAL */
.slide        { min-width: 100%; flex-shrink: 0; } /* flex-shrink:0 is CRITICAL */
```

Each `.slide` is a 2-column CSS grid: image left, text right.
```css
.slide { display: grid; grid-template-columns: 1fr 1fr; min-height: 78vh; }
```

**Slide text panel** uses a light warm background for readability:
```css
.slide-text { background: #F0EBE0; } /* warm off-white */
```
Exception: `.slide-mission .slide-text { background: var(--surface); }` (dark)

**JS slider** (`js/slider.js`) auto-detects all `.slide` elements and generates
dots dynamically. To add a new article slide: copy the slide HTML block in
`index.html` — JS handles everything else automatically.

## Fonts

Playfair Display (headlines) + DM Sans (everything else).
Both loaded from Google Fonts in the `<head>` of each HTML file.
Do NOT introduce a third font.

## Deployment

- Hosted on Netlify, free plan
- GitHub repo: `github.com/oleg-danisin/newworldstandard`
- Push to `main` → Netlify auto-deploys in ~30 seconds
- Likes system requires `npm install` once (for `@netlify/blobs`)

## Rules

1. Never work directly on `main` branch in Git
2. All colours through CSS variables — never hardcode hex
3. Only Playfair Display + DM Sans — never add a third font
4. Test at 375px width before every commit
5. Images: compress to under 150KB before adding to `images/`
6. When in doubt — do less. Restraint = trust.
