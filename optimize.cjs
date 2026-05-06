const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function optimize() {
  const dir = path.join(__dirname, "public");
  
  // Optimize 1.png -> 1.webp
  if (fs.existsSync(path.join(dir, "1.png"))) {
    await sharp(path.join(dir, "1.png"))
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(dir, "1.webp"));
    console.log("Optimized 1.png -> 1.webp");
  }

  // Optimize 2.png -> 2.webp
  if (fs.existsSync(path.join(dir, "2.png"))) {
    await sharp(path.join(dir, "2.png"))
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(path.join(dir, "2.webp"));
    console.log("Optimized 2.png -> 2.webp");
  }
}

optimize().catch(console.error);
