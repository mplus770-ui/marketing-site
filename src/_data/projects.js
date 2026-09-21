// PROOF RULE — only work ZOHAR owns or is explicitly permitted to display.
//   own        : part of the ZOHAR business ecosystem (not external client work)
//   verified   : confirmed as genuine ZOHAR work
//   permission : cleared for public display
//   media      : null until real locally-stored captures exist. A project with
//                null media renders a labelled internal placeholder on a
//                preview build and is dropped entirely from production.
//   source     : the repository each capture was taken from. These were captured
//                from the user's own committed source served locally, NOT from
//                the live domain — this environment has no outbound web access.
//                See the deviation note in docs/project-media-spec.md.
// See docs/project-media-spec.md for the capture and export specification.
export default [
  {
    slug: "zohar", name: "ZOHAR",
    own: true, verified: true, permission: true,
    url: null,
    alt: {
      he: "אתר ZOHAR — נוכחות עסקית בתהליך Done-For-You, בקוד שבבעלות הלקוח.",
      en: "ZOHAR — a Done-For-You business presence site, in code the owner keeps.",
    },
    media: {
      card:     { avif: "/assets/work/zohar-card.avif",      webp: "/assets/work/zohar-card.webp" },
      card2x:   { avif: "/assets/work/zohar-card@2x.avif",   webp: "/assets/work/zohar-card@2x.webp" },
      mobile:   { avif: "/assets/work/zohar-mobile.avif",    webp: "/assets/work/zohar-mobile.webp" },
      mobile2x: { avif: "/assets/work/zohar-mobile@2x.avif", webp: "/assets/work/zohar-mobile@2x.webp" },
    },
    focal: [0.5, 0.18],
    source: { repo: "mplus770-ui/marketing-site", ref: "redesign/zohar-flagship-marketing-site" },
    category: { he: "פרויקט הדגל שלנו", en: "Our own flagship" },
    description: {
      he: "האתר הזה. נבנה מחדש באופן גלוי כהוכחה הראשונה של BUILD.",
      en: "This site. Rebuilt in public as the first proof of BUILD.",
    },
  },
  {
    slug: "sadafronia", name: "SADAFRONIA",
    own: true, verified: true, permission: true,
    url: null,
    alt: {
      he: "סדפרוניה — אתר מותג יין, אירוח ואקדמיה מהמערכת העסקית של זוהר.",
      en: "SADAFRONIA — a wine, hospitality and academy brand site from ZOHAR's own ecosystem.",
    },
    media: {
      card:     { avif: "/assets/work/sadafronia-card.avif",      webp: "/assets/work/sadafronia-card.webp" },
      card2x:   { avif: "/assets/work/sadafronia-card@2x.avif",   webp: "/assets/work/sadafronia-card@2x.webp" },
      mobile:   { avif: "/assets/work/sadafronia-mobile.avif",    webp: "/assets/work/sadafronia-mobile.webp" },
      mobile2x: { avif: "/assets/work/sadafronia-mobile@2x.avif", webp: "/assets/work/sadafronia-mobile@2x.webp" },
    },
    focal: [0.5, 0.20],
    source: { repo: "mplus770-ui/sadafronia-website", ref: "main" },
    category: { he: "מותג יין, אירוח ואקדמיה", en: "Wine, hospitality and academy brand" },
    description: {
      he: "מהמערכת העסקית שלנו. נבנה ומתוחזק בבית.",
      en: "From our own business ecosystem. Built and maintained in-house.",
    },
  },
  {
    slug: "yayin", name: "YAYIN",
    own: true, verified: true, permission: true,
    url: null,
    alt: {
      he: "ייִן — מגזין יין דיגיטלי מהמערכת העסקית של זוהר.",
      en: "YAYIN — a digital wine magazine from ZOHAR's own ecosystem.",
    },
    media: {
      card:     { avif: "/assets/work/yayin-card.avif",      webp: "/assets/work/yayin-card.webp" },
      card2x:   { avif: "/assets/work/yayin-card@2x.avif",   webp: "/assets/work/yayin-card@2x.webp" },
      mobile:   { avif: "/assets/work/yayin-mobile.avif",    webp: "/assets/work/yayin-mobile.webp" },
      mobile2x: { avif: "/assets/work/yayin-mobile@2x.avif", webp: "/assets/work/yayin-mobile@2x.webp" },
    },
    focal: [0.5, 0.30],
    source: { repo: "mplus770-ui/yayin-magazine-v01", ref: "main" },
    category: { he: "מגזין יין דיגיטלי", en: "Digital wine magazine" },
    description: {
      he: "מהמערכת העסקית שלנו. נבנה ומתוחזק בבית.",
      en: "From our own business ecosystem. Built and maintained in-house.",
    },
  },
  // Better World — display permission NOT confirmed. It does not render, and no
  // capture may be taken until permission is granted.
  {
    slug: "better-world", name: "Better World",
    own: false, verified: true, permission: false,
    url: null, media: null, alt: { he: null, en: null },
    category: { he: "", en: "" }, description: { he: "", en: "" },
  },
];
