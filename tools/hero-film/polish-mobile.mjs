/* Build the launch hero film from four approved, local portfolio captures.
   Each project receives its own full 16:10 frame. The first scene is repeated
   at the end, so restarting the file is visually seamless. */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const motion = path.join(root, "src/assets/motion");
const work = path.join(root, "src/assets/work");
const tmp = mkdtempSync(path.join(tmpdir(), "zohar-hero-film-"));
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const run = (args) => execFileSync(ffmpeg, ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

const projects = [
  ["better-world-card@2x.webp", "0xE4B363"],
  ["eco-tech-israel-card@2x.webp", "0x34E39B"],
  ["yayin-card@2x.webp", "0xE4B363"],
  ["le-monde-sefarade-card@2x.webp", "0xE4B363"],
];

function framedCapture(source, accent, width, height, output) {
  const frameW = Math.floor(width * (width > height ? 0.82 : 0.89) / 2) * 2;
  const frameH = Math.ceil((frameW * 0.625) / 2) * 2;
  const x = Math.round((width - frameW) / 2);
  const y = Math.round((height - frameH) / 2);
  run(["-i", source, "-filter_complex",
    `[0:v]split=2[base][shot];` +
    `[base]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},boxblur=18:3,eq=brightness=-0.48:saturation=0.50[bg];` +
    `[shot]scale=${frameW}:${frameH}:force_original_aspect_ratio=decrease,pad=${frameW}:${frameH}:(ow-iw)/2:(oh-ih)/2:color=0x04150F[site];` +
    `[bg][site]overlay=${x}:${y},drawbox=x=${x - 2}:y=${y - 2}:w=${frameW + 4}:h=${frameH + 4}:color=${accent}@0.78:t=2,format=yuv420p[out]`,
    "-map", "[out]", "-frames:v", "1", output]);
}

function buildVariant(id, width, height) {
  const frames = projects.map(([name, accent], index) => {
    const out = path.join(tmp, `${id}-${index}.png`);
    framedCapture(path.join(work, name), accent, width, height, out);
    return out;
  });
  const sequence = [...frames, frames[0]];
  const inputs = sequence.flatMap((input) => ["-loop", "1", "-t", "3", "-i", input]);
  const filters = [
    ...sequence.map((_, i) => `[${i}:v]fps=25,scale=${width}:${height},format=yuv420p[s${i}]`),
    "[s0][s1]xfade=transition=fade:duration=0.55:offset=2.45[x1]",
    "[x1][s2]xfade=transition=fade:duration=0.55:offset=4.90[x2]",
    "[x2][s3]xfade=transition=fade:duration=0.55:offset=7.35[x3]",
    "[x3][s4]xfade=transition=fade:duration=0.55:offset=9.80[out]",
  ].join(";");
  const intermediate = path.join(tmp, `${id}.mp4`);
  run([...inputs, "-filter_complex", filters, "-map", "[out]", "-t", "12.25", "-an",
    "-c:v", "libx264", "-crf", "27", "-preset", "slow", "-profile:v", "main",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", intermediate]);
  run(["-i", intermediate, "-c:v", "copy", "-movflags", "+faststart", "-an",
    path.join(motion, `zohar-hero-master-${id}.mp4`)]);
  run(["-i", intermediate, "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0",
    "-row-mt", "1", "-deadline", "good", "-cpu-used", "3", "-an",
    path.join(motion, `zohar-hero-master-${id}.webm`)]);
  run(["-i", frames[0], "-c:v", "libwebp", "-quality", "82", "-compression_level", "6",
    "-frames:v", "1", path.join(motion, `zohar-hero-master-${id}.webp`)]);
}

try {
  buildVariant("mobile", 720, 900);
  buildVariant("desktop", 1280, 720);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
