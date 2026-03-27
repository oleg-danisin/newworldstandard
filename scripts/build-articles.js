#!/usr/bin/env node
/* ============================================================
   NWS BUILD SCRIPT
   scripts/build-articles.js

   Runs on every Netlify deploy.
   Reads Markdown files created by Decap CMS from /articles/
   Generates fully styled HTML using /templates/article-template.html
   Outputs each article to /articles/[slug]/index.html

   HOW IT WORKS:
   1. Finds all .md files in /articles/ folder
   2. Parses frontmatter (title, author, date, etc)
   3. Converts Markdown body to HTML
   4. Injects everything into the article template
   5. Writes the final HTML file
   6. Updates sitemap.xml automatically

   DEPENDENCIES: npm install (marked, gray-matter)
   ============================================================ */

const fs   = require('fs');
const path = require('path');

// ── Install check ─────────────────────────────────────────
let marked, matter;
try {
  marked = require('marked').marked;
  matter = require('gray-matter');
} catch (e) {
  console.error('Missing dependencies. Run: npm install');
  process.exit(1);
}

// ── Paths ─────────────────────────────────────────────────
const ROOT         = path.join(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'articles');
const TEMPLATE     = path.join(ROOT, 'templates', 'article-template.html');
const SITEMAP      = path.join(ROOT, 'sitemap.xml');

// ── Configure marked for clean HTML output ────────────────
marked.setOptions({
  breaks: true,
  gfm: true,
});

// ── Author registry ───────────────────────────────────────
// Add new authors here as they join NWS
const AUTHORS = {
  'Dominic Prescott Welty': {
    slug: 'dominic-prescott-welty',
    title: 'Contributor',
    bio: 'Dominic Prescott Welty writes on the intersection of emerging technology, governance, and global security.',
    avatar: '<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" fill="#6E6860"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#6E6860" stroke-width="1.4"/></svg>'
  },
  'Jacob Aldaco': {
    slug: 'jacob-aldaco',
    title: 'Contributor',
    bio: 'Jacob Aldaco is a contributor to New World Standard, writing on technology, governance, and global security. He spent 15 years in Shanghai before relocating to Europe.',
    avatar: '<img src="/images/authors/jacob-aldaco.jpg" alt="Jacob Aldaco" width="46" height="46">'
  }
};

// ── Helpers ───────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function estimateReadTime(text) {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function buildTags(tags) {
  if (!tags || !tags.length) return '';
  return tags.map(tag =>
    `<span class="article-tag">${tag}</span>`
  ).join('\n          ');
}

function categoryToSlug(cat) {
  return slugify(cat);
}

// ── Wrap first paragraph with drop cap class ─────────────
function addDropCap(html) {
  return html.replace('<p>', '<p class="drop-cap">', 1);
}

// ── Main build function ───────────────────────────────────

function buildArticles() {
  console.log('🔨 NWS Build — generating articles...\n');

  if (!fs.existsSync(TEMPLATE)) {
    console.error('❌ Template not found:', TEMPLATE);
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE, 'utf8');
  const builtArticles = [];

  // Find all .md files in /articles/ (not in subdirectories)
  let mdFiles = [];
  try {
    mdFiles = fs.readdirSync(ARTICLES_DIR)
      .filter(f => f.endsWith('.md'));
  } catch (e) {
    console.log('No articles directory found — skipping.');
    return;
  }

  if (mdFiles.length === 0) {
    console.log('No .md files found in /articles/ — nothing to build.');
    return;
  }

  mdFiles.forEach(file => {
    const filePath = path.join(ARTICLES_DIR, file);
    const raw      = fs.readFileSync(filePath, 'utf8');

    let parsed;
    try {
      parsed = matter(raw);
    } catch (e) {
      console.warn(`⚠️  Could not parse ${file}:`, e.message);
      return;
    }

    const fm = parsed.data;

    // ── Required fields ──────────────────────────────────
    if (!fm.title) {
      console.warn(`⚠️  Skipping ${file} — missing title`);
      return;
    }

    // ── Derive values ─────────────────────────────────────
    const slug         = fm.slug || slugify(fm.title);
    const author       = fm.author || 'New World Standard';
    const authorData   = AUTHORS[author] || {
      slug: slugify(author),
      title: 'Contributor',
      bio: '',
      avatar: '<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" fill="#6E6860"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#6E6860" stroke-width="1.4"/></svg>'
    };
    const date         = fm.date ? new Date(fm.date) : new Date();
    const dateISO      = date.toISOString();
    const dateFormatted = formatDate(date);
    const category     = fm.category || 'Ideas';
    const deck         = fm.deck || '';
    const coverImage   = fm.cover
      ? (fm.cover.startsWith('http') ? fm.cover : `https://www.newworldstandard.com${fm.cover}`)
      : '';
    const tags         = fm.tags || [];
    const readTime     = estimateReadTime(parsed.content);

    // ── Convert Markdown body to HTML ─────────────────────
    let bodyHtml = marked(parsed.content || '');
    bodyHtml = addDropCap(bodyHtml);

    // ── Fill template ─────────────────────────────────────
    let html = template
      .replace(/\{\{title\}\}/g,          escapeHtml(fm.title))
      .replace(/\{\{deck\}\}/g,           escapeHtml(deck))
      .replace(/\{\{author\}\}/g,         escapeHtml(author))
      .replace(/\{\{authorSlug\}\}/g,     authorData.slug)
      .replace(/\{\{authorTitle\}\}/g,    authorData.title)
      .replace(/\{\{authorBio\}\}/g,      escapeHtml(authorData.bio))
      .replace(/\{\{authorAvatar\}\}/g,   authorData.avatar)
      .replace(/\{\{slug\}\}/g,           slug)
      .replace(/\{\{dateISO\}\}/g,        dateISO)
      .replace(/\{\{dateFormatted\}\}/g,  dateFormatted)
      .replace(/\{\{category\}\}/g,       escapeHtml(category))
      .replace(/\{\{categorySlug\}\}/g,   categoryToSlug(category))
      .replace(/\{\{coverImage\}\}/g,     coverImage)
      .replace(/\{\{readTime\}\}/g,       String(readTime))
      .replace(/\{\{tags\}\}/g,           buildTags(tags))
      .replace(/\{\{body\}\}/g,           bodyHtml);

    // Handle optional cover image block
    html = html
      .replace(/\{\{#if coverImage\}\}[\s\S]*?\{\{\/if\}\}/g, (match) => {
        if (!coverImage) return '';
        return match
          .replace('{{#if coverImage}}', '')
          .replace('{{/if}}', '');
      });

    // ── Write output ──────────────────────────────────────
    const outDir  = path.join(ARTICLES_DIR, slug);
    const outFile = path.join(outDir, 'index.html');

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, html, 'utf8');

    console.log(`✅ Built: /articles/${slug}/`);

    builtArticles.push({
      slug,
      title: fm.title,
      date: dateISO,
      lastmod: dateISO,
    });
  });

  // ── Update sitemap ────────────────────────────────────
  if (builtArticles.length > 0) {
    updateSitemap(builtArticles);
  }

  console.log(`\n✨ Done — ${builtArticles.length} article(s) built.`);
}

// ── Sitemap updater ───────────────────────────────────────

function updateSitemap(articles) {
  let existing = '';
  try {
    existing = fs.readFileSync(SITEMAP, 'utf8');
  } catch (e) {
    // No sitemap yet — create from scratch
  }

  // Build article URL entries
  const articleEntries = articles.map(a => `
  <url>
    <loc>https://newworldstandard.com/articles/${a.slug}</loc>
    <lastmod>${a.lastmod.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  // If sitemap exists, inject before closing tag
  if (existing) {
    // Remove existing auto-generated article entries and re-add
    const cleaned = existing
      .replace(/<!-- AUTO-GENERATED START -->[\s\S]*?<!-- AUTO-GENERATED END -->/g, '')
      .replace('</urlset>', '');

    const updated = cleaned.trimEnd() + `
<!-- AUTO-GENERATED START -->
${articleEntries}
<!-- AUTO-GENERATED END -->
</urlset>`;

    fs.writeFileSync(SITEMAP, updated, 'utf8');
  } else {
    // Create fresh sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://newworldstandard.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
<!-- AUTO-GENERATED START -->
${articleEntries}
<!-- AUTO-GENERATED END -->
</urlset>`;
    fs.writeFileSync(SITEMAP, sitemap, 'utf8');
  }

  console.log('📋 Sitemap updated.');
}

// ── Escape HTML for attribute injection ──────────────────

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Run ───────────────────────────────────────────────────
buildArticles();
