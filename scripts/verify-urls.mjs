// URL-preservation gate. Every legacy public URL must resolve in the build
// output or be covered by an explicit redirect in vercel.json.
import fs from "node:fs";
const dist = "dist";
const vercel = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
const redirects = new Set(vercel.redirects.map((r) => r.source));

const LEGACY = [
  "/", "/index.html",
  ...["en","fr","es","pt","ru","zh","ar","de"].flatMap((l) => [`/${l}/`, `/${l}/index.html`]),
  "/style.css", "/script.js", "/logo.svg",
];

const bad = [];
for (const u of LEGACY) {
  if (u.endsWith("/")) {
    const f = `${dist}${u}index.html`;
    if (!fs.existsSync(f)) bad.push(`${u} → missing ${f}`);
  } else if (u.endsWith("/index.html")) {
    const lang = u.split("/")[1];
    if (!redirects.has("/:lang(en|fr|es|pt|ru|zh|ar|de)/index.html") && !redirects.has(u))
      bad.push(`${u} → no redirect`);
  } else if (!redirects.has(u)) {
    bad.push(`${u} → no redirect`);
  }
}
for (const extra of ["/robots.txt", "/sitemap.xml", "/404.html"]) {
  if (!fs.existsSync(`${dist}${extra}`)) bad.push(`${extra} → missing`);
}
if (bad.length) { console.error("URL PRESERVATION FAILED:\n  " + bad.join("\n  ")); process.exit(1); }
console.log(`URL preservation: PASS — ${LEGACY.length} legacy URLs covered, plus robots/sitemap/404.`);
