const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildCleanFateSprite({ name, left, top, width, height, pixelH = 260, targetH = 880, saturation = 1.25, brightness = 1.04 }) {
  const fateDir = path.resolve('src/assets/fate');
  const pixelDir = path.resolve('src/assets/pixel');
  const input = path.join(fateDir, `${name}.png`);
  const output = path.join(pixelDir, `${name}_pixel.png`);

  console.log(`Extracting clean body for ${name}...`);
  // Extract strictly the character body, ignoring bottom expression face sheet
  const bodyBuf = await sharp(input)
    .extract({ left, top, width, height })
    .toBuffer();

  const aspect = width / height;
  const pixelW = Math.round(pixelH * aspect);

  // Downsample to fighting-game pixel grid with lanczos3 and edge sharpening
  const downsampled = await sharp(bodyBuf)
    .resize(pixelW, pixelH, { kernel: 'lanczos3' })
    .modulate({ saturation, brightness })
    .sharpen({ sigma: 1.4, m1: 1.8, m2: 2.5 })
    .toBuffer();

  // Nearest-neighbor upscale to ~880px height
  const targetW = Math.round(targetH * aspect);
  await sharp(downsampled)
    .resize(targetW, targetH, { kernel: 'nearest' })
    .png({ compressionLevel: 7 })
    .toFile(output);

  const stats = fs.statSync(output);
  console.log(`✓ ${name}_pixel.png generated: ${targetW}x${targetH}, ${(stats.size / 1024).toFixed(1)} KB`);
}

async function run() {
  // 1. Gilgamesh: Body is top: 162..1000 (height 838), width 1024
  await buildCleanFateSprite({
    name: 'gilgamesh',
    left: 0,
    top: 160,
    width: 1024,
    height: 840,
    saturation: 1.25,
    brightness: 1.05,
  });

  // 2. Mash: Body is top: 0..1000 (height 1000), width 1000
  await buildCleanFateSprite({
    name: 'mash',
    left: 10,
    top: 0,
    width: 1000,
    height: 1000,
    saturation: 1.2,
    brightness: 1.05,
  });

  // 3. Jalter: Body is top: 0..760 (height 760), width 960
  await buildCleanFateSprite({
    name: 'jalter',
    left: 10,
    top: 0,
    width: 960,
    height: 760,
    saturation: 1.2,
    brightness: 1.05,
  });

  // 4. Serenity: Body is top: 160..1000 (height 840), width 980
  await buildCleanFateSprite({
    name: 'serenity',
    left: 20,
    top: 160,
    width: 980,
    height: 840,
    saturation: 1.25,
    brightness: 1.05,
  });

  // 5. Rin: Body is top: 0..760 (height 760), width 960
  await buildCleanFateSprite({
    name: 'rin',
    left: 40,
    top: 0,
    width: 960,
    height: 760,
    saturation: 1.25,
    brightness: 1.05,
  });

  console.log('All Fate character pixel standing sprites cleaned and regenerated successfully!');
}

run().catch(console.error);
