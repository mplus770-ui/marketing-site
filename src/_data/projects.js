// PROOF RULE — only work ZOHAR owns or is explicitly permitted to display.
//   own        : part of the ZOHAR business ecosystem (not external client work)
//   verified   : confirmed as genuine ZOHAR work
//   permission : cleared for public display
//   media      : null until real locally-stored captures exist. A project with
//                null media renders a labelled internal placeholder on a
//                preview build and is dropped entirely from production.
// See docs/project-media-spec.md for the capture and export specification.
export default [
  {
    slug: "zohar", name: "ZOHAR",
    own: true, verified: true, permission: true,
    url: null, media: null, alt: { he: null, en: null },
    category: { he: "פרויקט הדגל שלנו", en: "Our own flagship" },
    description: {
      he: "האתר הזה. נבנה מחדש באופן גלוי כהוכחה הראשונה של BUILD.",
      en: "This site. Rebuilt in public as the first proof of BUILD.",
    },
  },
  {
    slug: "sadafronia", name: "SADAFRONIA",
    own: true, verified: true, permission: true,
    url: null, media: null, alt: { he: null, en: null },
    category: { he: "מותג יין, אירוח ואקדמיה", en: "Wine, hospitality and academy brand" },
    description: {
      he: "מהמערכת העסקית שלנו. נבנה ומתוחזק בבית.",
      en: "From our own business ecosystem. Built and maintained in-house.",
    },
  },
  {
    slug: "yayin", name: "YAYIN",
    own: true, verified: true, permission: true,
    url: null, media: null, alt: { he: null, en: null },
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
