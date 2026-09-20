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

  // ── Filters ─────────────────────────────────────────────────────────
  eleventyConfig.addFilter("abs", (p, origin) => {
    if (!origin) return p;
    return origin.replace(/\/$/, "") + p;
  });

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

  // Projects that may actually be shown: verified AND permitted.
  eleventyConfig.addFilter("visible", (list) =>
    (list || []).filter((p) => p.verified && p.permission));

  // ── Structured data ─────────────────────────────────────────────────
  // Nothing is emitted without a configured origin, and nothing on a locale
  // that has not passed translation review.
  eleventyConfig.addShortcode("schema", function (site, loc, strings) {
    if (!site.origin || !loc.ready) return "";
    const o = site.origin.replace(/\/$/, "");
    const page = o + loc.path;
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
    for (let n = 1; n <= 8; n++) {
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
