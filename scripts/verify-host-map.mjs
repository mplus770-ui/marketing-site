// Verification of the APPROVED final host map.
// Simulates the rule chain, then asserts the invariants that matter:
//   · every request terminates on a serving host within a hop limit (no loops)
//   · Hebrew is never served on zohar-ai.com
//   · English is never served on www.zohar-ai.co.il
//   · path and query survive every hop
//   · the served locale's canonical is on its own approved host
// Nothing here touches DNS, a domain or a deployment.
import { canonical, rules, hosts } from "../src/_data/hostMap.js";
import locales from "../src/_data/locales.js";

const MAX_HOPS = 4;

function match(rule, host, path) {
  const w = rule.when;
  if (w.host !== host) return false;
  if (w.pathPrefix && !path.startsWith(w.pathPrefix)) return false;
  if (w.pathPrefixAny && !w.pathPrefixAny.some((p) => path.startsWith(p))) return false;
  return true;
}

function step(url, ruleset = rules) {
  const u = new URL(url);
  for (const r of ruleset) {
    if (!match(r, u.hostname, u.pathname)) continue;
    if (r.serve) {
      let locale = r.serve.locale;
      if (r.serve.localeFromPath) locale = u.pathname.split("/")[1];
      return { done: true, url: u.toString(), locale, rule: r.id };
    }
    let path = u.pathname;
    if (r.redirect.path === "stripLocale") path = "/" + path.split("/").slice(2).join("/");
    return { done: false, url: r.redirect.to + path + u.search, status: r.status, rule: r.id };
  }
  return { done: false, url: null, rule: "NO RULE MATCHED" };
}

function resolve(start, ruleset = rules) {
  const chain = [];
  const seen = new Set([start]);   // URLs already requested; a repeat is a loop
  let cur = start;
  for (let i = 0; i <= MAX_HOPS; i++) {
    const s = step(cur, ruleset);
    chain.push({ from: cur, ...s });
    if (s.done) return { chain, final: s };
    if (!s.url) return { chain, final: null, error: `no rule matched ${cur}` };
    if (seen.has(s.url))
      return { chain, final: null, error: `redirect loop: ${cur} -> ${s.url} (already visited)` };
    seen.add(s.url);
    cur = s.url;
  }
  return { chain, final: null, error: `exceeded ${MAX_HOPS} hops from ${start}` };
}

const CASES = [
  ["https://zohar-ai.co.il/",                 "https://www.zohar-ai.co.il/",     "he"],
  ["https://zohar-ai.co.il/en/",              "https://zohar-ai.com/",           "en"],
  ["https://zohar-ai.co.il/en/work?a=1",      "https://zohar-ai.com/work?a=1",   "en"],
  ["https://www.zohar-ai.co.il/",             "https://www.zohar-ai.co.il/",     "he"],
  ["https://www.zohar-ai.co.il/en/",          "https://zohar-ai.com/",           "en"],
  ["https://www.zohar-ai.co.il/fr/",          "https://zohar-ai.com/fr/",        "fr"],
  ["https://www.zohar-ai.co.il/de/x?q=2",     "https://zohar-ai.com/de/x?q=2",   "de"],
  ["https://www.zohar-ai.com/",               "https://zohar-ai.com/",           "en"],
  ["https://www.zohar-ai.com/he/",            "https://www.zohar-ai.co.il/",     "he"],
  ["https://www.zohar-ai.com/he/about?z=3",   "https://www.zohar-ai.co.il/about?z=3", "he"],
  ["https://zohar-ai.com/",                   "https://zohar-ai.com/",           "en"],
  ["https://zohar-ai.com/he/",                "https://www.zohar-ai.co.il/",     "he"],
  ["https://zohar-ai.com/fr/",                "https://zohar-ai.com/fr/",        "fr"],
];

let fail = 0;
console.log("── final host map ──");
for (const [input, expectUrl, expectLocale] of CASES) {
  const { chain, final, error } = resolve(input);
  const hops = chain.filter((c) => !c.done).length;
  if (error) { console.error(`FAIL ${input}\n     ${error}`); fail++; continue; }
  const okUrl = final.url === expectUrl, okLoc = final.locale === expectLocale;
  if (!okUrl || !okLoc) {
    console.error(`FAIL ${input}\n     got ${final.url} [${final.locale}]\n     want ${expectUrl} [${expectLocale}]`);
    fail++; continue;
  }
  console.log(`ok   ${input.padEnd(42)} ${hops} hop(s) -> ${final.url} [${final.locale}]`);
}

// Invariants
const inv = [];
for (const [input] of CASES) {
  const { final } = resolve(input);
  if (!final) continue;
  const h = new URL(final.url).hostname;
  if (h === "zohar-ai.com" && final.locale === "he") inv.push(`Hebrew served on ${h} (${input})`);
  if (h === "www.zohar-ai.co.il" && final.locale !== "he") inv.push(`non-Hebrew (${final.locale}) served on ${h} (${input})`);
  const q1 = new URL(input).search, q2 = new URL(final.url).search;
  if (q1 && q1 !== q2) inv.push(`query lost: ${input} -> ${final.url}`);
}
// every host in the approved set must be covered by a rule
for (const h of hosts) {
  if (!rules.some((r) => r.when.host === h)) inv.push(`host has no rule: ${h}`);
}
// each locale's canonical must sit on its own approved origin
for (const l of locales.filter((l) => l.ready)) {
  const want = l.origin === "he" ? canonical.he : canonical.international;
  const url = want + l.canonicalPath;
  const { final } = resolve(url);
  if (!final) { inv.push(`canonical ${url} does not resolve to a served page`); continue; }
  if (final.url !== url) inv.push(`canonical ${url} redirects to ${final.url} — a canonical must never redirect`);
  if (final.locale !== l.code) inv.push(`canonical ${url} serves ${final.locale}, expected ${l.code}`);
}

console.log("\n── invariants ──");
if (inv.length) { inv.forEach((i) => console.error("FAIL " + i)); fail += inv.length; }
else console.log("ok   no Hebrew on .com, no English on .co.il, queries preserved, every host covered,\n     every published canonical is a 200 on its own host and never redirects");

// Negative control: the loop guard must actually fire. A deliberately circular
// rule pair (never part of the approved map) has to be caught, not resolved.
console.log("\n── loop guard (negative control) ──");
const LOOPING = [
  { id: "a-to-b", when: { host: "a.example" }, redirect: { to: "https://b.example", path: "keep" }, status: 301 },
  { id: "b-to-a", when: { host: "b.example" }, redirect: { to: "https://a.example", path: "keep" }, status: 301 },
];
const control = resolve("https://a.example/", LOOPING);
if (control.final || !/redirect loop/.test(control.error || "")) {
  console.error(`FAIL loop guard did not fire: ${control.error || control.final?.url}`);
  fail++;
} else {
  console.log(`ok   guard fires on a circular pair — ${control.error}`);
}

if (fail) { console.error(`\nhost map: FAILED (${fail})`); process.exit(1); }
console.log(`\nhost map: PASS — ${CASES.length} cases, ${MAX_HOPS}-hop loop guard, all invariants hold`);
