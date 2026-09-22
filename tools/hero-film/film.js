/* ZOHAR business-presence film — build tooling, never published.
   ──────────────────────────────────────────────────────────────────────────
   The hero motion is authored here rather than licensed, so the subject is
   ZOHAR's own story: a business intention becoming an identity, becoming
   digital surfaces, becoming a presence that is ready to work.

   Everything is drawn from the real design tokens, the real typefaces and the
   real layout language of this site. There is no stock photography, no
   dashboard, no chart, no prompt box and no invented number anywhere in it.

   The conceptual surfaces deliberately carry no ZOHAR mark: they are the
   CLIENT's presence being built, not our own site shown back to the visitor.

   render.mjs loads this page once per variant and calls renderFrame(t) for
   each frame, so the film is deterministic: the same t always produces the
   same pixels. Nothing here uses CSS animation or requestAnimationFrame. */

/* ── timing helpers ──────────────────────────────────────────────────────── */
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeIn = (p) => p * p * p;

function seg(t, from, to, ease = easeOut) {
  if (to <= from) return t >= to ? 1 : 0;
  return ease(clamp01((t - from) / (to - from)));
}
/* rises over [a,b], holds, falls over [c,d] */
function env(t, a, b, c, d) {
  if (t < a) return 0;
  if (t < b) return easeOut(clamp01((t - a) / (b - a)));
  if (t < c) return 1;
  if (t < d) return 1 - easeIn(clamp01((t - c) / (d - c)));
  return 0;
}
const mix = (a, b, p) => a + (b - a) * p;

/* ── copy ────────────────────────────────────────────────────────────────── */
const COPY = {
  en: {
    intent: "We have a business.\nWe need a presence that works.",
    lSystem: "System", lColour: "Colour", lImage: "Image direction",
    lVoice: "Voice", lStructure: "Structure",
    specA: "Display", specB: "Subhead", specC: "Body text",
    cats: ["Hospitality", "Services", "Retail"],
    nav: ["Home", "Services", "Work", "Contact"],
    voice: "Precise. Quiet. Assured.",
    site: "A presence\nthat works.", siteNav: ["Work", "Method", "Contact"],
    edKicker: "Content", edHead: "Written to be\nfound and read.",
    coKicker: "Commerce", coTitle: "Ready to sell", coCta: "Checkout",
    mobLabel: "Mobile",
    routes: ["/en", "/he", "Site", "Content", "Conversion"],
    readiness: "One presence. Every surface."
  },
  he: {
    intent: "יש לנו עסק.\nצריך נוכחות שעובדת.",
    lSystem: "מערכת", lColour: "צבע", lImage: "כיוון תמונה",
    lVoice: "קול", lStructure: "מבנה",
    specA: "כותרת", specB: "כותרת משנה", specC: "טקסט גוף",
    cats: ["אירוח", "שירותים", "קמעונאות"],
    nav: ["בית", "שירותים", "עבודות", "קשר"],
    voice: "מדויק. שקט. בטוח.",
    site: "נוכחות\nשעובדת.", siteNav: ["עבודות", "השיטה", "קשר"],
    edKicker: "תוכן", edHead: "נכתב כדי\nלהימצא ולהיקרא.",
    coKicker: "מסחר", coTitle: "מוכנים למכור", coCta: "לתשלום",
    mobLabel: "נייד",
    routes: ["/he", "/en", "אתר", "תוכן", "המרה"],
    readiness: "נוכחות אחת. כל המשטחים."
  }
};

/* ── DOM helpers ─────────────────────────────────────────────────────────── */
let SCENE, NODES;
function el(cls, parent, css) {
  const d = document.createElement("div");
  d.className = "n " + cls;
  if (css) Object.assign(d.style, css);
  (parent || SCENE).appendChild(d);
  return d;
}
const px = (v) => Math.round(v * 1000) / 1000 + "px";
/* Absolute placement uses logical inset so the whole composition mirrors for
   Hebrew without mirroring a single glyph. */
function box(n, x, y, w, h) {
  n.style.position = "absolute";
  n.style.insetInlineStart = px(x);
  n.style.top = px(y);
  if (w != null) n.style.width = px(w);
  if (h != null) n.style.height = px(h);
  return n;
}
function txt(n, s, size, extra) {
  n.textContent = s;
  n.style.fontSize = px(size);
  if (extra) Object.assign(n.style, extra);
  return n;
}

/* ── layout profiles ─────────────────────────────────────────────────────── */
/* Desktop keeps the copy column quiet on one side and puts every moving thing
   on the other.

   Mobile has no free side — the copy panel runs the full width — so the whole
   film plays inside the band that stays exposed BELOW the copy, and inside the
   horizontal window that survives the cover crop. At 390 CSS px the 720-wide
   asset renders at 0.8 and is cropped to the middle 487px, so anything outside
   roughly x 120–600 is never seen on a phone. */
function profile(cfg) {
  const { W, H, mode } = cfg;
  if (mode === "side") {
    /* The box has to END where the copy panel BEGINS, not merely lean away
       from it. At 1440 the copy is min(44rem,52%) plus its fade, so the film
       gets the outer 44% of the frame and not a pixel more — anything wider
       and the composition is half-swallowed by the panel. */
    const w = W * 0.44, h = H * 0.78;
    return { bx: W - w - W * 0.020, by: H * 0.11, bw: w, bh: h, k: (H / 720) * 0.85 };
  }
  const bw = W * 0.6667;
  return { bx: (W - bw) / 2, by: H * 0.615, bw, bh: H * 0.275, k: (H / 900) * 0.86 };
}

/* ── scene construction ──────────────────────────────────────────────────── */
function buildScene(cfg) {
  SCENE.innerHTML = "";
  NODES = [];
  const C = COPY[cfg.lang];
  const P = profile(cfg);
  const { W, H } = cfg;
  const k = P.k;
  const S = cfg.dir === "rtl" ? -1 : 1;           // translate sign for mirroring
  const side = cfg.mode === "side";
  const add = (n, fn) => { NODES.push({ n, fn }); return n; };

  const mb = el("massbox", SCENE, {
    position: "absolute", direction: cfg.dir,
    insetInlineStart: px(P.bx), top: px(P.by), width: px(P.bw), height: px(P.bh)
  });
  mb.classList.remove("n");

  /* ══ atmosphere ═══════════════════════════════════════════════════════
     Deep blacks are kept. The lift is local: an ambient wash over the mass
     side only, plus a tight bloom behind the primary surface once it exists.
     Nothing brightens the copy side, and nothing sits behind the H1. */
  const cx = P.bx + P.bw * 0.5, cy = P.by + P.bh * 0.5;
  const ambient = box(el("glow glow-wide", SCENE, { background: "rgba(16,121,90,.10)" }),
    cx - P.bw * 0.80, cy - P.bh * 0.95, P.bw * 1.60, P.bh * 1.90);
  add(ambient, (t) => ({ o: mix(0.34, 1, seg(t, 0.0, 5.4, easeInOut)),
                         s: mix(0.80, 1.02, seg(t, 0.0, 6.2, easeInOut)) }));

  const bloom = box(el("glow bloom", SCENE, { background: "rgba(52,227,155,.13)" }),
    cx - P.bw * 0.36, cy - P.bh * 0.42, P.bw * 0.72, P.bh * 0.84);
  add(bloom, (t) => ({ o: seg(t, 3.7, 6.4, easeInOut) * 0.9, s: mix(0.66, 1, seg(t, 3.7, 6.6)) }));

  const pool = box(el("glow pool", SCENE, { background: "rgba(52,227,155,.08)" }),
    cx - P.bw * 0.62, P.by + P.bh * 0.80, P.bw * 1.24, P.bh * 0.42);
  add(pool, (t) => ({ o: seg(t, 4.0, 6.2, easeInOut) * 0.85 }));

  const vig = box(el("vig", SCENE, { "--vx": side ? (S > 0 ? "70%" : "30%") : "50%" }), 0, 0, W, H);
  add(vig, () => ({ o: 1 }));

  /* ══ STAGE 1 · INTENT ═════════════════════════════════════════════════
     A human business sentence, set in the brand's display face. Not a prompt
     box, not a product UI — a sentence, arriving. */
  /* Sized to the box, not to the frame: at 0.44W a 42px line ran straight off
     the edge in English. */
  const iSize = side ? 29 * k : 25 * k;
  const iTop = side ? P.bh * 0.30 : P.bh * 0.10;
  const intent = box(txt(el("intent", mb), C.intent, iSize, { whiteSpace: "pre-line" }),
    0, iTop, P.bw, null);
  add(intent, (t) => {
    const inP = seg(t, 0.18, 1.35, easeOut);
    return {
      o: env(t, 0.18, 1.05, 1.55, 2.05),
      y: mix(20 * k, 0, inP) + seg(t, 1.55, 2.05, easeIn) * -14 * k,
      ls: mix(0.16, 0.005, inP) + "em",
      blur: mix(7, 0, seg(t, 0.18, 1.1))
    };
  });

  const rule = box(el("rule", mb), 0, iTop + iSize * 3.1, P.bw * (side ? 0.66 : 0.82), Math.max(1.4, 1.6 * k));
  add(rule, (t) => ({
    o: env(t, 0.55, 1.15, 3.3, 4.1),
    sx: seg(t, 0.55, 1.6, easeOut), ox: "0% 50%"
  }));

  /* ══ STAGE 2 · IDENTITY ═══════════════════════════════════════════════
     The sentence resolves into a controlled system: type scale, colour,
     image direction, navigation structure, voice. Editorial specimen
     modules — not a settings panel and not a dashboard. */
  const modY = side ? P.bh * 0.08 : P.bh * 0.0;
  const gap = 11 * k;
  const colW = (P.bw - gap) * 0.54;
  const col2W = P.bw - colW - gap;
  const modH = side ? P.bh * 0.34 : P.bh * 0.52;

  function modShell(x, y, w, h, label, delay) {
    const m = box(el("mod", mb), x, y, w, h);
    box(txt(el("mod-h", m), label, 9.5 * k), 11 * k, 9 * k);
    add(m, (t) => ({
      o: env(t, 1.95 + delay, 2.5 + delay, 3.45, 3.95),
      y: mix(16 * k, 0, seg(t, 1.95 + delay, 2.7 + delay)),
      s: mix(0.965, 1, seg(t, 1.95 + delay, 2.7 + delay)) * mix(1, 1.05, seg(t, 3.45, 3.95, easeIn))
    }));
    return m;
  }

  const mType = modShell(0, modY, colW, modH, C.lSystem, 0);
  const sT = 27 * k;
  box(txt(el("spec-a", mType), C.specA, 25 * k), 11 * k, sT);
  box(txt(el("spec-b", mType), C.specB, 13.5 * k), 11 * k, sT + 31 * k);
  box(txt(el("spec-c", mType), C.specC, 10 * k), 11 * k, sT + 50 * k);

  const mCol = modShell(colW + gap, modY, col2W, modH * 0.44, C.lColour, 0.12);
  ["#16A37B", "#34E39B", "#F4F1EA", "#E4B363", "#0A2B22"].forEach((c, i) => {
    box(el("sw", mCol, { background: c }), 11 * k + i * (16 * k), 25 * k, 12 * k, 12 * k);
  });

  /* Image direction is stated as brand image FIELDS, not photographs. The site
     may only publish media it owns, so inventing photography of businesses
     that do not exist is out; the film declares the direction instead. */
  const mImg = modShell(colW + gap, modY + modH * 0.44 + gap, col2W, modH * 0.56 - gap, C.lImage, 0.24);
  const fw = (col2W - 22 * k - 2 * (6 * k)) / 3;
  ["f-warm", "f-cool", "f-neutral"].forEach((c, i) => {
    box(el("field " + c, mImg), 11 * k + i * (fw + 6 * k), 24 * k, fw, 19 * k);
    const cap = box(txt(el("cat", mImg), C.cats[i], 7.2 * k), 11 * k + i * (fw + 6 * k), 45 * k, fw, null);
    cap.style.overflow = "hidden"; cap.style.whiteSpace = "nowrap";
  });

  const mNav = modShell(0, modY + modH + gap, colW, modH * 0.58, C.lStructure, 0.36);
  const pw = (colW - 22 * k - 3 * (5 * k)) / 4;
  C.nav.forEach((_, i) => box(el("pill", mNav), 11 * k + i * (pw + 5 * k), 26 * k, pw, 10 * k));

  const mVoice = modShell(colW + gap, modY + modH + gap, col2W, modH * 0.58, C.lVoice, 0.48);
  box(txt(el("voice", mVoice), C.voice, 11.5 * k), 11 * k, 26 * k, col2W - 22 * k, null);

  /* ══ STAGE 3 · PRESENCE ═══════════════════════════════════════════════
     Four digital surfaces assemble out of the identity. Conceptual
     compositions in ZOHAR's own type and colour — no claimed client work,
     no live builder, no product UI. */
  const geo = side
    ? { site: [0, P.bh * 0.02, P.bw * 0.835, P.bh * 0.455],
        mob:  [P.bw * 0.775, P.bh * 0.015, P.bw * 0.190, P.bh * 0.560],
        ed:   [0, P.bh * 0.515, P.bw * 0.505, P.bh * 0.305],
        co:   [P.bw * 0.550, P.bh * 0.515, P.bw * 0.415, P.bh * 0.305] }
    : { site: [0, P.bh * 0.10, P.bw * 0.555, P.bh * 0.585],
        mob:  [P.bw * 0.510, P.bh * 0.035, P.bw * 0.128, P.bh * 0.730],
        ed:   [P.bw * 0.755, P.bh * 0.055, P.bw * 0.245, P.bh * 0.375],
        co:   [P.bw * 0.755, P.bh * 0.475, P.bw * 0.245, P.bh * 0.29] };

  function surface(name, g, delay, fromX, fromY) {
    const s = box(el("surf s-" + name, mb), g[0], g[1], g[2], g[3]);
    /* a soft reflection under each plane: cinematic depth, not decoration */
    const refl = box(el("refl", mb), g[0], g[1] + g[3], g[2], Math.min(g[3] * 0.38, P.bh * 0.12));
    add(refl, (t) => ({ o: seg(t, 4.3 + delay, 6.0) * 0.5 }));
    add(s, (t) => {
      const p = seg(t, 3.80 + delay, 5.05 + delay, easeOut);
      const settle = seg(t, 5.65, 6.45, easeInOut);
      return {
        o: seg(t, 3.80 + delay, 4.45 + delay),
        x: mix(fromX * k * S, 0, p), y: mix(fromY * k, 0, p) + mix(0, -3 * k, settle),
        s: mix(0.90, 1, p)
      };
    });
    return s;
  }

  /* — primary desktop composition — */
  const site = surface("site", geo.site, 0, -54, 26);
  const sw = geo.site[2], sh = geo.site[3];
  const nav = box(el("surf-nav", site), 0, 0, sw, Math.max(11, sh * 0.13));
  /* a neutral client mark, never ours */
  box(el("mark", nav, { background: "linear-gradient(135deg,#16A37B,#34E39B)" }),
    sw * 0.045, sh * 0.042, Math.max(7, sh * 0.048), Math.max(7, sh * 0.048));
  box(el("bar", nav), sw * 0.045 + Math.max(7, sh * 0.048) + sw * 0.016, sh * 0.055,
    sw * 0.085, Math.max(2, sh * 0.022));
  C.siteNav.forEach((label, i) => {
    const n2 = box(txt(el("sansline", nav), label, Math.max(6.5, sh * 0.055)),
      sw * (0.44 + i * 0.165), sh * 0.040, null, null);
    n2.style.whiteSpace = "nowrap";
  });
  box(txt(el("serifline", site), C.site, Math.max(12, sh * 0.16), { whiteSpace: "pre-line" }),
    sw * 0.05, sh * 0.245, sw * 0.58, null);
  box(el("cta", site), sw * 0.05, sh * 0.615, sw * 0.20, sh * 0.088);
  for (let i = 0; i < 3; i++) {
    const tw = sw * 0.26;
    const tile = box(el("tile", site), sw * 0.05 + i * (tw + sw * 0.025), sh * 0.765, tw, sh * 0.17);
    box(el("bar", tile), sw * 0.02, sh * 0.030, tw * 0.55, Math.max(2, sh * 0.016));
    box(el("bar-d", tile), sw * 0.02, sh * 0.065, tw * 0.80, Math.max(2, sh * 0.013));
    box(el("bar-d", tile), sw * 0.02, sh * 0.095, tw * 0.62, Math.max(2, sh * 0.013));
  }
  box(el("field f-cool", site, { opacity: ".55" }), sw * 0.67, sh * 0.245, sw * 0.28, sh * 0.42);
  /* key light along the leading edge of the primary surface */
  const edge = box(el("edge", site), 0, 0, Math.max(1.5, 2 * k), sh);
  add(edge, (t) => ({ o: seg(t, 4.2, 5.4) * 0.9 }));

  /* — mobile composition — */
  const mob = surface("mob", geo.mob, 0.30, 46, 34);
  mob.style.borderRadius = Math.max(5, geo.mob[2] * 0.16) + "px";
  const mw = geo.mob[2], mh = geo.mob[3];
  box(el("surf-nav", mob), 0, 0, mw, mh * 0.065);
  box(txt(el("serifline", mob), C.mobLabel, Math.max(7.5, mw * 0.155)), mw * 0.10, mh * 0.125, mw * 0.8, null);
  for (let i = 0; i < 4; i++) {
    box(el(i === 0 ? "bar" : "bar-d", mob), mw * 0.10,
      mh * 0.275 + i * mh * 0.053, mw * (i === 0 ? 0.62 : 0.78), Math.max(2, mh * 0.012));
  }
  box(el("cta", mob), mw * 0.10, mh * 0.545, mw * 0.8, mh * 0.052);
  box(el("field f-warm", mob, { opacity: ".55" }), mw * 0.10, mh * 0.655, mw * 0.8, mh * 0.225);

  /* — editorial / content surface — */
  const ed = surface("ed", geo.ed, 0.55, -30, -30);
  const ew = geo.ed[2], eh = geo.ed[3];
  const ek = box(txt(el("kicker", ed), C.edKicker, Math.max(6.5, eh * 0.078)), ew * 0.06, eh * 0.10, null, null);
  ek.style.whiteSpace = "nowrap";
  box(txt(el("serifline", ed), C.edHead, Math.max(9.5, eh * 0.14), { whiteSpace: "pre-line" }),
    ew * 0.06, eh * 0.245, ew * 0.86, null);
  const q = box(el("quote", ed), ew * 0.06, eh * 0.60, ew * 0.88, eh * 0.30);
  q.style.pointerEvents = "none";
  for (let c = 0; c < 2; c++) for (let i = 0; i < 3; i++) {
    box(el("bar-d", ed), ew * 0.09 + c * ew * 0.45, eh * 0.645 + i * eh * 0.082,
      ew * (i === 2 ? 0.24 : 0.38), Math.max(2, eh * 0.030));
  }

  /* — commerce / conversion surface — */
  const co = surface("co", geo.co, 0.80, 34, -26);
  const cw = geo.co[2], ch = geo.co[3];
  const ck = box(txt(el("kicker", co), C.coKicker, Math.max(6.5, ch * 0.082)), cw * 0.07, ch * 0.10, null, null);
  ck.style.whiteSpace = "nowrap";
  box(el("field f-neutral", co, { opacity: ".6" }), cw * 0.07, ch * 0.26, cw * 0.32, ch * 0.42);
  box(txt(el("serifline", co), C.coTitle, Math.max(8.5, ch * 0.13)), cw * 0.45, ch * 0.27, cw * 0.50, null);
  box(el("bar-d", co), cw * 0.45, ch * 0.49, cw * 0.38, Math.max(2, ch * 0.035));
  box(el("cta", co), cw * 0.45, ch * 0.60, cw * 0.46, ch * 0.135);
  box(txt(el("sansline", co), C.coCta, Math.max(6.5, ch * 0.078),
    { color: "#04150F", fontWeight: "700", textAlign: "center", lineHeight: ch * 0.135 + "px" }),
    cw * 0.45, ch * 0.60, cw * 0.46, ch * 0.135);

  /* ══ STAGE 4 · READINESS ══════════════════════════════════════════════
     The four surfaces become one system. Discoverability and measurement are
     expressed as structure — routes and a language pair — never as numbers. */
  function connector(x, y, w, h, vertical, delay) {
    const c = box(el(vertical ? "connv" : "conn", mb), x, y, Math.max(w, 1.4 * k), Math.max(h, 1.4 * k));
    add(c, (t) => ({
      o: seg(t, 5.85 + delay, 6.45 + delay) * 0.95,
      [vertical ? "sy" : "sx"]: seg(t, 5.85 + delay, 6.55 + delay, easeOut),
      ox: vertical ? "50% 0%" : "0% 50%"
    }));
    return c;
  }
  if (side) {
    connector(geo.ed[2] * 0.30, geo.site[1] + geo.site[3], 1.4 * k,
      geo.ed[1] - geo.site[1] - geo.site[3], true, 0);
    connector(geo.co[0] + geo.co[2] * 0.5, geo.site[1] + geo.site[3], 1.4 * k,
      geo.co[1] - geo.site[1] - geo.site[3], true, 0.12);
    connector(geo.ed[2], geo.ed[1] + geo.ed[3] * 0.5, geo.co[0] - geo.ed[2], 1.4 * k, false, 0.24);
  } else {
    connector(geo.mob[0] + geo.mob[2], geo.ed[1] + geo.ed[3] * 0.5,
      geo.ed[0] - geo.mob[0] - geo.mob[2], 1.4 * k, false, 0.15);
    connector(geo.ed[0] + geo.ed[2] * 0.5, geo.ed[1] + geo.ed[3], 1.4 * k,
      geo.co[1] - geo.ed[1] - geo.ed[3], true, 0.3);
  }

  /* route ladder: the structure that makes a presence findable, stated as
     paths and a language pair. No scores, no percentages, no fake analytics.
     Chips are measured after insertion rather than guessed from glyph counts,
     so Hebrew and English both sit inside their own borders. */
  const routeY = P.bh * (side ? 0.935 : 0.875);
  const chipH = Math.max(15, 19 * k);
  const chips = C.routes.map((label, i) => {
    const chip = el("routechip", mb, {
      position: "absolute", top: px(routeY), height: px(chipH),
      fontSize: px((side ? 10 : 11.5) * k), padding: "0 " + px(10 * k), lineHeight: px(chipH)
    });
    /* A path is LTR in every locale: without isolation Hebrew bidi moves the
       leading slash to the end and "/he" renders as "he/". The isolation goes
       on an inner span — setting direction on the chip itself would also flip
       how its own inset-inline-start resolves, which put the pair of language
       routes on the wrong side of the ladder entirely. */
    const inner = document.createElement("span");
    inner.textContent = label;
    if (i < 2) {
      inner.style.direction = "ltr";
      inner.style.unicodeBidi = "isolate";
      chip.style.color = "#E4B363";
      chip.style.borderColor = "rgba(228,179,99,.34)";
    }
    chip.appendChild(inner);
    return chip;
  });
  let rx = 0;
  chips.forEach((chip, i) => {
    chip.style.insetInlineStart = px(rx);
    rx += chip.offsetWidth + 7 * k;
    add(chip, (t) => ({
      o: seg(t, 6.25 + i * 0.07, 6.80 + i * 0.07) * 0.96,
      y: mix(7 * k, 0, seg(t, 6.25 + i * 0.07, 6.85 + i * 0.07))
    }));
  });

  /* closing line in the brand voice, clear of every surface */
  const fin = box(txt(el("voice", mb), C.readiness, (side ? 15.5 : 12.5) * k),
    0, P.bh * (side ? 0.855 : 0.795), P.bw, null);
  add(fin, (t) => ({ o: seg(t, 6.45, 7.05) * 0.92, y: mix(6 * k, 0, seg(t, 6.45, 7.1)) }));

  /* one luminous pass across the finished system, then rest */
  const sweep = box(el("sweep", SCENE), -W * 0.6, 0, W * 0.6, H);
  add(sweep, (t) => ({
    o: env(t, 6.45, 6.60, 6.95, 7.20) * 0.85,
    x: mix(0, W * 1.7, seg(t, 6.45, 7.20, easeInOut)) * S
  }));

  return NODES;
}

/* ── frame driver ────────────────────────────────────────────────────────── */
function applyFrame(t) {
  for (const { n, fn } of NODES) {
    const v = fn(t) || {};
    const parts = [];
    if (v.x || v.y) parts.push(`translate(${px(v.x || 0)},${px(v.y || 0)})`);
    if (v.s != null) parts.push(`scale(${v.s})`);
    if (v.sx != null) parts.push(`scaleX(${v.sx})`);
    if (v.sy != null) parts.push(`scaleY(${v.sy})`);
    n.style.transform = parts.length ? parts.join(" ") : "none";
    if (v.ox) n.style.transformOrigin = v.ox;
    n.style.opacity = v.o == null ? 1 : v.o;
    if (v.ls != null) n.style.letterSpacing = v.ls;
    if (v.blur != null) n.style.filter = v.blur > 0.02 ? `blur(${v.blur.toFixed(2)}px)` : "none";
  }
}

window.setupFilm = function (cfg) {
  const stage = document.getElementById("stage");
  SCENE = document.getElementById("scene");
  stage.style.width = cfg.W + "px";
  stage.style.height = cfg.H + "px";
  stage.setAttribute("data-lang", cfg.lang);
  stage.setAttribute("dir", cfg.dir);
  document.documentElement.lang = cfg.lang;
  buildScene(cfg);
  applyFrame(0);
  return { duration: 7.4, nodes: NODES.length };
};
window.renderFrame = function (t) { applyFrame(t); return t; };
