/* ============================================================
   NWS LIKE SYSTEM
   js/likes.js

   HOW IT WORKS:
   - localStorage prevents one browser liking twice (client lock)
   - Netlify serverless function /.netlify/functions/likes
     stores the real count in a JSON file via Netlify Blobs
   - Falls back to localStorage count if function unavailable

   USAGE:
     <script src="/js/likes.js"></script>
     <script>
       nwsInitLikes('article-slug-here');
     </script>
   ============================================================ */

/**
 * Initialise the like system for a given article.
 * @param {string} articleSlug  Unique slug, e.g. 'letting-machines-decide'
 */
function nwsInitLikes(articleSlug) {
  var STORAGE_KEY   = 'nws-liked-' + articleSlug;
  var FUNCTION_URL  = '/.netlify/functions/likes';

  var liked         = localStorage.getItem(STORAGE_KEY) === 'true';

  var likeBtn       = document.getElementById('likeBtn');
  var likeBtnLarge  = document.getElementById('likeBtnLarge');
  var countSmall    = document.getElementById('likeCountSmall');
  var countLarge    = document.getElementById('likeCountLarge');
  var likedMsg      = document.getElementById('likedMsg');

  // ── Helpers ──────────────────────────────────────────────

  function setCount(n) {
    var display = (n !== null && n !== undefined && !isNaN(n))
      ? Number(n).toLocaleString()
      : '0';
    if (countSmall) countSmall.textContent = display;
    if (countLarge) countLarge.textContent = display;
  }

  function setLikedState(state) {
    liked = state;
    var btns = [likeBtn, likeBtnLarge].filter(Boolean);
    btns.forEach(function (btn) { btn.classList.toggle('liked', state); });

    // Fill heart SVG
    ['likeHeart', 'likeHeartLarge'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute('fill', state ? 'currentColor' : 'none');
    });

    if (state && likedMsg) {
      likedMsg.textContent = 'You liked this article.';
      likedMsg.classList.add('show');
    }
  }

  function animatePulse() {
    [likeBtn, likeBtnLarge].filter(Boolean).forEach(function (btn) {
      btn.classList.add('pulse');
      setTimeout(function () { btn.classList.remove('pulse'); }, 400);
    });
  }

  // ── API calls ─────────────────────────────────────────────

  function fetchCount() {
    fetch(FUNCTION_URL + '?slug=' + encodeURIComponent(articleSlug))
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) { setCount(d.count); })
      .catch(function () {
        // Function not deployed yet — show 0
        setCount(0);
      });
  }

  function hitLike() {
    fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: articleSlug })
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) { setCount(d.count); })
      .catch(function () {
        // Fallback: increment local display count
        var cur = parseInt((countSmall ? countSmall.textContent : '0').replace(/,/g, '')) || 0;
        setCount(cur); // already incremented optimistically
      });
  }

  // ── Like action ───────────────────────────────────────────

  function doLike() {
    if (liked) return;

    // Optimistic UI
    var cur = parseInt((countSmall ? countSmall.textContent : '0').replace(/,/g, '')) || 0;
    setCount(cur + 1);
    animatePulse();
    setLikedState(true);
    localStorage.setItem(STORAGE_KEY, 'true');

    // Hit the function
    hitLike();
  }

  // ── Init ─────────────────────────────────────────────────

  fetchCount();
  if (liked) setLikedState(true);

  if (likeBtn)      likeBtn.addEventListener('click', doLike);
  if (likeBtnLarge) likeBtnLarge.addEventListener('click', doLike);
}
