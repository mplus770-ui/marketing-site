// The nine-locale architecture. `ready: true` means production copy has passed
// review; everything else builds as a noindex placeholder and is excluded from
// the sitemap. No locale ever falls back to another locale's strings.
export default [
  { code: "he", dir: "rtl", hreflang: "he-IL",  path: "/",     label: "עברית",    endonym: "עברית",     ready: true,  script: "hebrew" },
  { code: "en", dir: "ltr", hreflang: "en",     path: "/en/",  label: "English",  endonym: "English",   ready: true,  script: "latin"  },
  { code: "fr", dir: "ltr", hreflang: "fr",     path: "/fr/",  label: "Français", endonym: "Français",  ready: false, script: "latin"  },
  { code: "es", dir: "ltr", hreflang: "es",     path: "/es/",  label: "Español",  endonym: "Español",   ready: false, script: "latin"  },
  { code: "pt", dir: "ltr", hreflang: "pt-BR",  path: "/pt/",  label: "Português",endonym: "Português", ready: false, script: "latin"  },
  { code: "ru", dir: "ltr", hreflang: "ru",     path: "/ru/",  label: "Русский",  endonym: "Русский",   ready: false, script: "cyrillic"},
  { code: "zh", dir: "ltr", hreflang: "zh-Hans",path: "/zh/",  label: "中文",      endonym: "中文",       ready: false, script: "han"    },
  { code: "ar", dir: "rtl", hreflang: "ar",     path: "/ar/",  label: "العربية",  endonym: "العربية",   ready: false, script: "arabic" },
  { code: "de", dir: "ltr", hreflang: "de",     path: "/de/",  label: "Deutsch",  endonym: "Deutsch",   ready: false, script: "latin"  },
];
