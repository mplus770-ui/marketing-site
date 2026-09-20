// The single source of truth for what ZOHAR sells today.
// Only `public: true` tiers may be rendered with a figure. Nothing with a
// status other than "now" may carry a price or a purchase path.
export default {
  currency: "ILS",
  // ── Entry tier — the only figure shown publicly ──────────────────────
  entry: {
    id: "focused", status: "now", public: true, priceApproved: true,
    from: 4900,
    includes: [
      "pages", "oneLanguage", "design", "responsive", "aiCopy", "seoAeo",
      "contact", "analyticsReady", "domain", "ownership", "revisions",
      "hosting", "ssl", "backup",
    ],
    excludes: ["domainPurchase", "businessEmail", "store", "translation",
               "logo", "media", "ongoing", "unlimitedRevisions", "thirdParty", "maintenance"],
    terms: ["split", "revisionScope", "extraRevision", "outOfScope", "hostingFair", "renewal"],
  },
  // ── Internal architecture. NOT rendered with figures. ────────────────
  tiers: [
    { id: "premium", status: "now", public: false, from: 7900 },
    { id: "tailored", status: "now", public: false, from: null },
  ],
  // In development — no price, no purchase control, no link.
  future: [
    { id: "build",   status: "development", roadmap: null  },
    { id: "connect", status: "development", roadmap: "V12" },
    { id: "growth",  status: "development", roadmap: "V13" },
    { id: "memory",  status: "vision",      roadmap: "V14" },
  ],
  pillars: [
    { id: "build",  status: "now" },
    { id: "grow",   status: "foundation", roadmap: "V13" },
    { id: "prove",  status: "foundation", roadmap: "V12" },
    { id: "memory", status: "vision",     roadmap: "V14" },
  ],
};
