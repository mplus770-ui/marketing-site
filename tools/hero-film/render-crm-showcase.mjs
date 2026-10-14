import sharp from "/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const source = path.join(here, "zohar-crm-showcase.svg");
const out = path.join(root, "src/assets/work");

async function encode(name, width, height) {
  const image = sharp(source, { density: 144 }).resize(width, height, { fit: "fill" });
  await image.clone().webp({ quality: 84, effort: 6 }).toFile(path.join(out, `${name}.webp`));
  await image.clone().avif({ quality: 58, effort: 5 }).toFile(path.join(out, `${name}.avif`));
}

await encode("zohar-crm-card@2x", 1600, 1000);
await encode("zohar-crm-card", 800, 500);

// The project record keeps a mobile pair for data-shape parity. The current
// carousel deliberately uses its landscape card at every viewport.
await encode("zohar-crm-mobile@2x", 960, 600);
await encode("zohar-crm-mobile", 480, 300);
