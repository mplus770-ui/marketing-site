// ZOHAR — central site configuration.
// Every business input that has NOT been supplied is null on purpose.
// Templates must check before rendering: a null destination renders as plain
// text, never as a broken active link. Nothing here is a secret.
export default {
  brand: "ZOHAR",           // visible brand
  legalName: "ZOHAR AI",    // company + schema name
  // ── Not yet supplied (decisions D3 / D11 / D7) ──────────────────────
  // Set ZOHAR_ORIGIN in the environment to switch the canonical surface on.
  // Until it is, no canonical, hreflang, sitemap or JSON-LD is emitted at all —
  // a relative or guessed canonical is worse than none.
  origin: process.env.ZOHAR_ORIGIN || null,
  email: null,              // business email on the brand domain
  whatsapp: null,           // E.164 digits only, e.g. "9725XXXXXXX"
  legalEntity: null,        // registered entity name
  country: null,            // e.g. "IL"
  areaServed: null,
  formEndpoint: null,       // project-brief endpoint — submissions are disabled until set
  schedulerUrl: null,       // consultation booking
  social: [],               // sameAs profiles
  founded: null,
};
