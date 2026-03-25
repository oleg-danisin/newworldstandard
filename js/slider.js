/* ============================================================
   NWS SLIDER
   js/slider.js

   Self-contained. Auto-detects all .slide elements inside
   #sliderTrack. Generates dots dynamically — so adding a new
   slide to index.html is all you need to do.

   Controls:
   - Arrow buttons (#prevBtn, #nextBtn)
   - Dot buttons (generated into #sliderDots)
   - Touch / swipe (50px threshold)
   - Keyboard left/right arrow keys

   How to add a new slide:
   Copy a .slide block in index.html, update content.
   This script handles everything else automatically.
   ============================================================ */

(function () {
  'use strict';

  // ── Wait for DOM ──────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {

    var track      = document.getElementById('sliderTrack');
    var prevBtn    = document.getElementById('prevBtn');
    var nextBtn    = document.getElementById('nextBtn');
    var dotsWrap   = document.getElementById('sliderDots');
    var currentNum = document.getElementById('slideCurrentNum');
    var totalNum   = document.getElementById('slideTotal');

    if (!track || !prevBtn || !nextBtn || !dotsWrap) {
      // Slider elements not found — not a slider page, exit silently
      return;
    }

    // ── Discover slides ───────────────────────────────────
    var slides = track.querySelectorAll('.slide');
    var total  = slides.length;

    if (total === 0) return;

    // ── Set total count ───────────────────────────────────
    if (totalNum) {
      totalNum.textContent = String(total).padStart(2, '0');
    }

    // ── Generate dots dynamically ─────────────────────────
    // Clears any existing dots so this is always in sync with slides
    dotsWrap.innerHTML = '';
    var dots = [];

    for (var i = 0; i < total; i++) {
      var dot = document.createElement('button');
      dot.className    = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.dataset.index = String(i);
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }

    // ── State ─────────────────────────────────────────────
    var current = 0;

    // ── Core: go to a slide index ─────────────────────────
    function goTo(index) {
      // Clamp to valid range
      index = Math.max(0, Math.min(index, total - 1));
      if (index === current && dots[index].classList.contains('active')) {
        // Already here, just update button states
        updateControls();
        return;
      }
      current = index;

      // Move the track
      track.style.transform = 'translateX(-' + (current * 100) + '%)';

      // Update dots
      dots.forEach(function (dot, i) {
        var isActive = (i === current);
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Update counter
      if (currentNum) {
        currentNum.textContent = String(current + 1).padStart(2, '0');
      }

      updateControls();
    }

    function updateControls() {
      prevBtn.disabled = (current === 0);
      nextBtn.disabled = (current === total - 1);
    }

    // ── Event listeners ───────────────────────────────────
    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.dataset.index, 10));
      });
    });

    // Touch / swipe support
    var touchStartX = 0;
    var touchStartY = 0;

    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      var dx = touchStartX - e.changedTouches[0].clientX;
      var dy = touchStartY - e.changedTouches[0].clientY;
      // Only trigger if horizontal movement dominates (not a scroll)
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        goTo(dx > 0 ? current + 1 : current - 1);
      }
    }, { passive: true });

    // Keyboard support (only when slider is in viewport)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // ── Initialise ────────────────────────────────────────
    goTo(0);
  });

})();
