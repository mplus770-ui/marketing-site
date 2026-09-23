// The nine-locale architecture across two domains.
//
//   buildPath     where the file is written in dist/ (one build, two hosts)
//   canonicalPath the public path on its own canonical host
//   origin        which domain in domains.js owns this locale
//   ready         production copy has passed review; everything else builds as
//                 a noindex placeholder, absent from sitemap and hreflang
//
// English lives at the ROOT of the international host, not at /en/. The build
// writes it to /en/ and the edge rewrites zohar-ai.com/ → /en/index.html at
// cutover, so one build serves both hosts without duplicating content.
export default [
  { code: "he", dir: "rtl", hreflang: "he-IL",   buildPath: "/",     canonicalPath: "/",     origin: "he",            label: "עברית",    endonym: "עברית",     ready: true,  script: "hebrew"   },
  { code: "en", dir: "ltr", hreflang: "en",      buildPath: "/en/",  canonicalPath: "/",     origin: "international", label: "English",  endonym: "English",   ready: true,  script: "latin"    },
  { code: "fr", dir: "ltr", hreflang: "fr",      buildPath: "/fr/",  canonicalPath: "/fr/",  origin: "international", label: "Français", endonym: "Français",  ready: true,  script: "latin"    },
  { code: "es", dir: "ltr", hreflang: "es",      buildPath: "/es/",  canonicalPath: "/es/",  origin: "international", label: "Español",  endonym: "Español",   ready: false, script: "latin"    },
  { code: "pt", dir: "ltr", hreflang: "pt-BR",   buildPath: "/pt/",  canonicalPath: "/pt/",  origin: "international", label: "Português",endonym: "Português", ready: false, script: "latin"    },
  { code: "ru", dir: "ltr", hreflang: "ru",      buildPath: "/ru/",  canonicalPath: "/ru/",  origin: "international", label: "Русский",  endonym: "Русский",   ready: false, script: "cyrillic" },
  { code: "zh", dir: "ltr", hreflang: "zh-Hans", buildPath: "/zh/",  canonicalPath: "/zh/",  origin: "international", label: "中文",      endonym: "中文",       ready: false, script: "han"     },
  { code: "ar", dir: "rtl", hreflang: "ar",      buildPath: "/ar/",  canonicalPath: "/ar/",  origin: "international", label: "العربية",  endonym: "العربية",   ready: false, script: "arabic"   },
  { code: "de", dir: "ltr", hreflang: "de",      buildPath: "/de/",  canonicalPath: "/de/",  origin: "international", label: "Deutsch",  endonym: "Deutsch",   ready: false, script: "latin"    },
];
