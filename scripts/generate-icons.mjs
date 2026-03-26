import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#2563eb"/>
  <text x="256" y="320" font-size="260" font-family="Arial" font-weight="bold"
        text-anchor="middle" fill="white">SO</text>
</svg>`);

await sharp(svg).resize(192, 192).png().toFile("public/icons/icon-192x192.png");
await sharp(svg).resize(512, 512).png().toFile("public/icons/icon-512x512.png");

console.log("✅ PWA icons generated in public/icons/");