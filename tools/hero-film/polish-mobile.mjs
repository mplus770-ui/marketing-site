/* Build the launch hero film from five approved, local portfolio captures.
   Each project receives its own full 16:10 frame. The approved studio poster
   opens and closes the film, so the resting image, first paint and ending are
   visually continuous. */
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
  ["sadafronia-mobile@2x.webp", "0xE4B363", "portrait", "sadafronia-card@2x.webp", "wide"],
  ["better-world-card@2x.webp", "0xE4B363"],
  ["eco-tech-israel-card@2x.webp", "0x34E39B"],
  ["yayin-card@2x.webp", "0xE4B363"],
  ["le-monde-sefarade-card@2x.webp", "0xE4B363", "wide"],
];

function framedCapture(source, accent, width, height, output, layout = "landscape") {
  const portrait = layout === "portrait";
  const wide = layout === "wide";
  const frameH = portrait
    ? Math.floor(height * (width > height ? 0.88 : 0.82) / 2) * 2
    : Math.ceil(((Math.floor(width * (wide ? 0.96 : (width > height ? 0.88 : 0.94)) / 2) * 2) * 0.625) / 2) * 2;
  const frameW = portrait
    ? Math.floor((frameH * 0.5625) / 2) * 2
    : Math.floor(width * (wide ? 0.96 : (width > height ? 0.88 : 0.94)) / 2) * 2;
  const x = Math.round((width - frameW) / 2);
  const y = height > width
    ? Math.round((height * 0.62) - (frameH / 2))
    : Math.round((height - frameH) / 2);
  run(["-i", source, "-filter_complex",
    `[0:v]split=2[base][shot];` +
    `[base]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},boxblur=16:2,eq=brightness=-0.18:saturation=0.88:contrast=1.03[bg];` +
    `[shot]scale=${frameW}:${frameH}:force_original_aspect_ratio=decrease,eq=brightness=0.045:saturation=1.12:contrast=1.04,pad=${frameW}:${frameH}:(ow-iw)/2:(oh-ih)/2:color=0x09291F[site];` +
    `[bg][site]overlay=${x}:${y},drawbox=x=${x - 2}:y=${y - 2}:w=${frameW + 4}:h=${frameH + 4}:color=${accent}@0.78:t=2,format=yuv420p[out]`,
    "-map", "[out]", "-frames:v", "1", output]);
}

function buildVariant(id, width, height) {
  const frames = projects.map(([name, accent, layout, desktopName, desktopLayout], index) => {
    const out = path.join(tmp, `${id}-${index}.png`);
    const sourceName = id === "desktop" && desktopName ? desktopName : name;
    const sourceLayout = id === "desktop" && desktopLayout ? desktopLayout : layout;
    framedCapture(path.join(work, sourceName), accent, width, height, out, sourceLayout);
    return out;
  });
  const poster = path.join(motion, `zohar-hero-master-${id}.webp`);
  const sequence = [poster, ...frames, poster];
  const inputs = sequence.flatMap((input) => ["-loop", "1", "-t", "3", "-i", input]);
  const filters = sequence.map((_, i) =>
    `[${i}:v]fps=25,scale=${width}:${height},format=yuv420p[s${i}]`);
  for (let i = 1; i < sequence.length; i += 1) {
    const previous = i === 1 ? "s0" : `x${i - 1}`;
    const output = i === sequence.length - 1 ? "out" : `x${i}`;
    filters.push(`[${previous}][s${i}]xfade=transition=fade:duration=0.55:offset=${(2.45 * i).toFixed(2)}[${output}]`);
  }
  const intermediate = path.join(tmp, `${id}.mp4`);
  const duration = 2.45 * (sequence.length - 1) + 0.55;
  run([...inputs, "-filter_complex", filters.join(";"), "-map", "[out]", "-t", duration.toFixed(2), "-an",
    "-c:v", "libx264", "-crf", "27", "-preset", "slow", "-profile:v", "main",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", intermediate]);
  run(["-i", intermediate, "-c:v", "copy", "-movflags", "+faststart", "-an",
    path.join(motion, `zohar-hero-master-${id}.mp4`)]);
  run(["-i", intermediate, "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0",
    "-row-mt", "1", "-deadline", "good", "-cpu-used", "3", "-an",
    path.join(motion, `zohar-hero-master-${id}.webm`)]);
}

try {
  buildVariant("mobile", 720, 900);
  buildVariant("desktop", 1280, 720);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
