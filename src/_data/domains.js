// Two-market domain architecture.
//   he            → Israel / Hebrew canonical host
//   international → English + every future locale
// Both are null until the domains are verified and the cutover is approved.
// Nothing canonical, hreflang, schema or sitemap is emitted while they are null,
// and a preview host can never leak into a canonical because a preview URL is
// never a value here.
export default {
  he:            process.env.ZOHAR_ORIGIN_HE   || null, // https://zohar-ai.co.il
  international: process.env.ZOHAR_ORIGIN_INTL || null, // https://zohar-ai.com
};
