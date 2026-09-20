// The single source of truth for what ZOHAR sells today.
// status: "now" | "foundation" | "development" | "vision"
// Nothing with a status other than "now" may carry a price or a purchase path.
export default {
  primary: {
    id: "dfy", status: "now",
    price: { currency: "ILS", from: 2800, note: { he: "אתר תדמית. חנויות ומערכות מתומחרות בנפרד.", en: "Marketing site. Stores and systems quoted individually." } },
    includes: ["ownership", "endToEnd", "multilingual", "seoAeo", "conversion", "analyticsReady", "process"],
  },
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
