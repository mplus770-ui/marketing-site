/* Reposition the approved poster without mirroring its embedded lettering.
   The original left-hand artwork is translated to the right; the cropped
   portion is only its empty right-hand copy area. RTL and mobile keep the
   approved original file. Run again if the approved source poster changes. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const source = new URL('../../src/assets/motion/zohar-hero-master-desktop.webp', import.meta.url);
const target = new URL('../../src/assets/motion/zohar-hero-poster-desktop-ltr.svg', import.meta.url);
const data = readFileSync(source).toString('base64');
writeFileSync(target, `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
<defs><linearGradient id="blend"><stop stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="white"/></linearGradient>
<mask id="edge" maskUnits="userSpaceOnUse" x="350" y="0" width="1280" height="720"><rect x="350" width="140" height="720" fill="url(#blend)"/><rect x="490" width="1140" height="720" fill="white"/></mask></defs>
<rect width="1280" height="720" fill="#04150f"/>
<image x="350" y="0" width="1280" height="720" mask="url(#edge)" href="data:image/webp;base64,${data}"/>
</svg>\n`);
console.log(fileURLToPath(target));
