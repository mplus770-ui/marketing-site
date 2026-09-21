// ZOHAR — Eleventy configuration.
// Build-time only. Zero client framework runtime. Output is plain HTML/CSS/JS.
import fs from "node:fs";
import path from "node:path";

export default function (eleventyConfig) {
  // ── Static passthrough ──────────────────────────────────────────────
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  // The approved Gate 2B/2C concept + brand review routes stay reachable on the
  // branch preview. They carry their own noindex and are excluded in robots.txt.
  eleventyConfig.addPassthroughCopy({ "public/concept-gate2": "concept-gate2" });
  // Gate 3 review package: protected preview only, noindex, robots-disallowed.
  eleventyConfig.addPassthroughCopy({ "public/review-gate3": "review-gate3" });
  // The Codex hero-motion prototype stays exactly as delivered, reachable on
  // the protected preview. Production uses its own copies in src/assets/motion.
  eleventyConfig.addPassthroughCopy({ "public/hero-motion-review": "hero-motion-review" });

  // ── Central origin resolver ─────────────────────────────────────────
  // One place decides canonical origin, absolute URL, alternates, x-default,
  // sitemap membership and indexability. No template hardcodes a host.
  const originOf = (loc, domains) => (domains && domains[loc.origin]) || null;
  const absUrl = (loc, domains) => {
    const o = originOf(loc, domains);
    return o ? o.replace(/\/$/, "") + loc.canonicalPath : null;
  };
  eleventyConfig.addFilter("originOf", originOf);
  eleventyConfig.addFilter("absUrl", absUrl);
  // Published locales that also have their canonical origin configured. A
  // locale missing either is absent from hreflang and from every sitemap.
  eleventyConfig.addFilter("publishable", (locales, domains) =>
    (locales || []).filter((l) => l.ready && originOf(l, domains)));
  // Locales belonging to one host — a sitemap may only list its own host.
  eleventyConfig.addFilter("onHost", (locales, key) =>
    (locales || []).filter((l) => l.origin === key));
  eleventyConfig.addFilter("xDefault", (locales, domains) => {
    const en = (locales || []).find((l) => l.code === "en");
    return en ? absUrl(en, domains) : null;
  });
  // Legacy single-origin helper, kept for the 404 page only.
  eleventyConfig.addFilter("abs", (p, origin) => (origin ? origin.replace(/\/$/, "") + p : p));

  // Look up a dotted key in the active locale's strings, with no cross-locale
  // fallback: a missing key is a visible build error, never silent English.
  eleventyConfig.addFilter("t", function (key, strings) {
    const v = key.split(".").reduce((o, k) => (o == null ? o : o[k]), strings);
    if (v === undefined) throw new Error(`i18n: missing key "${key}"`);
    return v;
  });

  // Render a link only when its destination is configured. Unset business
  // inputs must never produce a broken active link.
  eleventyConfig.addFilter("hasDest", (v) => typeof v === "string" && v.length > 0);

  eleventyConfig.addFilter("jsonld", (o) => JSON.stringify(o, null, 2));

  // Locale-aware number formatting (prices come from one data file only).
  eleventyConfig.addFilter("num", (n, code) =>
    new Intl.NumberFormat(code === "he" ? "he-IL" : code || "en").format(n));

  // WhatsApp destination with a localised prefill. Returns null when no number
  // is configured, so the caller renders inert text instead of a broken link.
  // The prefill carries no personal data, page history or tracking identifier.
  eleventyConfig.addFilter("waLink", (number, prefill) =>
    number ? `https://wa.me/${number}?text=${encodeURIComponent(prefill || "")}` : null);

  // A project renders only when EVERY activation condition holds: verified,
  // permitted, published, with local media and a destination. An entry missing
  // any of them is absent from the page — never an empty or broken card.
  eleventyConfig.addFilter("visible", (list) =>
    (list || [])
      .filter((p) => p.verified && p.permission && p.published && p.media && p.url)
      .sort((a, b) => (a.order || 0) - (b.order || 0)));

  // ── Structured data ─────────────────────────────────────────────────
  // Nothing is emitted without a configured origin, and nothing on a locale
  // that has not passed translation review.
  eleventyConfig.addShortcode("schema", function (site, loc, strings, domains) {
    const origin = domains && domains[loc.origin];
    if (!origin || !loc.ready) return "";
    const o = origin.replace(/\/$/, "");
    const page = o + loc.canonicalPath;
    const org = {
      "@type": "Organization", "@id": o + "/#organization",
      name: site.legalName, alternateName: site.brand, url: o + "/",
      logo: o + "/assets/brand/zohar-symbol.svg",
      knowsLanguage: ["he", "en", "fr", "es", "pt", "ru", "zh", "ar", "de"],
    };
    if (site.legalEntity) org.legalName = site.legalEntity;
    if (site.email) org.email = site.email;
    if (site.founded) org.foundingDate = site.founded;
    if (site.social && site.social.length) org.sameAs = site.social;

    const svc = {
      "@type": "ProfessionalService", "@id": o + "/#service",
      name: site.legalName, url: o + "/",
      parentOrganization: { "@id": o + "/#organization" },
      serviceType: "Website design and development",
    };
    if (site.areaServed) svc.areaServed = site.areaServed;

    const faq = [];
    for (let n = 1; n <= 9; n++) {
      const q = strings.faq?.["q" + n], a = strings.faq?.["a" + n];
      if (q && a) faq.push({ "@type": "Question", name: q,
        acceptedAnswer: { "@type": "Answer", text: a } });
    }

    const graph = [org, svc,
      { "@type": "WebSite", "@id": o + "/#website", url: o + "/", name: site.brand,
        inLanguage: loc.hreflang, publisher: { "@id": o + "/#organization" } },
      { "@type": "WebPage", "@id": page + "#webpage", url: page,
        name: strings.meta.title, description: strings.meta.description,
        inLanguage: loc.hreflang, isPartOf: { "@id": o + "/#website" } },
    ];
    if (faq.length) graph.push({ "@type": "FAQPage", "@id": page + "#faq", mainEntity: faq });

    return `<script type="application/ld+json">\n${JSON.stringify(
      { "@context": "https://schema.org", "@graph": graph }, null, 2)}\n</script>`;
  });


  // ── One concatenated stylesheet, hashed, no bundler ──────────────────
  eleventyConfig.on("eleventy.before", () => {
    const dir = "src/styles";
    const order = ["tokens.css", "reset.css", "base.css", "components.css", "rtl.css"];
    const css = order.map((f) => fs.readFileSync(path.join(dir, f), "utf8")).join("\n");
    fs.mkdirSync("src/assets/gen", { recursive: true });
    fs.writeFileSync("src/assets/gen/zohar.css", css);
    fs.writeFileSync("src/assets/gen/zohar.js", fs.readFileSync("src/scripts/main.js", "utf8"));
  });

  return {
    dir: { input: "src", output: "dist", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
