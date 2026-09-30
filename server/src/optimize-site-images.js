import sharp from "sharp";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Generate web assets without modifying or deleting the original source images.
const images = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../client/public/images",
);
for (const name of ["laboratory-hero", "laboratory-detail"]) {
  await sharp(resolve(images, `${name}.png`))
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(resolve(images, `${name}.webp`));
}
await sharp(resolve(images, "versatile-mark.png"))
  .resize({ width: 240 })
  .webp({ lossless: true })
  .toFile(resolve(images, "versatile-mark.webp"));
