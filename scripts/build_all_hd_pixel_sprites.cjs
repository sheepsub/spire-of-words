const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processHdPixelSprite({
  input,
  output,
  crop = null,
  pixelH = 260,
  targetH = 880,
  saturation = 1.2,
  brightness = 1.04,
  sharpenSigma = 1.3,
}) {
  console.log(`Generating HD pixel sprite: ${path.basename(output)}...`);
  let pipeline = sharp(input);
  if (crop) {
    pipeline = pipeline.extract(crop);
  }

  // 1. Trim transparent padding
  const trimmed = await pipeline.trim({ threshold: 10 }).toBuffer();
  const meta = await sharp(trimmed).metadata();

  const aspect = meta.width / meta.height;
  const pixelW = Math.round(pixelH * aspect);

  // 2. Downsample to fighting-game pixel grid with lanczos3 and edge enhancement
  const pixelGrid = await sharp(trimmed)
    .resize(pixelW, pixelH, { kernel: 'lanczos3' })
    .modulate({ saturation, brightness })
    .sharpen({ sigma: sharpenSigma, m1: 1.6, m2: 2.4 })
    .toBuffer();

  // 3. Upscale with NEAREST NEIGHBOR to guarantee crisp square pixel blocks
  const targetW = Math.round(targetH * aspect);
  await sharp(pixelGrid)
    .resize(targetW, targetH, { kernel: 'nearest' })
    .png({ compressionLevel: 7 })
    .toFile(output);

  const stats = fs.statSync(output);
  console.log(`✓ ${path.basename(output)}: ${targetW}x${targetH}, ${(stats.size / 1024).toFixed(1)} KB`);
}

async function main() {
  const pixelDir = path.resolve('src/assets/pixel');
  const fateDir = path.resolve('src/assets/fate');
  const sts2Dir = path.resolve('public/sts2/characters');

  // Regent (Crown Prince from STS2)
  await processHdPixelSprite({
    input: path.join(sts2Dir, 'characterselect_regent.webp'),
    output: path.join(pixelDir, 'regent_pixel.png'),
    crop: { left: 160, top: 0, width: 1560, height: 1218 },
    pixelH: 260,
    targetH: 880,
    saturation: 1.22,
    brightness: 1.05,
    sharpenSigma: 1.4,
  });

  // Gilgamesh (King of Heroes)
  await processHdPixelSprite({
    input: path.join(fateDir, 'gilgamesh.png'),
    output: path.join(pixelDir, 'gilgamesh_pixel.png'),
    pixelH: 260,
    targetH: 880,
    saturation: 1.25,
    brightness: 1.05,
    sharpenSigma: 1.4,
  });

  // Mash (Shielder)
  await processHdPixelSprite({
    input: path.join(fateDir, 'mash.png'),
    output: path.join(pixelDir, 'mash_pixel.png'),
    pixelH: 260,
    targetH: 880,
    saturation: 1.2,
    brightness: 1.05,
    sharpenSigma: 1.4,
  });

  // Jalter (Avenger)
  await processHdPixelSprite({
    input: path.join(fateDir, 'jalter.png'),
    output: path.join(pixelDir, 'jalter_pixel.png'),
    pixelH: 260,
    targetH: 880,
    saturation: 1.2,
    brightness: 1.05,
    sharpenSigma: 1.4,
  });

  // Serenity (Assassin)
  await processHdPixelSprite({
    input: path.join(fateDir, 'serenity.png'),
    output: path.join(pixelDir, 'serenity_pixel.png'),
    pixelH: 260,
    targetH: 880,
    saturation: 1.25,
    brightness: 1.05,
    sharpenSigma: 1.4,
  });

  // Rin (Jewel Magus)
  await processHdPixelSprite({
    input: path.join(fateDir, 'rin.png'),
    output: path.join(pixelDir, 'rin_pixel.png'),
    pixelH: 260,
    targetH: 880,
    saturation: 1.25,
    brightness: 1.05,
    sharpenSigma: 1.4,
  });

  console.log('All HD pixel sprites built!');
}

main().catch(console.error);
