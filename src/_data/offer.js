// The single source of truth for what ZOHAR sells today.
// Only `public: true` tiers may be rendered with a figure. Nothing with a
// status other than "now" may carry a price or a purchase path.
export default {
  currency: "ILS",
  // ── Entry tier — the only figure shown publicly ──────────────────────
  entry: {
    id: "focused", status: "now", public: true, priceApproved: true,
    from: 4900,
    // Homepage-visible inclusions ONLY. The full inclusion list, the
    // exclusions and the commercial terms belong in the FAQ, the formal
    // proposal and the service agreement — not in the sales section.
    includes: [
      "pages", "oneLanguage", "design", "responsive",
      "seoAeo", "revisions", "hosting", "ownership",
    ],
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
