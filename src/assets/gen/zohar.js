/* ZOHAR — the entire client runtime. No framework, no dependencies.
   Everything here is progressive: the page is complete and readable without it. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ── menu sheet: focus trap, scroll lock, Escape ───────────────────── */
  var burger = document.getElementById("burger");
  var sheet = document.getElementById("sheet");
  var sheetClose = document.getElementById("sheetClose");
  var langBtn = document.getElementById("langBtn");
  var lastFocus = null;

  function focusables(el) {
    return Array.prototype.filter.call(
      el.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'),
      function (n) { return n.offsetParent !== null; });
  }
  function openSheet() {
    if (!sheet) return;
    lastFocus = document.activeElement;
    sheet.hidden = false; sheet.classList.add("open");
    document.documentElement.style.overflow = "hidden";
    if (burger) burger.setAttribute("aria-expanded", "true");
    if (langBtn) langBtn.setAttribute("aria-expanded", "true");
    var f = focusables(sheet); if (f.length) f[0].focus();
  }
  function closeSheet() {
    if (!sheet) return;
    sheet.classList.remove("open"); sheet.hidden = true;
    document.documentElement.style.overflow = "";
    if (burger) burger.setAttribute("aria-expanded", "false");
    if (langBtn) langBtn.setAttribute("aria-expanded", "false");
    if (lastFocus) lastFocus.focus();
  }
  if (burger) burger.addEventListener("click", openSheet);
  if (langBtn) langBtn.addEventListener("click", openSheet);
  if (sheetClose) sheetClose.addEventListener("click", closeSheet);
  if (sheet) {
    sheet.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeSheet();
    });
    document.addEventListener("keydown", function (e) {
      if (sheet.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); closeSheet(); return; }
      if (e.key !== "Tab") return;
      var f = focusables(sheet); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ── work rail: native scrolling, correct RTL key mapping ──────────── */
  var rail = document.getElementById("rail");
  if (rail) {
    var rtl = getComputedStyle(rail).direction === "rtl";
    var dots = document.getElementById("dots");
    function step(dir) { /* dir +1 always means further into the list */
      var card = rail.firstElementChild; if (!card) return;
      var w = card.getBoundingClientRect().width + 20;
      rail.scrollBy({ left: (rtl ? -1 : 1) * dir * w,
        behavior: reduce.matches ? "auto" : "smooth" });
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-rail]"), function (b) {
      b.addEventListener("click", function () { step(b.dataset.rail === "next" ? 1 : -1); });
    });
    rail.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); step(rtl ? -1 : 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(rtl ? 1 : -1); }
      else if (e.key === "Home") { e.preventDefault(); rail.scrollTo({ left: 0 }); }
      else if (e.key === "End") { e.preventDefault();
        rail.scrollTo({ left: rtl ? -rail.scrollWidth : rail.scrollWidth }); }
    });
    if (dots) {
      var btns = Array.prototype.slice.call(dots.querySelectorAll("button"));
      btns.forEach(function (d, i) {
        d.addEventListener("click", function () {
          var c = rail.children[i]; if (!c) return;
          rail.scrollTo({ left: rtl ? -(rail.scrollWidth - c.offsetLeft - c.offsetWidth) : c.offsetLeft,
            behavior: reduce.matches ? "auto" : "smooth" });
        });
      });
      rail.addEventListener("scroll", function () {
        var card = rail.firstElementChild; if (!card) return;
        var w = card.getBoundingClientRect().width + 20;
        var i = Math.round(Math.abs(rail.scrollLeft) / w);
        btns.forEach(function (d, j) { d.setAttribute("aria-current", j === i ? "true" : "false"); });
      }, { passive: true });
    }
  }

  /* ── project brief: validation only. Nothing is transmitted or stored
        until an endpoint and privacy handling are approved. ──────────── */
  var brief = document.getElementById("briefForm");
  if (brief) {
    var field = brief.querySelector("textarea");
    var err = brief.querySelector(".err");
    brief.addEventListener("submit", function (e) {
      e.preventDefault();               // no transmission, by design
      var v = (field.value || "").trim();
      var msg = "";
      if (!v) msg = err.dataset.empty;
      else if (v.length < 12) msg = err.dataset.short;
      if (msg) {
        err.textContent = msg; err.dataset.show = "1";
        field.setAttribute("aria-invalid", "true"); field.focus();
      } else {
        err.textContent = err.dataset.disabled; err.dataset.show = "1";
        field.removeAttribute("aria-invalid");
      }
    });
    field.addEventListener("input", function () {
      if (field.getAttribute("aria-invalid") === "true" && field.value.trim()) {
        field.removeAttribute("aria-invalid"); err.dataset.show = "0";
      }
    });
  }

  /* ── hero motion ─────────────────────────────────────────────────────────
        Nothing is fetched until motion is both PERMITTED and NEEDED.

        Permitted  = not prefers-reduced-motion AND not Save-Data.
        Needed     = the frame is near the viewport and the tab is visible.

        The <source> elements ship with data-src, so until this code promotes
        them the <video autoplay> has no resolvable source and the browser
        downloads zero bytes. Reduced motion, Save-Data and no-JS therefore
        cost nothing at all rather than "download, then stop". Only one of the
        desktop/mobile pair can ever match, so they never both load. */
  var frame = document.querySelector("[data-hero-motion]");
  if (frame) {
    var vid = frame.querySelector("video");
    var btn = frame.querySelector("[data-motion-toggle]");
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    var wanted = !reduce.matches && !saveData;   // the visitor's standing preference
    var armed = false;                           // sources promoted yet?
    var paused = false;                          // explicit user pause

    function arm() {
      if (armed) return;
      armed = true;
      Array.prototype.forEach.call(vid.querySelectorAll("source[data-src]"), function (s) {
        s.setAttribute("src", s.dataset.src);
      });
      vid.load();
    }
    function show() { frame.setAttribute("data-playing", "1"); }
    function hide() { frame.removeAttribute("data-playing"); }
    function start() {
      if (!wanted || paused) return;
      arm();
      var p = vid.play();
      if (p && p.catch) p.catch(function () { hide(); });
    }
    function stop() { if (!vid.paused) vid.pause(); }

    /* The label follows the ACTUAL state, not just clicks, so an offscreen or
       tab-hidden pause never leaves the control announcing the wrong action. */
    function sync() {
      if (!btn) return;
      btn.setAttribute("aria-label", vid.paused ? btn.dataset.labelPlay : btn.dataset.labelPause);
    }
    vid.addEventListener("playing", function () { show(); sync(); });
    vid.addEventListener("pause", function () { hide(); sync(); });
    vid.addEventListener("error", hide);

    if (btn) {
      btn.hidden = false;
      /* Under Save-Data the control becomes the manual opt-in the visitor
         needs: one tap loads and plays the motion, nothing before that. */
      if (saveData) btn.setAttribute("aria-label", btn.dataset.labelPlay);
      btn.addEventListener("click", function () {
        if (!wanted) { wanted = true; paused = false; start(); }
        else if (vid.paused) { paused = false; start(); }
        else { paused = true; stop(); }
        sync();
      });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
      }, { threshold: .25 }).observe(frame);
    } else { start(); }

    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });
  }
  /* ── moving rails: work showcase and capability ribbon ───────────────────
        CSS already pauses on hover and on focus-within. This adds the states
        CSS cannot see: the tab being hidden, a pointer being held on the rail
        (so it never slides under a finger or a drag), the rail being scrolled
        out of view, and an explicit toggle where one exists. Under reduced
        motion or on the mobile layout there is no animation to control, so
        this simply never has anything to pause. One implementation serves
        both rails. */
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-showcase], [data-rail]"), function (rail) {
      var toggle = rail.hasAttribute("data-showcase")
        ? document.querySelector("[data-showcase-toggle]") : null;
      var held = false, offscreen = false, hidden = false, byUser = false;

      function apply() {
        var p = held || offscreen || hidden || byUser;
        p ? rail.setAttribute("data-paused", "1") : rail.removeAttribute("data-paused");
        if (toggle) {
          toggle.setAttribute("aria-label", byUser ? toggle.dataset.labelPlay : toggle.dataset.labelPause);
          byUser ? toggle.setAttribute("data-paused", "1") : toggle.removeAttribute("data-paused");
        }
      }
      ["pointerdown", "touchstart"].forEach(function (e) {
        rail.addEventListener(e, function () { held = true; apply(); }, { passive: true });
      });
      ["pointerup", "pointercancel", "touchend", "touchcancel"].forEach(function (e) {
        window.addEventListener(e, function () { held = false; apply(); }, { passive: true });
      });
      document.addEventListener("visibilitychange", function () { hidden = document.hidden; apply(); });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { offscreen = !en.isIntersecting; });
          apply();
        }, { threshold: 0 }).observe(rail);
      }
      if (toggle) toggle.addEventListener("click", function () { byUser = !byUser; apply(); });
    });

  /* ── hero motion ─────────────────────────────────────────────────────────
        Nothing is fetched until motion is both PERMITTED and NEEDED.

        Permitted  = not prefers-reduced-motion AND not Save-Data.
        Needed     = the frame is near the viewport and the tab is visible.

        The <source> elements ship with data-src, so until this code promotes
        them the <video autoplay> has no resolvable source and the browser
        downloads zero bytes. Reduced motion, Save-Data and no-JS therefore
        cost nothing at all rather than "download, then stop". Only one of the
        desktop/mobile pair can ever match, so they never both load. */
  var frame = document.querySelector("[data-hero-motion]");
  if (frame) {
    var vid = frame.querySelector("video");
    var btn = frame.querySelector("[data-motion-toggle]");
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    var wanted = !reduce.matches && !saveData;   // the visitor's standing preference
    var armed = false;                           // sources promoted yet?
    var paused = false;                          // explicit user pause

    function arm() {
      if (armed) return;
      armed = true;
      Array.prototype.forEach.call(vid.querySelectorAll("source[data-src]"), function (s) {
        s.setAttribute("src", s.dataset.src);
      });
      vid.load();
    }
    function show() { frame.setAttribute("data-playing", "1"); }
    function hide() { frame.removeAttribute("data-playing"); }
    function start() {
      if (!wanted || paused) return;
      arm();
      var p = vid.play();
      if (p && p.catch) p.catch(function () { hide(); });
    }
    function stop() { if (!vid.paused) vid.pause(); }

    /* The label follows the ACTUAL state, not just clicks, so an offscreen or
       tab-hidden pause never leaves the control announcing the wrong action. */
    function sync() {
      if (!btn) return;
      btn.setAttribute("aria-label", vid.paused ? btn.dataset.labelPlay : btn.dataset.labelPause);
    }
    vid.addEventListener("playing", function () { show(); sync(); });
    vid.addEventListener("pause", function () { hide(); sync(); });
    vid.addEventListener("error", hide);

    if (btn) {
      btn.hidden = false;
      /* Under Save-Data the control becomes the manual opt-in the visitor
         needs: one tap loads and plays the motion, nothing before that. */
      if (saveData) btn.setAttribute("aria-label", btn.dataset.labelPlay);
      btn.addEventListener("click", function () {
        if (!wanted) { wanted = true; paused = false; start(); }
        else if (vid.paused) { paused = false; start(); }
        else { paused = true; stop(); }
        sync();
      });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
      }, { threshold: .25 }).observe(frame);
    } else { start(); }

    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });
  }
  /* ── work showcase ───────────────────────────────────────────────────────
        CSS already pauses on hover and on focus-within. This adds the states
        CSS cannot see: the tab being hidden, a pointer being held on the rail
        (so it never slides under a finger or a drag), the rail being scrolled
        out of view, and an explicit toggle. Under reduced motion or on the
        mobile layout there is no animation to control, so the button is
        hidden by CSS and this code simply never has anything to pause. */
  var rail = document.querySelector("[data-showcase]");
  if (rail) {
    var railBtn = document.querySelector("[data-showcase-toggle]");
    var held = false, offscreen = false, hidden = false, byUser = false;

    function applyPause() {
      var p = held || offscreen || hidden || byUser;
      p ? rail.setAttribute("data-paused", "1") : rail.removeAttribute("data-paused");
      if (railBtn) {
        railBtn.setAttribute("aria-label", byUser ? railBtn.dataset.labelPlay : railBtn.dataset.labelPause);
        byUser ? railBtn.setAttribute("data-paused", "1") : railBtn.removeAttribute("data-paused");
      }
    }

    /* A pointer resting on the rail stops it, so dragging and native scrolling
       are never fighting the animation. */
    ["pointerdown", "touchstart"].forEach(function (e) {
      rail.addEventListener(e, function () { held = true; applyPause(); }, { passive: true });
    });
    ["pointerup", "pointercancel", "touchend", "touchcancel"].forEach(function (e) {
      window.addEventListener(e, function () { held = false; applyPause(); }, { passive: true });
    });

    document.addEventListener("visibilitychange", function () {
      hidden = document.hidden; applyPause();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { offscreen = !en.isIntersecting; });
        applyPause();
      }, { threshold: 0 }).observe(rail);
    }

    if (railBtn) railBtn.addEventListener("click", function () {
      byUser = !byUser; applyPause();
    });
  }

})();
