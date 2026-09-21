// Publication-surface gate.
//
// A held locale (ready: false) is a placeholder, not a publication surface. It
// must carry the full noindex block and NONE of the signals that tell a crawler
// or a social scraper that a page is publishable: no canonical, no hreflang, no
// og:url, no og:image, no structured data.
//
// A published locale must carry all of them, on its own approved origin.
//
// The gate runs its own production build into a scratch directory so the result
// does not depend on how the caller happened to build. It touches nothing in
// dist/ and nothing outside the repo.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import locales from "../src/_data/locales.js";
import { canonical } from "../src/_data/hostMap.js";

const out = fs.mkdtempSync(path.join(os.tmpdir(), "zohar-pubsurface-"));
try {
  execFileSync("npx", ["@11ty/eleventy", "--quiet", `--output=${out}`], {
    stdio: "pipe",
    env: {
      ...process.env,
      VERCEL_ENV: "production",
      ZOHAR_ORIGIN_HE: canonical.he,
      ZOHAR_ORIGIN_INTL: canonical.international,
    },
  });
} catch (e) {
  console.error("PUBLICATION SURFACE FAILED: the production build did not complete\n" +
    String(e.stderr || e.stdout || e.message));
  fs.rmSync(out, { recursive: true, force: true });
  process.exit(1);
}

const SIGNALS = {
  canonical: /<link rel="canonical"/,
  hreflang: /<link rel="alternate" hreflang=/,
  "og:url": /<meta property="og:url"/,
  "og:image": /<meta property="og:image"/,
  "ld+json": /application\/ld\+json/,
};
const INDEXABLE = /<meta name="robots" content="index,follow/;
const NOINDEX = /<meta name="robots" content="noindex,nofollow,noarchive,nosnippet">/;

const bad = [];
const rows = [];
for (const loc of locales) {
  const file = path.join(out, loc.buildPath.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(file)) { bad.push(`${loc.code}: ${file} was not built`); continue; }
  const html = fs.readFileSync(file, "utf8");
  const present = Object.entries(SIGNALS).filter(([, re]) => re.test(html)).map(([k]) => k);

  if (loc.ready) {
    if (!INDEXABLE.test(html)) bad.push(`${loc.code} is published but is not index,follow`);
    for (const k of Object.keys(SIGNALS))
      if (!present.includes(k)) bad.push(`${loc.code} is published but emits no ${k}`);
    const want = (loc.origin === "he" ? canonical.he : canonical.international) + loc.canonicalPath;
    if (!html.includes(`<link rel="canonical" href="${want}">`))
      bad.push(`${loc.code} canonical is not ${want}`);
  } else {
    if (!NOINDEX.test(html)) bad.push(`${loc.code} is held but is not fully noindex`);
    for (const k of present) bad.push(`${loc.code} is HELD but emits ${k} — a held locale is not a publication surface`);
  }
  rows.push(`  ${loc.code.padEnd(3)} ${(loc.ready ? "published" : "held").padEnd(10)} ${present.length ? present.join(", ") : "no publication signals"}`);
}

// A held locale must also never appear in a sitemap or in any hreflang set.
const sitemaps = ["sitemap.xml", "sitemap-he.xml"].map((f) => path.join(out, f));
const heads = locales.filter((l) => l.ready)
  .map((l) => fs.readFileSync(path.join(out, l.buildPath.replace(/^\//, ""), "index.html"), "utf8"));
for (const loc of locales.filter((l) => !l.ready)) {
  for (const sm of sitemaps)
    if (fs.existsSync(sm) && fs.readFileSync(sm, "utf8").includes(loc.canonicalPath))
      bad.push(`held locale ${loc.code} appears in ${path.basename(sm)}`);
  for (const h of heads)
    if (new RegExp(`hreflang="${loc.hreflang}"`).test(h))
      bad.push(`held locale ${loc.code} appears in a published page's hreflang set`);
}

fs.rmSync(out, { recursive: true, force: true });

console.log("── publication surface ──");
rows.forEach((r) => console.log(r));
if (bad.length) { console.error("\nPUBLICATION SURFACE FAILED:\n  " + bad.join("\n  ")); process.exit(1); }
console.log(`\npublication surface: PASS — ${locales.filter((l) => l.ready).length} published locale(s) carry every signal on their own origin; ` +
  `${locales.filter((l) => !l.ready).length} held locale(s) carry none and appear in no sitemap and in no hreflang set.`);
