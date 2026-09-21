// Verification of the APPROVED final host map.
//
// Simulates the rule chain and asserts the properties that matter:
//   · REDIRECT BUDGET — a canonical URL takes 0 redirects, every other
//     approved URL takes at most MAX_REDIRECTS (1). A two-hop chain FAILS.
//   · no chain loops (proved by a negative control, not merely by passing)
//   · Hebrew is never served on zohar-ai.com
//   · English is never served on www.zohar-ai.co.il
//   · path, query and trailing slash survive every hop
//   · each host advertises only its OWN sitemap, and every URL inside each
//     sitemap answers 200 on its canonical host with no redirect
//
// Nothing here touches DNS, a domain or a deployment.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { canonical, rules, hosts, MAX_REDIRECTS, sitemapByHost } from "../src/_data/hostMap.js";
import locales from "../src/_data/locales.js";

const WALK_LIMIT = 6; // walk far enough to SEE an over-budget chain and name it

// ── rule engine ────────────────────────────────────────────────────────────
function match(rule, host, pathname) {
  const w = rule.when;
  if (w.host && w.host !== host) return false;
  if (w.hostAny && !w.hostAny.includes(host)) return false;
  if (w.path && w.path !== pathname) return false;
  if (w.pathPrefix && !pathname.startsWith(w.pathPrefix)) return false;
  if (w.pathPrefixAny && !w.pathPrefixAny.some((p) => pathname.startsWith(p))) return false;
  return true;
}

function step(url, ruleset = rules) {
  const u = new URL(url);
  for (const r of ruleset) {
    if (!match(r, u.hostname, u.pathname)) continue;
    if (r.serve) {
      const locale = r.serve.localeFromPath ? u.pathname.split("/")[1] : r.serve.locale;
      return { done: true, url: u.toString(), locale, file: r.serve.file || null, rule: r.id };
    }
    let p = u.pathname;
    // stripLocale removes exactly the leading /xx/ segment and keeps the rest,
    // including the trailing slash: /en/ -> /, /en/work/ -> /work/.
    if (r.redirect.path === "stripLocale") p = "/" + p.split("/").slice(2).join("/");
    return { done: false, url: r.redirect.to + p + u.search, status: r.status, rule: r.id };
  }
  return { done: false, url: null, rule: "NO RULE MATCHED" };
}

function resolve(start, ruleset = rules) {
  const chain = [];
  const seen = new Set([start]);      // URLs already requested; a repeat is a loop
  let cur = start;
  for (let i = 0; i <= WALK_LIMIT; i++) {
    const s = step(cur, ruleset);
    chain.push({ from: cur, ...s });
    if (s.done) return { chain, final: s, hops: chain.filter((c) => !c.done).length };
    if (!s.url) return { chain, final: null, error: `no rule matched ${cur}` };
    if (seen.has(s.url))
      return { chain, final: null, error: `redirect loop: ${cur} -> ${s.url} (already visited)` };
    seen.add(s.url);
    cur = s.url;
  }
  return { chain, final: null, error: `exceeded ${WALK_LIMIT} hops from ${start}` };
}

const trail = (u) => new URL(u).pathname.endsWith("/");

// ── request cases ──────────────────────────────────────────────────────────
// [input, expected final URL, expected locale, expected redirect count]
const CASES = [
  // canonical URLs — must be 0 redirects
  ["https://www.zohar-ai.co.il/",              "https://www.zohar-ai.co.il/",          "he", 0],
  ["https://zohar-ai.com/",                    "https://zohar-ai.com/",                "en", 0],
  ["https://zohar-ai.com/fr/",                 "https://zohar-ai.com/fr/",             "fr", 0],
  // hostname normalisation only — 1 redirect
  ["https://zohar-ai.co.il/",                  "https://www.zohar-ai.co.il/",          "he", 1],
  ["https://zohar-ai.co.il/about/?a=1",        "https://www.zohar-ai.co.il/about/?a=1","he", 1],
  ["https://www.zohar-ai.com/",                "https://zohar-ai.com/",                "en", 1],
  ["https://www.zohar-ai.com/fr/",             "https://zohar-ai.com/fr/",             "fr", 1],
  // locale transfer from the APEX of the Hebrew domain — must NOT normalise first
  ["https://zohar-ai.co.il/en/",               "https://zohar-ai.com/",                "en", 1],
  ["https://zohar-ai.co.il/en/work?a=1",       "https://zohar-ai.com/work?a=1",        "en", 1],
  ["https://zohar-ai.co.il/en/work/?a=1",      "https://zohar-ai.com/work/?a=1",       "en", 1],
  ["https://zohar-ai.co.il/de/x?q=2",          "https://zohar-ai.com/de/x?q=2",        "de", 1],
  // locale transfer from www on the Hebrew domain
  ["https://www.zohar-ai.co.il/en/",           "https://zohar-ai.com/",                "en", 1],
  ["https://www.zohar-ai.co.il/fr/",           "https://zohar-ai.com/fr/",             "fr", 1],
  ["https://www.zohar-ai.co.il/de/x?q=2",      "https://zohar-ai.com/de/x?q=2",        "de", 1],
  // locale transfer from www on the international domain — must NOT normalise first
  ["https://www.zohar-ai.com/he/",             "https://www.zohar-ai.co.il/",          "he", 1],
  ["https://www.zohar-ai.com/he/about?z=3",    "https://www.zohar-ai.co.il/about?z=3", "he", 1],
  ["https://www.zohar-ai.com/he/about/?z=3",   "https://www.zohar-ai.co.il/about/?z=3","he", 1],
  ["https://zohar-ai.com/he/",                 "https://www.zohar-ai.co.il/",          "he", 1],
  // duplicate-path folding: /en/ is not canonical on .com, /he/ is not on .co.il
  ["https://zohar-ai.com/en/",                 "https://zohar-ai.com/",                "en", 1],
  ["https://zohar-ai.com/en/work?a=1",         "https://zohar-ai.com/work?a=1",        "en", 1],
  ["https://www.zohar-ai.com/en/",             "https://zohar-ai.com/",                "en", 1],
  ["https://www.zohar-ai.co.il/he/",           "https://www.zohar-ai.co.il/",          "he", 1],
  ["https://zohar-ai.co.il/he/about?z=3",      "https://www.zohar-ai.co.il/about?z=3", "he", 1],
];

let fail = 0;
const row = (s) => console.log(s);
console.log("── final host map ──");
console.log("  redirects  request                                   result");
for (const [input, expectUrl, expectLocale, expectHops] of CASES) {
  const { final, error, hops } = resolve(input);
  if (error) { console.error(`FAIL ${input}\n     ${error}`); fail++; continue; }
  const problems = [];
  if (final.url !== expectUrl) problems.push(`got ${final.url}, want ${expectUrl}`);
  if (final.locale !== expectLocale) problems.push(`locale ${final.locale}, want ${expectLocale}`);
  if (hops !== expectHops) problems.push(`${hops} redirect(s), want ${expectHops}`);
  if (hops > MAX_REDIRECTS) problems.push(`OVER BUDGET — max is ${MAX_REDIRECTS}`);
  if (trail(input) !== trail(final.url)) problems.push(`trailing slash changed`);
  if (problems.length) { console.error(`FAIL ${input}\n     ${problems.join("\n     ")}`); fail++; continue; }
  row(`  ${String(hops).padStart(5)}      ${input.padEnd(42)} ${final.url} [${final.locale}]`);
}

// ── invariants ─────────────────────────────────────────────────────────────
const inv = [];
for (const [input] of CASES) {
  const { final, hops } = resolve(input);
  if (!final) continue;
  const h = new URL(final.url).hostname;
  if (h === "zohar-ai.com" && final.locale === "he") inv.push(`Hebrew served on ${h} (${input})`);
  if (h === "www.zohar-ai.co.il" && final.locale !== "he") inv.push(`non-Hebrew (${final.locale}) served on ${h} (${input})`);
  if (hops > MAX_REDIRECTS) inv.push(`${input} takes ${hops} redirects, budget is ${MAX_REDIRECTS}`);
  const q1 = new URL(input).search, q2 = new URL(final.url).search;
  if (q1 && q1 !== q2) inv.push(`query lost: ${input} -> ${final.url}`);
}
for (const h of hosts) {
  if (!rules.some((r) => r.when.host === h || (r.when.hostAny || []).includes(h)))
    inv.push(`host has no rule: ${h}`);
}
// A canonical must answer 200 on its own host, with zero redirects.
for (const l of locales.filter((l) => l.ready)) {
  const url = (l.origin === "he" ? canonical.he : canonical.international) + l.canonicalPath;
  const { final, hops } = resolve(url);
  if (!final) { inv.push(`canonical ${url} does not resolve to a served page`); continue; }
  if (hops !== 0) inv.push(`canonical ${url} takes ${hops} redirect(s) — a canonical must take 0`);
  if (final.locale !== l.code) inv.push(`canonical ${url} serves ${final.locale}, expected ${l.code}`);
}
// Hostname normalisation must never precede a locale transfer: no chain may
// both normalise and transfer.
for (const [input] of CASES) {
  const { chain } = resolve(input);
  const ids = chain.filter((c) => !c.done).map((c) => c.rule);
  const normalised = ids.some((i) => i === "coil-apex-to-www" || i === "com-www-to-apex");
  const transferred = ids.some((i) => i.includes("-to-com") || i.includes("-to-coil") || i.includes("-to-root"));
  if (normalised && transferred)
    inv.push(`${input} normalises the hostname AND transfers the locale: ${ids.join(" -> ")}`);
}

console.log("\n── invariants ──");
if (inv.length) { inv.forEach((i) => console.error("FAIL " + i)); fail += inv.length; }
else console.log(`  ok  canonical URLs take 0 redirects; every other approved URL takes <= ${MAX_REDIRECTS}\n` +
                 "  ok  no chain normalises the hostname before transferring the locale\n" +
                 "  ok  no Hebrew on .com, no English on .co.il\n" +
                 "  ok  path, query and trailing slash preserved; every approved host covered by a rule");

// ── sitemap / robots host check ────────────────────────────────────────────
// Needs real build output, so this runs its own production build in a scratch
// directory. dist/ is untouched.
console.log("\n── sitemap host check ──");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "zohar-hostmap-"));
try {
  execFileSync("npx", ["@11ty/eleventy", "--quiet", `--output=${out}`], {
    stdio: "pipe",
    env: { ...process.env, VERCEL_ENV: "production",
           ZOHAR_ORIGIN_HE: canonical.he, ZOHAR_ORIGIN_INTL: canonical.international },
  });
} catch (e) {
  console.error("FAIL production build did not complete\n" + String(e.stderr || e.message));
  fs.rmSync(out, { recursive: true, force: true });
  process.exit(1);
}

const sm = [];
for (const [host, cfg] of Object.entries(sitemapByHost)) {
  const robotsFile = path.join(out, cfg.robots.replace(/^\//, ""));
  if (!fs.existsSync(robotsFile)) { sm.push(`${host}: ${cfg.robots} was not built`); continue; }
  const robots = fs.readFileSync(robotsFile, "utf8");

  // The host's robots must advertise its own sitemap and only its own.
  if (!robots.includes(`Sitemap: `) || !robots.includes(cfg.advertises))
    sm.push(`${host}: ${cfg.robots} does not advertise ${cfg.advertises}`);
  if (robots.includes(cfg.forbids))
    sm.push(`${host}: ${cfg.robots} advertises ${cfg.forbids}, which belongs to the other host`);
  const advertised = [...robots.matchAll(/^Sitemap:\s*(\S+)$/gm)].map((m) => m[1]);
  if (advertised.length !== 1)
    sm.push(`${host}: ${cfg.robots} advertises ${advertised.length} sitemaps, expected exactly 1`);
  for (const a of advertised)
    if (new URL(a).hostname !== host)
      sm.push(`${host}: advertises ${a}, which is not on this host`);

  // The routing map must actually serve that robots file on that host.
  const served = resolve(`https://${host}/robots.txt`);
  const servedFile = served.final?.file || "/robots.txt";
  if (served.hops !== 0 || servedFile !== cfg.robots)
    sm.push(`${host}: /robots.txt resolves to ${servedFile} after ${served.hops} redirect(s), expected ${cfg.robots} with 0`);

  // Every URL inside that host's sitemap must be a 0-redirect 200 on this host.
  const smFile = path.join(out, cfg.advertises.replace(/^\//, ""));
  const locs = [...fs.readFileSync(smFile, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!locs.length) sm.push(`${host}: ${cfg.advertises} lists no URLs`);
  for (const u of locs) {
    if (new URL(u).hostname !== host) { sm.push(`${host}: ${cfg.advertises} lists ${u}, a URL on another host`); continue; }
    const r = resolve(u);
    if (!r.final || r.hops !== 0)
      sm.push(`${host}: ${u} in ${cfg.advertises} takes ${r.hops ?? "?"} redirect(s) — a sitemap URL must be a direct 200`);
  }
  // Held locales must appear in no sitemap.
  for (const l of locales.filter((l) => !l.ready))
    if (fs.readFileSync(smFile, "utf8").includes(l.canonicalPath))
      sm.push(`${host}: held locale ${l.code} appears in ${cfg.advertises}`);

  console.log(`  ${host.padEnd(20)} ${cfg.robots.padEnd(15)} advertises ${cfg.advertises.padEnd(16)} ${locs.length} URL(s), all 0-redirect 200`);
}
fs.rmSync(out, { recursive: true, force: true });
if (sm.length) { sm.forEach((i) => console.error("FAIL " + i)); fail += sm.length; }
else console.log("  ok  neither sitemap is advertised by the wrong host; no held locale appears in either");

// ── negative control ───────────────────────────────────────────────────────
// The loop guard must actually fire. A deliberately circular rule pair, never
// part of the approved map, has to be caught rather than resolved.
console.log("\n── loop guard (negative control) ──");
const LOOPING = [
  { id: "a-to-b", when: { host: "a.example" }, redirect: { to: "https://b.example", path: "keep" }, status: 301 },
  { id: "b-to-a", when: { host: "b.example" }, redirect: { to: "https://a.example", path: "keep" }, status: 301 },
];
const control = resolve("https://a.example/", LOOPING);
if (control.final || !/redirect loop/.test(control.error || "")) {
  console.error(`FAIL loop guard did not fire: ${control.error || control.final?.url}`); fail++;
} else {
  console.log(`  ok  guard fires on a circular pair — ${control.error}`);
}

if (fail) { console.error(`\nhost map: FAILED (${fail})`); process.exit(1); }
console.log(`\nhost map: PASS — ${CASES.length} cases, every canonical 0 redirects, every other URL <= ${MAX_REDIRECTS},` +
            `\n          per-host sitemaps verified, loop guard proved to fire`);
