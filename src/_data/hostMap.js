// The APPROVED final host behaviour, encoded as data.
//
// This file activates nothing. No template reads it at build time, `vercel.json`
// carries no host rule, and no domain is attached to the Vercel project. It
// exists so the approved behaviour is reviewable, diffable and testable before
// a single DNS record is touched. `scripts/verify-host-map.mjs` is its test.
//
// ORDERING RULE — this is the substance of the map, not a detail:
//   Cross-domain LOCALE ROUTING takes precedence over HOSTNAME NORMALISATION.
//   A request is sent to its final host in one move. Never normalise the
//   hostname first and then transfer the locale — that is what produced the
//   two-hop chains this ordering eliminates.
//
// Budget: a canonical URL takes 0 redirects; every other approved URL takes
// at most 1. `MAX_REDIRECTS` is enforced by the test.

export const canonical = {
  he:            "https://www.zohar-ai.co.il", // incumbent www keeps the existing redirect direction
  international: "https://zohar-ai.com",       // clean apex for the international canonical
};

// Every hostname that must hold a valid certificate before any rule below is
// switched on. A 301 from a host with no certificate is a browser error.
export const hosts = ["zohar-ai.co.il", "www.zohar-ai.co.il", "zohar-ai.com", "www.zohar-ai.com"];

export const heHosts  = ["zohar-ai.co.il", "www.zohar-ai.co.il"];
export const comHosts = ["zohar-ai.com", "www.zohar-ai.com"];

export const internationalLocales = ["en", "fr", "es", "pt", "ru", "zh", "ar", "de"];
const OTHER_INTL = internationalLocales.filter((l) => l !== "en");
const intlPrefixes = OTHER_INTL.map((l) => `/${l}/`);

// Hard ceiling on the redirect chain for any approved URL.
export const MAX_REDIRECTS = 1;

export const rules = [
  // ─── 1 · LOCALE ROUTING — always first, and matched on BOTH hostname forms
  //         of each domain so the transfer never waits for normalisation.

  // English requested anywhere on the Hebrew domain → international host, root.
  { id: "coil-english-to-com",
    when: { hostAny: heHosts, pathPrefix: "/en/" },
    redirect: { to: canonical.international, path: "stripLocale" }, status: 301 },

  // Any other international locale on the Hebrew domain → same path on .com.
  { id: "coil-intl-locale-to-com",
    when: { hostAny: heHosts, pathPrefixAny: intlPrefixes },
    redirect: { to: canonical.international, path: "keep" }, status: 301 },

  // Hebrew has no /he/ prefix — it is the root of its own host. A /he/ URL on
  // the Hebrew domain is a duplicate of the root and is folded into it.
  { id: "coil-he-prefix-to-root",
    when: { hostAny: heHosts, pathPrefix: "/he/" },
    redirect: { to: canonical.he, path: "stripLocale" }, status: 301 },

  // Hebrew requested anywhere on the international domain → Hebrew host, root.
  { id: "com-hebrew-to-coil",
    when: { hostAny: comHosts, pathPrefix: "/he/" },
    redirect: { to: canonical.he, path: "stripLocale" }, status: 301 },

  // English is canonical at the ROOT of .com. The built /en/ path is a
  // duplicate and is folded into the root, from either hostname form.
  { id: "com-en-prefix-to-root",
    when: { hostAny: comHosts, pathPrefix: "/en/" },
    redirect: { to: canonical.international, path: "stripLocale" }, status: 301 },

  // ─── 2 · HOSTNAME NORMALISATION — reached only when no locale transfer
  //         applied, so it can never be the first half of a two-hop chain.

  { id: "coil-apex-to-www",
    when: { host: "zohar-ai.co.il" },
    redirect: { to: canonical.he, path: "keep" }, status: 301 },

  { id: "com-www-to-apex",
    when: { host: "www.zohar-ai.com" },
    redirect: { to: canonical.international, path: "keep" }, status: 301 },

  // ─── 3 · SERVING — terminal. Each canonical host answers 200.

  // Each host advertises only its OWN sitemap, so robots.txt is host-specific.
  { id: "coil-robots",
    when: { host: "www.zohar-ai.co.il", path: "/robots.txt" },
    serve: { locale: "he", file: "/robots-he.txt" } },

  { id: "coil-serves-hebrew",
    when: { host: "www.zohar-ai.co.il" },
    serve: { locale: "he" } },

  { id: "com-locale",
    when: { host: "zohar-ai.com", pathPrefixAny: intlPrefixes },
    serve: { localeFromPath: true } },

  { id: "com-serves-english",
    when: { host: "zohar-ai.com" },
    serve: { locale: "en" } },
];

// Which sitemap each host may advertise, and which it must never advertise.
export const sitemapByHost = {
  "zohar-ai.com":        { robots: "/robots.txt",    advertises: "/sitemap.xml",    forbids: "/sitemap-he.xml" },
  "www.zohar-ai.co.il":  { robots: "/robots-he.txt", advertises: "/sitemap-he.xml", forbids: "/sitemap.xml" },
};
