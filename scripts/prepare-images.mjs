import { mkdir } from "node:fs/promises";
import sharp from "sharp";

await mkdir("src/assets/generated", { recursive: true });
for (const width of [380, 670, 900]) {
  await sharp("src/assets/images/POS-image-1.webp")
    .resize({ width })
    .webp({ quality: 78 })
    .toFile(`src/assets/generated/pos-${width}.webp`);
}
