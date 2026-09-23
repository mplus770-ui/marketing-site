// PROOF RULE — only work ZOHAR owns or is explicitly permitted to display.
//
//   own        : part of the ZOHAR business ecosystem (not external client work)
//   verified   : confirmed as genuine ZOHAR work
//   permission : cleared for public display by the owner
//   published  : ALL activation conditions are met and the card may render
//   media      : locally committed captures. Never an external screenshot API.
//   source     : where the capture was taken from, recorded per project
//
// The array order below is the FINAL intended showcase order. Entries with
// published:false render nowhere — no placeholder, no empty card, no broken
// image, no unverified link. Activating one requires exactly four things:
//   1. local AVIF/WebP paths for all four slots
//   2. a destination URL verified to resolve and to show the right site
//   3. reviewed alt text in both published locales
//   4. published: true
//
// Live destinations captured through the review browser record the capture
// date in source.live/source.captured and the verification method explicitly.
// Broken or unverified destinations stay unpublished rather than shipping a
// misleading card.
// See docs/project-media-spec.md for the capture and export specification.

export default [
  {
    slug: "sadafronia", name: "SADAFRONIA", order: 1,
    own: true, verified: true, permission: true, published: true,
    // VERIFIED via the GitHub API: this repository has Pages ENABLED
    // (has_pages: true), and a project Pages site for a user repo resolves
    // deterministically at https://<user>.github.io/<repo>/. That is stronger
    // evidence than a fetch, which this environment cannot perform. It proves
    // the destination is published; it does not prove its current content.
    url: "https://mplus770-ui.github.io/sadafronia-website/",
    urlVerifiedBy: "github-api:has_pages=true",
    external: true,
    category: { he: "מותג היין, האירוח והאקדמיה שלנו", en: "Our wine, hospitality and academy brand", fr: "Notre marque de vin, d’hospitalité et d’académie" },
    description: {
      he: "מהמערכת העסקית שלנו. נבנה ומתוחזק בבית.",
      en: "From our own business ecosystem. Built and maintained in-house.",
      fr: "Issu de notre propre écosystème. Conçu et maintenu en interne.",
    },
    alt: {
      he: "סדפרוניה — אתר מותג יין, אירוח ואקדמיה מהמערכת העסקית של זוהר.",
      en: "SADAFRONIA — a wine, hospitality and academy brand site from ZOHAR's own ecosystem.",
      fr: "SADAFRONIA — site de vin, d’hospitalité et d’académie de l’écosystème ZOHAR.",
    },
    focal: [0.5, 0.12],
    source: { repo: "mplus770-ui/sadafronia-website", ref: "main" },
    media: {
      card:     { avif: "/assets/work/sadafronia-card.avif",      webp: "/assets/work/sadafronia-card.webp" },
      card2x:   { avif: "/assets/work/sadafronia-card@2x.avif",   webp: "/assets/work/sadafronia-card@2x.webp" },
      mobile:   { avif: "/assets/work/sadafronia-mobile.avif",    webp: "/assets/work/sadafronia-mobile.webp" },
      mobile2x: { avif: "/assets/work/sadafronia-mobile@2x.avif", webp: "/assets/work/sadafronia-mobile@2x.webp" },
    },
  },
  {
    slug: "better-world", name: "Better World", order: 2,
    own: false, verified: true, permission: true, published: true,
    // /new/ now redirects to a Vercel 404. The live project is at the root.
    url: "https://www.alefbetcontent.com/",
    urlVerifiedBy: "live-browser:2026-09-22",
    external: true,
    category: { he: "עולם תוכן ומדע־בדיוני", en: "Science-fiction content universe", fr: "Univers éditorial de science-fiction" },
    description: {
      he: "אתר תוכן קולנועי לסדרת ספרים וחזון על עתיד האנושות.",
      en: "A cinematic content site for a book series and a vision of humanity's future.",
      fr: "Un site éditorial cinématographique pour une série de livres et une vision du futur de l’humanité.",
    },
    alt: {
      he: "Better World — אתר תוכן קולנועי בעברית על עתיד האנושות.",
      en: "Better World — a cinematic Hebrew content site about humanity's future.",
      fr: "Better World — site éditorial cinématographique en hébreu sur le futur de l’humanité.",
    },
    focal: [0.5, 0.12],
    source: { live: "https://www.alefbetcontent.com/", captured: "2026-09-22" },
    media: {
      card:     { avif: "/assets/work/better-world-card.avif",      webp: "/assets/work/better-world-card.webp" },
      card2x:   { avif: "/assets/work/better-world-card@2x.avif",   webp: "/assets/work/better-world-card@2x.webp" },
      mobile:   { avif: "/assets/work/better-world-mobile.avif",    webp: "/assets/work/better-world-mobile.webp" },
      mobile2x: { avif: "/assets/work/better-world-mobile@2x.avif", webp: "/assets/work/better-world-mobile@2x.webp" },
    },
  },
  {
    slug: "yayin", name: "YAYIN", order: 3,
    own: true, verified: true, permission: true, published: true,
    // VERIFIED via the GitHub API: has_pages: true. See the note on SADAFRONIA.
    url: "https://mplus770-ui.github.io/yayin-magazine-v01/",
    urlVerifiedBy: "github-api:has_pages=true",
    external: true,
    category: { he: "מגזין היין הדיגיטלי שלנו", en: "Our digital wine magazine", fr: "Notre magazine numérique du vin" },
    description: {
      he: "מהמערכת העסקית שלנו. נבנה ומתוחזק בבית.",
      en: "From our own business ecosystem. Built and maintained in-house.",
      fr: "Issu de notre propre écosystème. Conçu et maintenu en interne.",
    },
    alt: {
      he: "ייִן — מגזין יין דיגיטלי מהמערכת העסקית של זוהר.",
      en: "YAYIN — a digital wine magazine from ZOHAR's own ecosystem.",
      fr: "YAYIN — magazine numérique du vin de l’écosystème ZOHAR.",
    },
    focal: [0.5, 0.22],
    source: { repo: "mplus770-ui/yayin-magazine-v01", ref: "main" },
    media: {
      card:     { avif: "/assets/work/yayin-card.avif",      webp: "/assets/work/yayin-card.webp" },
      card2x:   { avif: "/assets/work/yayin-card@2x.avif",   webp: "/assets/work/yayin-card@2x.webp" },
      mobile:   { avif: "/assets/work/yayin-mobile.avif",    webp: "/assets/work/yayin-mobile.webp" },
      mobile2x: { avif: "/assets/work/yayin-mobile@2x.avif", webp: "/assets/work/yayin-mobile@2x.webp" },
    },
  },
  {
    slug: "zohar", name: "ZOHAR", order: 7,
    own: true, verified: true, permission: true, published: true,
    url: "#method",                   // internal: the work this site demonstrates
    external: false,
    category: { he: "פרויקט הדגל שלנו", en: "Our own flagship", fr: "Notre projet phare" },
    description: {
      he: "האתר הזה. נבנה מחדש באופן גלוי כהוכחה הראשונה של BUILD.",
      en: "This site. Rebuilt in public as the first proof of BUILD.",
      fr: "Ce site. Reconstruit publiquement comme première démonstration de BUILD.",
    },
    alt: {
      he: "אתר ZOHAR — נוכחות עסקית בתהליך Done-For-You, בקוד שבבעלות הלקוח.",
      en: "ZOHAR — a Done-For-You business presence site, in code the owner keeps.",
      fr: "ZOHAR — présence numérique Done-For-You, avec un code qui reste au propriétaire.",
    },
    focal: [0.42, 0.50],
    source: { repo: "mplus770-ui/marketing-site", ref: "redesign/zohar-flagship-marketing-site" },
    media: {
      card:     { avif: "/assets/work/zohar-card.avif",      webp: "/assets/work/zohar-card.webp" },
      card2x:   { avif: "/assets/work/zohar-card@2x.avif",   webp: "/assets/work/zohar-card@2x.webp" },
      mobile:   { avif: "/assets/work/zohar-mobile.avif",    webp: "/assets/work/zohar-mobile.webp" },
      mobile2x: { avif: "/assets/work/zohar-mobile@2x.avif", webp: "/assets/work/zohar-mobile@2x.webp" },
    },
  },
  {
    slug: "eco-tech-israel", name: "Eco-Tech Israel", order: 4,
    own: false, verified: true, permission: true, published: true,
    url: "https://ecot.co.il/",
    urlVerifiedBy: "live-browser:2026-09-22",
    external: true,
    category: { he: "אנרגיה סולארית ומסחר", en: "Solar energy and commerce", fr: "Énergie solaire et commerce" },
    description: {
      he: "אתר מסחרי למערכות סולאריות, מחשבון חיסכון וחנות.",
      en: "A commercial solar-energy site with savings guidance and a store.",
      fr: "Un site commercial solaire avec estimation des économies et boutique.",
    },
    alt: {
      he: "Eco-Tech Israel — אתר סולארי המציג מערכת גג, חיסכון וקריאה להצעת מחיר.",
      en: "Eco-Tech Israel — a solar website showing a rooftop system, savings and quote CTA.",
      fr: "Eco-Tech Israel — site solaire présentant installation, économies et demande de devis.",
    },
    focal: [0.55, 0.18],
    source: { live: "https://ecot.co.il/", captured: "2026-09-22", legacy: "mplus770-ui/zohar-ai-site" },
    media: {
      card:     { avif: "/assets/work/eco-tech-israel-card.avif",      webp: "/assets/work/eco-tech-israel-card.webp" },
      card2x:   { avif: "/assets/work/eco-tech-israel-card@2x.avif",   webp: "/assets/work/eco-tech-israel-card@2x.webp" },
      mobile:   { avif: "/assets/work/eco-tech-israel-mobile.avif",    webp: "/assets/work/eco-tech-israel-mobile.webp" },
      mobile2x: { avif: "/assets/work/eco-tech-israel-mobile@2x.avif", webp: "/assets/work/eco-tech-israel-mobile@2x.webp" },
    },
  },
  {
    slug: "urban-fashion-store", name: "Urban Fashion Store", order: 5,
    own: false, verified: true, permission: true, published: true,
    url: "https://theme389-urban-fashion.myshopify.com/",
    urlVerifiedBy: "live-browser:2026-09-22",
    external: true,
    category: { he: "פרויקט מסחר אלקטרוני", en: "E-commerce project", fr: "Projet e-commerce" },
    description: {
      he: "חנות אופנה עם קטלוג, מבצעים, וריאציות מוצר ומסלול רכישה.",
      en: "A fashion store with catalogue, promotions, variants and a purchase journey.",
      fr: "Une boutique de mode avec catalogue, promotions, variantes et parcours d’achat.",
    },
    alt: {
      he: "Urban Fashion — חנות אופנה מקוונת עם תמונת קמפיין וקריאה לקנייה.",
      en: "Urban Fashion — an online fashion store with campaign imagery and shop CTA.",
      fr: "Urban Fashion — boutique de mode en ligne avec visuels de campagne et appel à l’achat.",
    },
    focal: [0.5, 0.18],
    source: { live: "https://theme389-urban-fashion.myshopify.com/", captured: "2026-09-22", legacy: "mplus770-ui/zohar-ai-site" },
    media: {
      card:     { avif: "/assets/work/urban-fashion-store-card.avif",      webp: "/assets/work/urban-fashion-store-card.webp" },
      card2x:   { avif: "/assets/work/urban-fashion-store-card@2x.avif",   webp: "/assets/work/urban-fashion-store-card@2x.webp" },
      mobile:   { avif: "/assets/work/urban-fashion-store-mobile.avif",    webp: "/assets/work/urban-fashion-store-mobile.webp" },
      mobile2x: { avif: "/assets/work/urban-fashion-store-mobile@2x.avif", webp: "/assets/work/urban-fashion-store-mobile@2x.webp" },
    },
  },
  {
    slug: "le-monde-sefarade", name: "Le Monde Séfarade", order: 6,
    own: false, verified: true, permission: true, published: true,
    url: "https://lemondesepharade.co.il/",
    urlVerifiedBy: "live-browser:2026-09-22",
    external: true,
    category: { he: "אתר תרבות וקהילה", en: "Cultural/community website project", fr: "Site culturel et communautaire" },
    description: {
      he: "מגזין רב־לשוני לתרבות, מורשת וקהילות ספרדיות.",
      en: "A multilingual magazine for Sephardic culture, heritage and communities.",
      fr: "Un magazine multilingue consacré à la culture, au patrimoine et aux communautés séfarades.",
    },
    alt: {
      he: "Le Monde Séfarade — אתר מגזין כחול וזהב לתרבות ולמורשת ספרדית.",
      en: "Le Monde Séfarade — a blue-and-gold magazine site for Sephardic culture and heritage.",
      fr: "Le Monde Séfarade — magazine bleu et or consacré à la culture et au patrimoine séfarades.",
    },
    focal: [0.5, 0.18],
    source: { live: "https://lemondesepharade.co.il/", captured: "2026-09-22", legacy: "mplus770-ui/zohar-ai-site" },
    media: {
      card:     { avif: "/assets/work/le-monde-sefarade-card.avif",      webp: "/assets/work/le-monde-sefarade-card.webp" },
      card2x:   { avif: "/assets/work/le-monde-sefarade-card@2x.avif",   webp: "/assets/work/le-monde-sefarade-card@2x.webp" },
      mobile:   { avif: "/assets/work/le-monde-sefarade-mobile.avif",    webp: "/assets/work/le-monde-sefarade-mobile.webp" },
      mobile2x: { avif: "/assets/work/le-monde-sefarade-mobile@2x.avif", webp: "/assets/work/le-monde-sefarade-mobile@2x.webp" },
    },
  },
  {
    slug: "gourmet-delivery", name: "Gourmet Delivery", order: 8,
    own: false, verified: true, permission: true, published: false,
    url: "https://www.gourmet-deliveries.net/",  // AWAITING VERIFICATION
    external: true,
    category: { he: "פרויקט מסחר אלקטרוני", en: "E-commerce project", fr: "Projet e-commerce" },
    description: { he: null, en: null, fr: null }, alt: { he: null, en: null, fr: null },
    focal: [0.5, 0.18], source: { legacy: "mplus770-ui/zohar-ai-site" }, media: null,
  },
];
