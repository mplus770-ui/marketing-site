// ZOHAR — central site configuration.
// Values that have NOT been explicitly supplied stay null on purpose. Templates
// check before rendering: an unset destination becomes inert text, never a
// broken active link. Nothing here is a secret.
export default {
  brand: "ZOHAR",           // visible brand
  legalName: "ZOHAR AI",    // company + schema name

  // ── Approved public contact ─────────────────────────────────────────
  whatsapp: "972555626040",        // E.164, approved for public display
  whatsappDisplay: "055-562-6040", // display form
  email: "support@zoharai.com",    // approved public address

  // ── Not yet supplied ────────────────────────────────────────────────
  // Set ZOHAR_ORIGIN in the environment to switch the canonical surface on.
  // Until then no canonical, hreflang, sitemap or JSON-LD is emitted at all —
  // a guessed canonical is worse than none.
  origin: process.env.ZOHAR_ORIGIN || null,
  legalEntity: null,        // registered entity — NOT to be inferred
  address: null,            // NOT to be inferred
  country: null,
  areaServed: null,         // service area — awaiting decision
  responseTime: null,       // response-time promise — awaiting decision
  formEndpoint: null,       // optional future CRM endpoint; current brief hands off locally to WhatsApp/email
  schedulerUrl: null,       // consultation booking
  social: [],               // sameAs profiles
  founded: null,
};
