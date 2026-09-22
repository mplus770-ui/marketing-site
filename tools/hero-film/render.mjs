/* Render the ZOHAR business-presence film — build tooling, never published.
   ──────────────────────────────────────────────────────────────────────────
   Usage:
     node tools/hero-film/render.mjs poster    # final frame only (fast)
     node tools/hero-film/render.mjs film      # every frame + encode

   The page is loaded once per variant and renderFrame(t) is called per frame,
   so the output is deterministic and reproducible from this repo alone.

   Four variants ship: {he,en} x {desktop 16:9, mobile 4:5}. The film carries
   real words, so it cannot be mirrored with a CSS transform the way an
   abstract frame could — each direction is composed, not flipped. Only one
   variant is ever downloaded per visit. */
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUT = path.join(ROOT, "src/assets/motion");
const TMP = process.env.FILM_TMP || "/tmp/zohar-film";
const FFMPEG = process.env.FFMPEG || "/tmp/ffm/node_modules/ffmpeg-static/ffmpeg";
const DURATION = 7.4;
const FPS = 25;

const VARIANTS = [
  { id: "he-desktop", lang: "he", dir: "rtl", mode: "side",   W: 1280, H: 720 },
  { id: "en-desktop", lang: "en", dir: "ltr", mode: "side",   W: 1280, H: 720 },
  { id: "he-mobile",  lang: "he", dir: "rtl", mode: "bottom", W: 720,  H: 900 },
  { id: "en-mobile",  lang: "en", dir: "ltr", mode: "bottom", W: 720,  H: 900 }
];

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".woff2": "font/woff2", ".webp": "image/webp", ".svg": "image/svg+xml" };

function serve(port) {
  const srv = createServer(async (req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const file = url.startsWith("/assets/")
      ? path.join(ROOT, "src", url)
      : path.join(HERE, url === "/" ? "film.html" : url);
    try {
      const buf = await readFile(file);
      res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
      res.end(buf);
    } catch { res.writeHead(404); res.end("nope"); }
  });
  return new Promise((r) => srv.listen(port, () => r(srv)));
}

async function open(browser, v, port) {
  const page = await browser.newPage({ viewport: { width: v.W, height: v.H }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}/film.html`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const info = await page.evaluate((cfg) => window.setupFilm(cfg), v);
  await page.evaluate(() => document.fonts.ready);
  return { page, info };
}

async function main() {
  const mode = process.argv[2] || "poster";
  const port = 8123;
  const srv = await serve(port);
  const browser = await chromium.launch();
  fs.mkdirSync(OUT, { recursive: true });

  for (const v of VARIANTS) {
    const { page } = await open(browser, v, port);

    // The final frame is the poster, the no-JS state and the reduced-motion
    // state, so it is rendered from the same scene at the same t as the film's
    // last frame — they can never drift apart.
    await page.evaluate((t) => window.renderFrame(t), DURATION);
    await page.waitForTimeout(120);
    const posterPng = path.join(TMP, `poster-${v.id}.png`);
    fs.mkdirSync(TMP, { recursive: true });
    await page.screenshot({ path: posterPng });
    execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-i", posterPng,
      "-c:v", "libwebp", "-quality", "82", "-compression_level", "6",
      path.join(OUT, `zohar-hero-poster-${v.id}.webp`)]);
    console.log("poster", v.id, (fs.statSync(path.join(OUT, `zohar-hero-poster-${v.id}.webp`)).size / 1024).toFixed(0) + "KB");

    if (mode === "film") {
      const dir = path.join(TMP, v.id);
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      const frames = Math.round(DURATION * FPS);
      for (let i = 0; i < frames; i++) {
        await page.evaluate((t) => window.renderFrame(t), (i / FPS));
        await page.screenshot({ path: path.join(dir, String(i).padStart(4, "0") + ".png") });
      }
      const pattern = path.join(dir, "%04d.png");
      const webm = path.join(OUT, `zohar-hero-motion-${v.id}.webm`);
      const mp4 = path.join(OUT, `zohar-hero-motion-${v.id}.mp4`);
      // The film is mostly still, high-contrast type on flat fills, which is
      // the worst case for a lossy codec and the easiest thing to over-compress
      // into mush. CRF is set as low as the payload budget allows rather than
      // as high as it tolerates: at 1.2MB desktop / 700KB mobile there is room.
      execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", pattern,
        "-c:v", "libvpx-vp9", "-crf", "30", "-b:v", "0", "-row-mt", "1",
        "-deadline", "good", "-cpu-used", "1",
        "-pix_fmt", "yuv420p", "-an", webm]);
      execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", pattern,
        "-c:v", "libx264", "-crf", "25", "-preset", "slow", "-profile:v", "main",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4]);
      console.log("  film", v.id,
        "webm", (fs.statSync(webm).size / 1024).toFixed(0) + "KB",
        "mp4", (fs.statSync(mp4).size / 1024).toFixed(0) + "KB");
      fs.rmSync(dir, { recursive: true, force: true });
    }
    await page.close();
  }
  await browser.close();
  srv.close();
}
main();
