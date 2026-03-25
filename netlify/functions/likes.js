/* ============================================================
   netlify/functions/likes.js
   Netlify serverless function — handles like counts.

   GET  /?slug=article-slug  →  { count: 42 }
   POST /  body: { slug }    →  { count: 43 }

   Storage: Netlify Blobs (free, built into Netlify)
   No database, no external service, no cost.

   SETUP:
   1. This file deploys automatically when you push to Netlify
   2. No configuration needed — Netlify Blobs are auto-provisioned
   3. Works on Netlify free plan
   ============================================================ */

const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    // Netlify Blobs store — scoped to this site
    const store = getStore('likes');

    // ── GET — fetch current count ──────────────────────────
    if (event.httpMethod === 'GET') {
      const slug = event.queryStringParameters?.slug;
      if (!slug) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing slug' }) };
      }

      const raw   = await store.get(slug);
      const count = raw ? parseInt(raw, 10) : 0;
      return { statusCode: 200, headers, body: JSON.stringify({ slug, count }) };
    }

    // ── POST — increment count ─────────────────────────────
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const slug = body.slug;
      if (!slug) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing slug' }) };
      }

      const raw      = await store.get(slug);
      const current  = raw ? parseInt(raw, 10) : 0;
      const updated  = current + 1;
      await store.set(slug, String(updated));

      return { statusCode: 200, headers, body: JSON.stringify({ slug, count: updated }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('Likes function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal error', count: 0 }),
    };
  }
};
