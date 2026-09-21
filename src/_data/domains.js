// Two-market domain architecture.
//   he            → Israel / Hebrew canonical host
//   international → English + every future locale
//
// Both are null until the domains are verified and the cutover is approved.
// While null the build emits no canonical, hreflang, schema or sitemap entry.
//
// HARD GUARD: an origin must be an absolute https:// URL on a real custom
// domain. A preview, vercel.app, localhost or http origin FAILS THE BUILD
// rather than silently publishing a wrong canonical. This is what makes
// "no preview URL may appear in canonical, hreflang, sitemap, OG or schema"
// a structural guarantee instead of a convention.
const FORBIDDEN = [/vercel\.app$/i, /^localhost$/i, /^127\./, /\.local$/i, /ngrok/i];

function check(value, label) {
  if (!value) return null;
  let u;
  try {
    u = new URL(value);
  } catch {
    throw new Error(`domains.${label}: "${value}" is not a valid URL`);
  }
  if (u.protocol !== "https:")
    throw new Error(`domains.${label}: must be https, got "${u.protocol}"`);
  if (u.pathname !== "/" || u.search || u.hash)
    throw new Error(`domains.${label}: must be a bare origin, got "${value}"`);
  if (FORBIDDEN.some((re) => re.test(u.hostname)))
    throw new Error(
      `domains.${label}: "${u.hostname}" is a preview or local host and must ` +
        `never become a canonical origin`
    );
  return u.origin;
}

export default {
  he:            check(process.env.ZOHAR_ORIGIN_HE,   "he"),            // e.g. https://www.zohar-ai.co.il
  international: check(process.env.ZOHAR_ORIGIN_INTL, "international"), // e.g. https://zohar-ai.com
};
