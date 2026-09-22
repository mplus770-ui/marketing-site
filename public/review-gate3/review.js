const F = window.__SHOTS__ || [];
function card(file, label, meta) {
  return `<figure><a href="shots/${file}" target="_blank" rel="noopener">
    <img src="shots/${file}" alt="${label}" loading="lazy"></a>
    <figcaption><b>${label}</b><span>${meta || ""}</span></figcaption></figure>`;
}
const put = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
const NICE = { header:"Header + Threshold logo", hero:"Hero", "build-demo":"BUILD concept demonstration",
  offer:"Commercial offer", work:"Selected work carousel", method:"BUILD → GROW → PROVE → MEMORY",
  faq:"FAQ (all open)", footer:"Footer + language row", contact:"Contact / brief surface" };
const ORDER = ["header","hero","build-demo","offer","work","method","faq","footer","contact"];

put("g-he-vp", [[320,568],[375,667],[390,844],[430,932],[768,1024],[1440,900],[1920,1080]]
  .map(([w,h]) => card(`he-${w}x${h}.png`, `${w}×${h}`, "Hebrew")).join("")
  + [320,390,768,1440].map((w) => card(`he-${w}-first-paint.png`, `${w} — first paint`, "before any animation")).join(""));

put("g-en-vp", [[320,568],[390,844],[768,1024],[1440,900],[1920,1080]]
  .map(([w,h]) => card(`en-${w}x${h}.png`, `${w}×${h}`, "English")).join("")
  + [320,390,768,1440].map((w) => card(`en-${w}-first-paint.png`, `${w} — first paint`, "before any animation")).join(""));

put("g-full", [["he","desktop"],["he","mobile"],["en","desktop"],["en","mobile"]]
  .map(([l,d]) => card(`${l}-fullpage-${d}.png`, `${l.toUpperCase()} full page — ${d}`, "FAQ opened")).join(""));

for (const loc of ["he","en"]) {
  put(`g-${loc}-cu`, ORDER.flatMap((n) => ["desktop","mobile"]
    .map((d) => card(`${loc}-${d}-${n}.png`, NICE[n], d))).join(""));
}
