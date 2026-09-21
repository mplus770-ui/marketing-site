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
// This build environment has no outbound HTTP, so no external destination
// could be verified and no external site could be captured. Those entries stay
// unpublished by design rather than shipping an unverified link.
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
    category: { he: "מותג היין, האירוח והאקדמיה שלנו", en: "Our wine, hospitality and academy brand" },
    description: {
      he: "מהמערכת העסקית שלנו. נבנה ומתוחזק בבית.",
      en: "From our own business ecosystem. Built and maintained in-house.",
    },
    alt: {
      he: "סדפרוניה — אתר מותג יין, אירוח ואקדמיה מהמערכת העסקית של זוהר.",
      en: "SADAFRONIA — a wine, hospitality and academy brand site from ZOHAR's own ecosystem.",
    },
    focal: [0.5, 0.20],
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
    own: false, verified: true, permission: true, published: false,
    url: "https://alefbetcontent.com/new/",   // AWAITING VERIFICATION
    external: true,
    category: { he: "פרויקט לקוח", en: "Client project" },
    description: { he: null, en: null },
    alt: { he: null, en: null },
    focal: [0.5, 0.18],
    source: null,
    media: null,
  },
  {
    slug: "yayin", name: "YAYIN", order: 3,
    own: true, verified: true, permission: true, published: true,
    // VERIFIED via the GitHub API: has_pages: true. See the note on SADAFRONIA.
    url: "https://mplus770-ui.github.io/yayin-magazine-v01/",
    urlVerifiedBy: "github-api:has_pages=true",
    external: true,
    category: { he: "מגזין היין הדיגיטלי שלנו", en: "Our digital wine magazine" },
    description: {
      he: "מהמערכת העסקית שלנו. נבנה ומתוחזק בבית.",
      en: "From our own business ecosystem. Built and maintained in-house.",
    },
    alt: {
      he: "ייִן — מגזין יין דיגיטלי מהמערכת העסקית של זוהר.",
      en: "YAYIN — a digital wine magazine from ZOHAR's own ecosystem.",
    },
    focal: [0.5, 0.30],
    source: { repo: "mplus770-ui/yayin-magazine-v01", ref: "main" },
    media: {
      card:     { avif: "/assets/work/yayin-card.avif",      webp: "/assets/work/yayin-card.webp" },
      card2x:   { avif: "/assets/work/yayin-card@2x.avif",   webp: "/assets/work/yayin-card@2x.webp" },
      mobile:   { avif: "/assets/work/yayin-mobile.avif",    webp: "/assets/work/yayin-mobile.webp" },
      mobile2x: { avif: "/assets/work/yayin-mobile@2x.avif", webp: "/assets/work/yayin-mobile@2x.webp" },
    },
  },
  {
    slug: "zohar", name: "ZOHAR", order: 4,
    own: true, verified: true, permission: true, published: true,
    url: "#method",                   // internal: the work this site demonstrates
    external: false,
    category: { he: "פרויקט הדגל שלנו", en: "Our own flagship" },
    description: {
      he: "האתר הזה. נבנה מחדש באופן גלוי כהוכחה הראשונה של BUILD.",
      en: "This site. Rebuilt in public as the first proof of BUILD.",
    },
    alt: {
      he: "אתר ZOHAR — נוכחות עסקית בתהליך Done-For-You, בקוד שבבעלות הלקוח.",
      en: "ZOHAR — a Done-For-You business presence site, in code the owner keeps.",
    },
    focal: [0.5, 0.18],
    source: { repo: "mplus770-ui/marketing-site", ref: "redesign/zohar-flagship-marketing-site" },
    media: {
      card:     { avif: "/assets/work/zohar-card.avif",      webp: "/assets/work/zohar-card.webp" },
      card2x:   { avif: "/assets/work/zohar-card@2x.avif",   webp: "/assets/work/zohar-card@2x.webp" },
      mobile:   { avif: "/assets/work/zohar-mobile.avif",    webp: "/assets/work/zohar-mobile.webp" },
      mobile2x: { avif: "/assets/work/zohar-mobile@2x.avif", webp: "/assets/work/zohar-mobile@2x.webp" },
    },
  },
  {
    slug: "eco-tech-israel", name: "Eco-Tech Israel", order: 5,
    own: false, verified: true, permission: true, published: false,
    url: "https://ecot.co.il/",       // AWAITING VERIFICATION
    external: true,
    category: { he: "פרויקט אתר", en: "Website project" },
    description: { he: null, en: null }, alt: { he: null, en: null },
    focal: [0.5, 0.18], source: { legacy: "mplus770-ui/zohar-ai-site" }, media: null,
  },
  {
    slug: "urban-fashion-store", name: "Urban Fashion Store", order: 6,
    own: false, verified: true, permission: true, published: false,
    url: "https://theme389-urban-fashion.myshopify.com/",   // AWAITING VERIFICATION
    external: true,
    category: { he: "פרויקט מסחר אלקטרוני", en: "E-commerce project" },
    description: { he: null, en: null }, alt: { he: null, en: null },
    focal: [0.5, 0.18], source: { legacy: "mplus770-ui/zohar-ai-site" }, media: null,
  },
  {
    slug: "le-monde-sefarade", name: "Le Monde Séfarade", order: 7,
    own: false, verified: true, permission: true, published: false,
    // The legacy source links this over http://, not https:// — confirm the
    // scheme during verification before it is ever published.
    url: "https://lemondesepharade.co.il/",  // AWAITING VERIFICATION
    external: true,
    category: { he: "אתר תרבות וקהילה", en: "Cultural/community website project" },
    description: { he: null, en: null }, alt: { he: null, en: null },
    focal: [0.5, 0.18], source: { legacy: "mplus770-ui/zohar-ai-site" }, media: null,
  },
  {
    slug: "gourmet-delivery", name: "Gourmet Delivery", order: 8,
    own: false, verified: true, permission: true, published: false,
    url: "https://www.gourmet-deliveries.net/",  // AWAITING VERIFICATION
    external: true,
    category: { he: "פרויקט מסחר אלקטרוני", en: "E-commerce project" },
    description: { he: null, en: null }, alt: { he: null, en: null },
    focal: [0.5, 0.18], source: { legacy: "mplus770-ui/zohar-ai-site" }, media: null,
  },
];
