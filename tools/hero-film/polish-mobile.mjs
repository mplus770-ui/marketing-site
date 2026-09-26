/* Rebuild the portrait hero film from approved, local portfolio captures.
   The composition keeps every screenshot fully visible instead of zooming into
   and clipping its headline. Motion is limited to measured cross-dissolves so
   it remains smooth on mid-range phones and compresses within the mobile
   payload budget. Nothing external is downloaded. */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const motion = path.join(root, "src/assets/motion");
const work = path.join(root, "src/assets/work");
const tmp = mkdtempSync(path.join(tmpdir(), "zohar-hero-mobile-"));
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const run = (args) => execFileSync(ffmpeg, ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

const poster = path.join(motion, "zohar-hero-master-mobile.webp");
const scene = (name) => path.join(tmp, name);

function framedCapture(source, accent, output) {
  run([
    "-loop", "1", "-i", poster, "-i", source,
    "-filter_complex",
    `[0:v]scale=720:900,boxblur=10:2,eq=brightness=-0.20:saturation=0.68[bg];` +
    `[1:v]scale=640:400:force_original_aspect_ratio=decrease,` +
    `pad=640:400:(ow-iw)/2:(oh-ih)/2:color=0x04150F[site];` +
    `[bg][site]overlay=(W-w)/2:(H-h)/2,` +
    `drawbox=x=38:y=249:w=644:h=404:color=${accent}@0.74:t=2`,
    "-frames:v", "1", output
  ]);
}

try {
  framedCapture(path.join(work, "sadafronia-card@2x.webp"), "0xE4B363", scene("01.png"));
  framedCapture(path.join(work, "better-world-card@2x.webp"), "0xE4B363", scene("02.png"));
  framedCapture(path.join(work, "eco-tech-israel-card@2x.webp"), "0x34E39B", scene("03.png"));

  const inputs = [poster, scene("01.png"), scene("02.png"), scene("03.png"), poster]
    .flatMap((input) => ["-loop", "1", "-t", "2.7", "-i", input]);
  const filter = [
    ...Array.from({ length: 5 }, (_, i) => `[${i}:v]fps=25,scale=720:900,format=yuv420p[s${i}]`),
    "[s0][s1]xfade=transition=fade:duration=0.5:offset=2.2[x1]",
    "[x1][s2]xfade=transition=fade:duration=0.5:offset=4.4[x2]",
    "[x2][s3]xfade=transition=fade:duration=0.5:offset=6.6[x3]",
    "[x3][s4]xfade=transition=fade:duration=0.5:offset=8.8[out]"
  ].join(";");
  const intermediate = scene("master.mp4");

  run([
    ...inputs, "-filter_complex", filter, "-map", "[out]", "-an",
    "-c:v", "libx264", "-crf", "27", "-preset", "slow", "-profile:v", "main",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", intermediate
  ]);
  run([
    "-i", intermediate, "-c:v", "libx264", "-crf", "27", "-preset", "slow",
    "-profile:v", "main", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
    path.join(motion, "zohar-hero-master-mobile.mp4")
  ]);
  run([
    "-i", intermediate, "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0",
    "-row-mt", "1", "-deadline", "good", "-cpu-used", "3", "-an",
    path.join(motion, "zohar-hero-master-mobile.webm")
  ]);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
