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

  /* ── project brief ─────────────────────────────────────────────────────
        Answers live only in the page. The visitor reviews them, then chooses
        WhatsApp or email; the site never posts them to a server. Using a
        same-tab location handoff (rather than window.open) keeps the action
        reliable in iOS Safari and avoids popup blockers. ─────────────── */
  var brief = document.getElementById("briefForm");
  if (brief) {
    var steps = Array.prototype.slice.call(brief.querySelectorAll("[data-brief-step]"));
    var fields = steps.map(function (step) { return step.querySelector("textarea"); });
    var err = brief.querySelector(".err");
    var next = brief.querySelector("[data-brief-next]");
    var back = brief.querySelector("[data-brief-back]");
    var nav = brief.querySelector("[data-brief-nav]");
    var review = brief.querySelector("[data-brief-review]");
    var edit = brief.querySelector("[data-brief-edit]");
    var stepLabel = document.getElementById("briefStepLabel");
    var progress = brief.querySelector(".prog");
    var bars = Array.prototype.slice.call(progress.querySelectorAll("i"));
    var index = 0;

    brief.dataset.enhanced = "true";

    function stepText(current) {
      return (brief.dataset.stepTemplate || "{current} / {total}")
        .replace("{current}", String(current)).replace("{total}", String(steps.length));
    }
    function clearError(field) {
      if (field) field.removeAttribute("aria-invalid");
      err.textContent = ""; err.dataset.show = "0";
    }
    function showStep(n) {
      index = Math.max(0, Math.min(n, steps.length - 1));
      steps.forEach(function (step, i) { step.hidden = i !== index; });
      review.hidden = true; nav.hidden = false;
      back.hidden = index === 0;
      next.textContent = index === steps.length - 1 ? next.dataset.reviewLabel : next.dataset.nextLabel;
      stepLabel.textContent = stepText(index + 1);
      progress.setAttribute("aria-valuenow", String(index + 1));
      bars.forEach(function (bar, i) { bar.dataset.active = i <= index ? "true" : "false"; });
      clearError(fields[index]);
    }
    function validCurrent() {
      var field = fields[index];
      var value = (field.value || "").trim();
      var min = Number(field.dataset.minlength || 0);
      var message = "";
      if (field.required && !value) message = err.dataset.empty;
      else if (value && value.length < min) message = err.dataset.short;
      if (!message) { clearError(field); return true; }
      err.textContent = message; err.dataset.show = "1";
      field.setAttribute("aria-invalid", "true"); field.focus();
      return false;
    }
    function labelsAndAnswers() {
      return steps.map(function (step, i) {
        return {
          label: (step.querySelector("legend").textContent || "").trim(),
          answer: (fields[i].value || "").trim() || "—"
        };
      });
    }
    function composeBrief() {
      var blocks = labelsAndAnswers().map(function (item, i) {
        return (i + 1) + ". " + item.label + "\n" + item.answer;
      });
      return brief.dataset.messageTitle + "\n\n" + blocks.join("\n\n");
    }
    function showReview() {
      labelsAndAnswers().forEach(function (item, i) {
        var target = review.querySelector('[data-brief-answer="' + i + '"]');
        if (target) target.textContent = item.answer;
      });
      steps.forEach(function (step) { step.hidden = true; });
      nav.hidden = true; review.hidden = false;
      stepLabel.textContent = brief.querySelector("[data-brief-review] h3").textContent;
      bars.forEach(function (bar) { bar.dataset.active = "true"; });
      progress.setAttribute("aria-valuenow", String(steps.length));
      review.querySelector("button").focus();
    }

    next.dataset.nextLabel = next.textContent;
    next.dataset.reviewLabel = brief.dataset.reviewLabel;
    showStep(0);
    next.addEventListener("click", function () {
      if (!validCurrent()) return;
      if (index === steps.length - 1) showReview();
      else { showStep(index + 1); fields[index].focus(); }
    });
    back.addEventListener("click", function () { showStep(index - 1); fields[index].focus(); });
    edit.addEventListener("click", function () { showStep(0); fields[0].focus(); });
    fields.forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true" && field.value.trim()) clearError(field);
      });
    });
    brief.addEventListener("submit", function (e) { e.preventDefault(); });
    Array.prototype.forEach.call(brief.querySelectorAll("[data-brief-send]"), function (button) {
      button.addEventListener("click", function () {
        var message = composeBrief();
        var destination = "";
        if (button.dataset.briefSend === "whatsapp" && brief.dataset.whatsapp) {
          destination = "https://wa.me/" + brief.dataset.whatsapp + "?text=" + encodeURIComponent(message);
        } else if (button.dataset.briefSend === "email" && brief.dataset.email) {
          destination = "mailto:" + brief.dataset.email + "?subject=" +
            encodeURIComponent(brief.dataset.emailSubject) + "&body=" + encodeURIComponent(message);
        }
        if (destination) window.location.href = destination;
        else {
          err.textContent = err.dataset.disabled; err.dataset.show = "1";
          button.focus();
        }
      });
    });
  }

  /* ── hero stage motion ───────────────────────────────────────────────────
        Nothing is fetched until motion is both PERMITTED and NEEDED.
          permitted = not prefers-reduced-motion AND not Save-Data
          needed    = the stage is near the viewport and the tab is visible
        The <source> elements ship with data-src, so until this promotes them
        the <video autoplay> has no resolvable source and downloads zero bytes.
        Only one of the desktop/mobile pair can ever match, so they never both
        load. The control now lives outside the stage, so it is looked up from
        the document rather than from within the frame. */
  var stage = document.querySelector("[data-hero-motion]");
  if (stage) {
    var vid = stage.querySelector("video");
    var btn = document.querySelector("[data-motion-toggle]");
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    var wanted = !reduce.matches && !saveData;
    var armed = false, paused = false, ended = false;

    /* The film plays ONCE and comes to rest on its final frame. That frame is
       also the poster, rendered from the same scene at the same timestamp, so
       when the video fades out at the end the image underneath is identical
       and nothing visibly changes. A loop would make the hero restless and
       would keep a decode running for as long as the tab is open. */
    function sync() {
      if (!btn) return;
      var state = ended ? "ended" : (vid.paused ? "paused" : "playing");
      btn.setAttribute("data-state", state);
      btn.setAttribute("aria-label",
        state === "ended" ? btn.dataset.labelReplay
          : state === "paused" ? btn.dataset.labelPlay : btn.dataset.labelPause);
    }
    function arm() {
      if (armed) return;
      armed = true;
      Array.prototype.forEach.call(vid.querySelectorAll("source[data-src]"), function (el) {
        el.setAttribute("src", el.dataset.src);
      });
      vid.load();
    }
    function start() {
      if (!wanted || paused || ended) return;
      arm();
      var pr = vid.play();
      if (pr && pr.catch) pr.catch(function () { stage.removeAttribute("data-playing"); });
    }
    function stop() { if (!vid.paused) vid.pause(); }

    vid.addEventListener("ended", function () {
      ended = true; stage.removeAttribute("data-playing");
      stage.setAttribute("data-ended", "1"); sync();
    });
    vid.addEventListener("playing", function () {
      stage.removeAttribute("data-ended");
      stage.setAttribute("data-playing", "1"); sync();
    });
    vid.addEventListener("pause", function () { stage.removeAttribute("data-playing"); sync(); });
    vid.addEventListener("error", function () { stage.removeAttribute("data-playing"); });

    if (btn) {
      btn.hidden = false;
      sync();
      /* Under Save-Data the control is the manual opt-in: one tap loads and
         plays the motion, and nothing is fetched before that. */
      btn.addEventListener("click", function () {
        if (!wanted) { wanted = true; paused = false; ended = false; start(); }
        else if (ended) { ended = false; paused = false; stage.removeAttribute("data-ended"); vid.currentTime = 0; start(); }
        else if (vid.paused) { paused = false; start(); }
        else { paused = true; stop(); }
        sync();
      });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
      }, { threshold: .2 }).observe(stage);
    } else { start(); }

    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });
  }

  /* ── continuously moving visual rails ──────────────────────────────────
       Both rails move on desktop and touch screens. Touch/pointer contact,
       keyboard focus, an explicit pause, an offscreen rail or a hidden tab
       pauses immediately. Reduced-motion visitors get a static manual row. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-showcase],[data-rail]"), function (el) {
    var toggle = el.matches("[data-showcase]")
      ? document.querySelector("[data-showcase-toggle]") : null;
    var explicit = false, visible = true;

    function setPaused() {
      var pausedNow = reduce.matches || explicit || !visible || document.hidden;
      el.dataset.paused = pausedNow ? "1" : "0";
      if (toggle) {
        toggle.dataset.paused = pausedNow ? "1" : "0";
        toggle.setAttribute("aria-pressed", explicit ? "true" : "false");
        toggle.setAttribute("aria-label",
          explicit ? toggle.dataset.labelPlay : toggle.dataset.labelPause);
      }
    }
    function interact(on) { el.dataset.interacting = on ? "1" : "0"; }
    el.addEventListener("pointerdown", function () { interact(true); });
    el.addEventListener("pointerup", function () { interact(false); });
    el.addEventListener("pointercancel", function () { interact(false); });
    el.addEventListener("pointerleave", function () { interact(false); });
    if (toggle) toggle.addEventListener("click", function () {
      explicit = !explicit; setPaused();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = !!entries[0].isIntersecting; setPaused();
      }, { threshold: .08 }).observe(el);
    }
    document.addEventListener("visibilitychange", setPaused);
    if (reduce.addEventListener) reduce.addEventListener("change", setPaused);
    setPaused();
  });

})();
