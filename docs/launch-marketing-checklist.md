# ZOHAR launch and marketing checklist

This is the operating checklist for the two approved public hosts:

- Hebrew / Israel: `https://www.zohar-ai.co.il/`
- English / international: `https://zohar-ai.com/`

The language switch is explicit. There is no IP- or geolocation-based redirect.

## Before domain attachment

- Export the complete current DNS zones and record the legacy hosting targets.
- Preserve every mail-related record, especially MX, SPF, DKIM, DMARC and
  autodiscover. `zoharai.com` is the mail domain and is not a website origin.
- Verify TLS eligibility for the apex and `www` form of both website domains.
- Re-capture every externally hosted portfolio destination from the live site
  and verify each outbound link immediately before launch.
- Keep analytics, advertising pixels and form delivery disabled until the
  measurement IDs, consent behavior and privacy handling are approved.

## Cutover configuration

- Attach both hostname forms of each website domain to the Vercel project.
- Use only the DNS targets displayed by Vercel for this project at cutover.
- Set `ZOHAR_ORIGIN_HE=https://www.zohar-ai.co.il` and
  `ZOHAR_ORIGIN_INTL=https://zohar-ai.com` only after both hosts validate.
- Apply the reviewed host map so every non-canonical request reaches its final
  locale and canonical hostname in no more than one redirect.
- Do not set a preview or `vercel.app` host as an origin; the build guard must
  continue to fail if one is supplied.

## Search launch

- Verify separate Google Search Console Domain properties for `zohar-ai.co.il`
  and `zohar-ai.com` using DNS TXT verification.
- Submit `/sitemap-he.xml` from the Hebrew property and `/sitemap.xml` from the
  international property. Do not cross-submit them.
- Inspect each canonical homepage after launch and confirm Google sees the same
  user-declared canonical that the page, redirect map and sitemap declare.
- Confirm the reciprocal `he-IL`, `en` and `x-default` hreflang set on both
  published pages. The seven held locales must remain absent from canonical,
  hreflang, Open Graph, schema and both sitemaps.
- Request indexing only after the canonical hosts return 200 and all alternate
  hostname/locale combinations return their reviewed 301.

## Sharing launch

- Test the 1200×630 PNG card on Facebook Sharing Debugger and LinkedIn Post
  Inspector after the canonical hosts are public.
- Share each canonical URL in a fresh WhatsApp conversation and verify the
  image, title and description. Scrapers cache previews, so re-scrape after a
  meaningful metadata or image change.
- Use the canonical URL in campaigns and directory listings, never a preview
  URL. Keep campaign attribution in the link (for example approved UTM tags),
  not inside the WhatsApp message text.

## Conversion and measurement

- Keep WhatsApp (`972555626040`) and `support@zoharai.com` as the only active
  contact destinations until the brief endpoint and privacy handling exist.
- When measurement is approved, define the minimum event plan before adding a
  tag: primary WhatsApp click, email click, project-outbound click, brief start
  and completed form delivery. Do not report a submitted lead while the form is
  still intentionally disabled.
- Add analytics or advertising pixels only together with the necessary consent
  and privacy disclosure. No identifier is approved in the current build.
- Establish a weekly launch review: indexed canonical pages, sitemap status,
  Core Web Vitals, broken outbound links, WhatsApp clicks and qualified leads.

## Content growth after launch

- Publish only pages with a distinct buyer intent, real evidence, a clear CTA
  and an owner who can keep the content accurate.
- First expansion candidates are real project case studies and focused service
  pages. Do not mass-publish the seven held translations or city-name variants.
- Every case study needs permission, a verified live destination, real media,
  descriptive alt text and claims that can be supported.

## Rollback

- The exported legacy DNS targets are the rollback mechanism for the current
  live sites. A prior Vercel deployment can restore only a version of the new
  marketing site.
- On a cutover failure: restore the exact prior DNS records, wait one TTL,
  confirm the legacy HTTPS site, then detach the custom domains and unset both
  origin variables. Re-test `support@zoharai.com` after any DNS operation.
