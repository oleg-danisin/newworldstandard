# New World Standard

Independent journalism platform — newworldstandard.com

---

## Project Structure

```
newworldstandard/
│
├── index.html              ← Homepage (hero slider, masthead, mission)
├── article.html            ← Article template (reuse for every article)
├── about.html              ← About / mission page (to be created)
├── 404.html                ← 404 page (to be created)
│
├── css/
│   ├── tokens.css          ← Design tokens (colours, fonts, spacing)
│   ├── base.css            ← Global reset, topbar, footer
│   ├── article.css         ← Article page styles
│   └── home.css            ← Homepage styles (to be created)
│
├── js/
│   ├── utils.js            ← Shared: auto date, share dropdown
│   └── likes.js            ← Like system (calls Netlify function)
│
├── images/
│   ├── articles/           ← Article cover images (1200×630px recommended)
│   ├── authors/            ← Author portrait photos (400×400px, square)
│   └── og/                 ← Open Graph images for social sharing (1200×630px)
│
├── components/             ← Reusable HTML snippets (copy-paste when building)
│   ├── topbar.html
│   ├── footer.html
│   └── article-card.html   ← (to be created — for homepage article grid)
│
├── netlify/
│   └── functions/
│       └── likes.js        ← Serverless function — like counter backend
│
├── netlify.toml            ← Netlify config (headers, redirects, functions)
├── package.json            ← Node dependencies (@netlify/blobs)
├── .gitignore
└── README.md
```

---

## Deployment

### First deploy
```bash
# 1. Connect repo to Netlify (one time)
# Go to netlify.com → Add new site → Import from GitHub → select this repo

# 2. Install dependencies (for the serverless function)
npm install

# 3. Push to GitHub — Netlify auto-deploys
git add .
git commit -m "Initial deploy"
git push origin main
```

### Daily workflow
```bash
# Always work on develop branch
git checkout develop

# Make your changes, then:
git add .
git commit -m "Describe what you changed"
git push origin develop

# When ready to go live:
git checkout main
git merge develop
git push origin main
# Netlify deploys automatically within 30 seconds
```

---

## Like System

The like counter uses **Netlify Blobs** (free, built into Netlify) via a serverless function.

- `netlify/functions/likes.js` — the backend
- `js/likes.js` — the frontend
- `localStorage` prevents one browser from liking twice

**To add likes to a new article:**
```html
<script src="/js/likes.js"></script>
<script>
  nwsInitLikes('your-article-slug-here');
</script>
```
The slug must be unique per article. Use the URL slug, e.g. `'letting-machines-decide'`.

**The like system works when deployed to Netlify.** It will show 0 when running locally without `netlify dev`.

To test locally:
```bash
npm install -g netlify-cli
netlify dev
# Visit http://localhost:8888
```

---

## Adding a New Article

1. Copy `article.html` → rename to match your slug, e.g. `articles/my-article-title.html`
2. Update all meta tags (title, description, canonical URL, og:image, dates)
3. Update the JSON-LD structured data block
4. Replace the hero image
5. Replace author photo in `images/authors/`
6. Change the `nwsInitLikes('slug')` call to a unique slug
7. Write your content inside `.article-body`
8. Add a redirect in `netlify.toml` for clean URLs

---

## Tailwind CSS Integration

This project is structured to integrate with Tailwind cleanly.

### Option A — Tailwind CDN (quickest, good for prototyping)
Add to `<head>` of any page:
```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          'nws-black':    '#101211',
          'nws-surface':  '#161A17',
          'nws-surface2': '#1C2420',
          'nws-emerald':  '#3D6352',
          'nws-wasabi':   '#809076',
          'nws-ink':      '#E8DFD0',
          'nws-ink-mid':  '#B5AA98',
          'nws-ink-light':'#6E6860',
        },
        fontFamily: {
          serif: ['Playfair Display', 'Georgia', 'serif'],
          sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        },
        maxWidth: {
          reading: '720px',
        }
      }
    }
  }
</script>
```
Then use Tailwind classes alongside existing CSS:
```html
<div class="article-body bg-nws-surface rounded-none p-8">
```

### Option B — Tailwind CLI (production, recommended)
```bash
npm install -D tailwindcss
npx tailwindcss init
```
In `tailwind.config.js`:
```js
module.exports = {
  content: ['./**/*.html', './js/**/*.js'],
  theme: {
    extend: {
      // paste the colour/font config from Option A above
    }
  }
}
```
Add to `package.json` scripts:
```json
"tw:watch": "tailwindcss -i ./css/tailwind-input.css -o ./css/tailwind.css --watch",
"tw:build": "tailwindcss -i ./css/tailwind-input.css -o ./css/tailwind.css --minify"
```
Create `css/tailwind-input.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
Add to every HTML `<head>`:
```html
<link rel="stylesheet" href="/css/tailwind.css">
```

### Migration strategy
The existing `css/tokens.css` maps directly to Tailwind theme tokens.
You can gradually replace custom CSS classes with Tailwind utilities — 
no need to rewrite everything at once. Both systems coexist cleanly.

---

## Image Guidelines

| Type           | Size       | Format | Location              |
|----------------|------------|--------|-----------------------|
| Article hero   | 1200×630px | JPEG   | images/articles/      |
| Author photo   | 400×400px  | JPEG   | images/authors/       |
| OG/social card | 1200×630px | JPEG   | images/og/            |

Always compress images before committing. Use squoosh.app (free, browser-based).
Target: under 150KB per image.

---

## Design System Quick Reference

| Token            | Value     | Use                        |
|------------------|-----------|----------------------------|
| `--black`        | `#101211` | Page background            |
| `--surface`      | `#161A17` | Cards, author card         |
| `--content-bg`   | `#12160F` | Article body background    |
| `--emerald-mid`  | `#3D6352` | Borders, pull quote line   |
| `--wasabi`       | `#809076` | Labels, category tags      |
| `--ink`          | `#E8DFD0` | Headlines, primary text    |
| `--ink-mid`      | `#B5AA98` | Body text                  |
| `--ink-light`    | `#6E6860` | Meta, captions, placeholders|
| `--serif`        | Playfair  | All headlines              |
| `--sans`         | DM Sans   | All body, UI elements      |
