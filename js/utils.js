/* ============================================================
   NWS SHARED UTILITIES
   js/utils.js — import in every page
   ============================================================ */

/**
 * Set the topbar date and footer year automatically.
 * Call once on DOMContentLoaded.
 */
function nwsInitDate() {
  var now    = new Date();
  var days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  var str    = days[now.getDay()] + ', ' + months[now.getMonth()] +
               ' ' + now.getDate() + ', ' + now.getFullYear();
  var dateEl = document.getElementById('topbarDate');
  var yearEl = document.getElementById('year');
  if (dateEl) dateEl.textContent = str;
  if (yearEl) yearEl.textContent = now.getFullYear();
}

/**
 * Initialise the share dropdown.
 * Expects: #shareToggle, #shareDropdown, #shareInstagram,
 *          #shareWechat, #copyLink, #shareFeedback in the DOM.
 * @param {string} title  Article title for native share
 */
function nwsInitShare(title) {
  var toggle   = document.getElementById('shareToggle');
  var dropdown = document.getElementById('shareDropdown');
  var feedback = document.getElementById('shareFeedback');
  var url      = window.location.href;

  if (!toggle || !dropdown) return;

  function closeDropdown() {
    dropdown.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function showFeedback(msg) {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.classList.add('show');
    setTimeout(function () { feedback.classList.remove('show'); }, 3000);
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = dropdown.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', closeDropdown);
  dropdown.addEventListener('click', function (e) { e.stopPropagation(); });

  // Instagram
  var igBtn = document.getElementById('shareInstagram');
  if (igBtn) {
    igBtn.addEventListener('click', function () {
      if (navigator.share) {
        navigator.share({ title: title, url: url });
      } else {
        navigator.clipboard.writeText(url).then(function () {
          showFeedback('✓ Link copied — paste into Instagram story');
        });
      }
      closeDropdown();
    });
  }

  // WeChat Moments
  var wcBtn = document.getElementById('shareWechat');
  if (wcBtn) {
    wcBtn.addEventListener('click', function () {
      // Attempt WeChat deep link (works inside WeChat browser on mobile)
      try { window.location.href = 'weixin://dl/moments?url=' + encodeURIComponent(url); }
      catch (e) {}
      // Always also copy link as fallback
      setTimeout(function () {
        navigator.clipboard.writeText(url).then(function () {
          showFeedback('✓ Link copied — paste into WeChat Moments');
        });
      }, 400);
      closeDropdown();
    });
  }

  // Copy link
  var copyBtn = document.getElementById('copyLink');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(url).then(function () {
        showFeedback('✓ Link copied to clipboard');
      });
      closeDropdown();
    });
  }
}

// Auto-run date init
document.addEventListener('DOMContentLoaded', nwsInitDate);
