// APPROVED final host behaviour. Decision closed.
//
// This file is DATA ONLY. It activates nothing: vercel.json still carries no
// host rules and no domain is attached. It exists so the map is machine-checked
// (scripts/verify-host-map.mjs) instead of living only in prose, and so the
// exact rule set can be generated rather than retyped at cutover.
export const canonical = {
  he:            "https://www.zohar-ai.co.il", // incumbent www keeps the existing redirect direction
  international: "https://zohar-ai.com",       // clean apex for the international canonical
};

// Hosts that must exist and hold valid TLS BEFORE any redirect is activated.
export const hosts = [
  "zohar-ai.co.il", "www.zohar-ai.co.il",
  "zohar-ai.com",   "www.zohar-ai.com",
];

export const internationalLocales = ["en", "fr", "es", "pt", "ru", "zh", "ar", "de"];

// Evaluated in order. The first match wins. `serve` terminates the chain.
export const rules = [
  { id: "coil-apex-to-www",
    when: { host: "zohar-ai.co.il" },
    redirect: { to: "https://www.zohar-ai.co.il", path: "keep" }, status: 301 },

  { id: "coil-english-to-com",
    when: { host: "www.zohar-ai.co.il", pathPrefix: "/en/" },
    redirect: { to: "https://zohar-ai.com", path: "stripLocale" }, status: 301 },

  { id: "coil-intl-locale-to-com",
    when: { host: "www.zohar-ai.co.il", pathPrefixAny: ["/fr/", "/es/", "/pt/", "/ru/", "/zh/", "/ar/", "/de/"] },
    redirect: { to: "https://zohar-ai.com", path: "keep" }, status: 301 },

  { id: "coil-serves-hebrew",
    when: { host: "www.zohar-ai.co.il" },
    serve: { locale: "he" } },

  { id: "com-www-to-apex",
    when: { host: "www.zohar-ai.com" },
    redirect: { to: "https://zohar-ai.com", path: "keep" }, status: 301 },

  { id: "com-hebrew-to-coil",
    when: { host: "zohar-ai.com", pathPrefix: "/he/" },
    redirect: { to: "https://www.zohar-ai.co.il", path: "stripLocale" }, status: 301 },

  { id: "com-locale",
    when: { host: "zohar-ai.com", pathPrefixAny: ["/fr/", "/es/", "/pt/", "/ru/", "/zh/", "/ar/", "/de/"] },
    serve: { localeFromPath: true } },

  { id: "com-serves-english",
    when: { host: "zohar-ai.com" },
    serve: { locale: "en" } },
];

export default { canonical, hosts, internationalLocales, rules };
