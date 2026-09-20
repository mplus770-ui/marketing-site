// PROOF RULE — only work ZOHAR owns or is explicitly permitted to display.
// `verified` gates rendering; `permission` gates a client-owned project.
// A project with media:null renders a clearly labelled internal placeholder on
// the protected preview and is dropped entirely from a production build.
export default [
  {
    slug: "zohar", name: "ZOHAR", verified: true, permission: true,
    own: true, media: null, url: null,
    sector: { he: "פרויקט הדגל שלנו", en: "Our own flagship" },
    note:   { he: "האתר הזה. נבנה מחדש באופן גלוי כהוכחה הראשונה של BUILD.",
              en: "This site. Rebuilt in public as the first proof of BUILD." },
  },
  {
    slug: "sadafronia", name: "SADAFRONIA", verified: true, permission: true,
    own: false, media: null, url: null,
    sector: { he: "תחום לאישור", en: "Sector to confirm" },
    note:   { he: "נבנה על ידי זוהר. התיאור וכל שורת תוצאה ממתינים לאישור.",
              en: "Built by ZOHAR. Description and any result line pending confirmation." },
  },
  {
    slug: "yayin", name: "YAYIN", verified: true, permission: true,
    own: false, media: null, url: null,
    sector: { he: "תחום לאישור", en: "Sector to confirm" },
    note:   { he: "נבנה על ידי זוהר. התיאור וכל שורת תוצאה ממתינים לאישור.",
              en: "Built by ZOHAR. Description and any result line pending confirmation." },
  },
  // Better World — display permission NOT yet confirmed, so it does not render.
  {
    slug: "better-world", name: "Better World", verified: true, permission: false,
    own: false, media: null, url: null,
    sector: { he: "", en: "" }, note: { he: "", en: "" },
  },
];
