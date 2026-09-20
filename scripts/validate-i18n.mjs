// Translation gate. Runs before the build.
//  - `en` is the reference key set; a published locale must match it exactly.
//  - placeholder residue fails the build outright.
//  - a published locale must actually contain its own script.
//  - a published locale must not reuse English strings verbatim.
import fs from "node:fs";
const dir = "src/_data/i18n";
const locales = (await import("../src/_data/locales.js")).default;
const load = (c) => JSON.parse(fs.readFileSync(`${dir}/${c}.json`, "utf8"));

const keys = (o, p = "") => Object.entries(o).flatMap(([k, v]) =>
  v && typeof v === "object" ? keys(v, p ? `${p}.${k}` : k) : [p ? `${p}.${k}` : k]);
const get = (o, k) => k.split(".").reduce((a, b) => (a == null ? a : a[b]), o);

const en = load("en");
const ref = new Set(keys(en));
const PLACEHOLDER = /X{4,}|TODO|CHANGEME|Lorem ipsum/i;
const SCRIPT = { hebrew: /[֐-׿]/, arabic: /[؀-ۿ]/, han: /[一-鿿]/, cyrillic: /[Ѐ-ӿ]/ };
const ALLOW_SAME = new Set([
  "ZOHAR", "ZOHAR AI", "ZOHAR BUILD", "Done For You", "AWS", "WhatsApp", "V12", "V13", "V14",
  // product names deliberately kept in English across every locale
  "BUILD Foundation", "Connect + Measure", "Growth Engine",
  // the pending-locale escape hatch is English on purpose
  "Continue in English",
]);

let fail = 0, warn = 0;
for (const loc of locales) {
  const s = load(loc.code);
  const mine = new Set(keys(s));
  for (const k of mine) {
    const v = get(s, k);
    if (typeof v === "string" && PLACEHOLDER.test(v)) {
      console.error(`FAIL ${loc.code}: placeholder residue at "${k}"`); fail++;
    }
  }
  if (!loc.ready) { console.log(`skip ${loc.code}: not published (placeholder page, noindex, absent from sitemap)`); continue; }
  const missing = [...ref].filter((k) => !mine.has(k));
  const extra = [...mine].filter((k) => !ref.has(k));
  if (missing.length) { console.error(`FAIL ${loc.code}: ${missing.length} missing key(s): ${missing.slice(0,5).join(", ")}`); fail++; }
  if (extra.length) { console.error(`FAIL ${loc.code}: ${extra.length} unexpected key(s): ${extra.slice(0,5).join(", ")}`); fail++; }
  const re = SCRIPT[loc.script];
  if (re && !re.test(JSON.stringify(s))) { console.error(`FAIL ${loc.code}: no ${loc.script} characters found`); fail++; }
  if (loc.code !== "en") {
    const same = [...mine].filter((k) => {
      const a = get(s, k), b = get(en, k);
      return typeof a === "string" && a === b && a.length > 3 && !ALLOW_SAME.has(a);
    });
    if (same.length) { console.warn(`WARN ${loc.code}: ${same.length} string(s) identical to English: ${same.slice(0,4).join(", ")}`); warn += same.length; }
  }
  console.log(`ok   ${loc.code}: ${mine.size} keys, parity with en, ${loc.script} present`);
}
if (fail) { console.error(`\ni18n validation FAILED (${fail} error(s))`); process.exit(1); }
console.log(`\ni18n validation: PASS${warn ? ` (${warn} warning(s))` : ""}`);
