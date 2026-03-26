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

function json(statusCode, headers, payload) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(payload),
  };
}

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    // Netlify Blobs store — scoped to this site
    const store = getStore({
      name: 'likes',
      consistency: 'strong',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN,
    });

    // ── GET — fetch current count ──────────────────────────
    if (event.httpMethod === 'GET') {
      const slug = event.queryStringParameters?.slug;
      if (!slug) {
        return json(400, headers, { error: 'Missing slug' });
      }

      const raw = await store.get(slug, { consistency: 'strong' });
      const parsed = raw ? parseInt(raw, 10) : 0;
      const count = Number.isFinite(parsed) ? parsed : 0;

      return json(200, headers, {
        ok: true,
        method: 'GET',
        slug,
        count,
      });
    }

    // ── POST — increment count ─────────────────────────────
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const slug = body.slug;

      if (!slug) {
        return json(400, headers, { error: 'Missing slug' });
      }

      const raw = await store.get(slug, { consistency: 'strong' });
      const parsed = raw ? parseInt(raw, 10) : 0;
      const current = Number.isFinite(parsed) ? parsed : 0;
      const updated = current + 1;

      await store.set(slug, String(updated));

      return json(200, headers, {
        ok: true,
        method: 'POST',
        slug,
        count: updated,
      });
    }

    return json(405, headers, { error: 'Method not allowed' });

  } catch (err) {
    console.error('Likes function error:', err);

    return json(500, headers, {
      error: 'Internal error',
      message: err?.message || 'Unknown error',
      code: err?.code || null,
      hasSiteID: Boolean(process.env.NETLIFY_SITE_ID),
      hasAuthToken: Boolean(process.env.NETLIFY_AUTH_TOKEN),
      count: 0,
    });
  }
};
