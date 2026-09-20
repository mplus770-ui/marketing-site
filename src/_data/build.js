// Deployment context. Anything that is not a Vercel production build is
// noindex, belt and braces on top of Vercel's own preview x-robots-tag and the
// project's SSO protection.
const env = process.env.VERCEL_ENV || "development";
export default {
  env,
  isProduction: env === "production",
  indexable: env === "production",
  commit: (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7) || "local",
  builtAt: new Date().toISOString(),
};
