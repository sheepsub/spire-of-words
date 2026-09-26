const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Master pixel art generation utility
// Converts source full-res/illustration art into authentic 32-bit fighting-game pixel standing sprites matching Artoria
async function createPixelSprite({
  input,
  output,
  crop = null, // { left, top, width, height }
  targetHeight = 880,
  pixelGridHeight = 130, // base pixel sprite height before nearest-neighbor upscale
  saturation = 1.25,
  brightness = 1.05,
  contrast = 1.1,
  sharpenSigma = 1.2,
  numColors = 48,
}) {
  console.log(`Processing: ${path.basename(output)}...`);
  
  let pipeline = sharp(input);
  if (crop) {
    pipeline = pipeline.extract(crop);
  }

  // First pass: trim transparent borders if any
  const trimmedBuf = await pipeline.trim({ threshold: 10 }).toBuffer();
  const trimmedMeta = await sharp(trimmedBuf).metadata();
  
  // Calculate aspect ratio
  const aspect = trimmedMeta.width / trimmedMeta.height;
  const pixelGridWidth = Math.round(pixelGridHeight * aspect);

  // Downsample to authentic retro pixel grid resolution with lanczos3
  // Apply saturation, brightness, contrast, and edge sharpening
  const downsampled = await sharp(trimmedBuf)
    .resize(pixelGridWidth, pixelGridHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill',
    })
    .modulate({
      saturation: saturation,
      brightness: brightness,
    })
    .sharpen({
      sigma: sharpenSigma,
      m1: 1.5,
      m2: 2.5,
    })
    .png({
      colours: numColors,
      dither: 0.25,
      quality: 100,
    })
    .toBuffer();

  // Clean alpha: any pixel with alpha < 60 becomes 0, alpha >= 60 becomes solid or preserved
  const rawDown = await sharp(downsampled).raw().toBuffer({ resolveWithObject: true });
  const rawData = rawDown.data;
  const channels = rawDown.info.channels;
  for (let i = 0; i < rawData.length; i += channels) {
    if (channels === 4) {
      if (rawData[i + 3] < 60) {
        rawData[i + 3] = 0;
      } else if (rawData[i + 3] > 200) {
        rawData[i + 3] = 255;
      }
    }
  }

  const cleanedDown = await sharp(rawData, {
    raw: {
      width: rawDown.info.width,
      height: rawDown.info.height,
      channels: channels,
    },
  }).png().toBuffer();

  // Upscale to high-def output using NEAREST NEIGHBOR to guarantee perfect square pixel blocks
  const targetWidth = Math.round(targetHeight * aspect);
  await sharp(cleanedDown)
    .resize(targetWidth, targetHeight, {
      kernel: sharp.kernel.nearest,
    })
    .png({ compressionLevel: 9 })
    .toFile(output);

  const stats = fs.statSync(output);
  console.log(`✓ Generated ${path.basename(output)}: ${targetWidth}x${targetHeight}, ${(stats.size / 1024).toFixed(1)} KB`);
}

async function run() {
  const pixelDir = path.resolve('src/assets/pixel');
  const fateDir = path.resolve('src/assets/fate');
  const sts2Dir = path.resolve('public/sts2/characters');

  // 1. Necrobinder: Lich Queen with floating spectral bone hand Osti
  // In characterselect_necrobinder_2.webp: Osti on left, Necro on right.
  // Let's create a combined composition where Osti hovers beside Necrobinder's shoulder
  const necroMeta = await sharp(path.join(sts2Dir, 'characterselect_necrobinder_2.webp')).metadata();
  // Osti: extract(left: 0, top: 60, width: 480, height: 460)
  // Necro: extract(left: 600, top: 0, width: 760, height: 522)
  const ostiBuf = await sharp(path.join(sts2Dir, 'characterselect_necrobinder_2.webp'))
    .extract({ left: 0, top: 60, width: 480, height: 460 })
    .resize(320, 310, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const necroBuf = await sharp(path.join(sts2Dir, 'characterselect_necrobinder_2.webp'))
    .extract({ left: 620, top: 0, width: 740, height: 522 })
    .resize(560, 520, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Composite Osti hovering at left shoulder of Necrobinder on a 700x522 transparent canvas
  const necroComposite = await sharp({
    create: {
      width: 760,
      height: 522,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: ostiBuf, left: 10, top: 110 },
      { input: necroBuf, left: 200, top: 2 },
    ])
    .png()
    .toBuffer();

  await createPixelSprite({
    input: necroComposite,
    output: path.join(pixelDir, 'necrobinder_pixel.png'),
    targetHeight: 880,
    pixelGridHeight: 130,
    saturation: 1.3,
    brightness: 1.05,
    numColors: 48,
  });

  // 2. Regent: Crown Prince standing with celestial stellar aura
  // Extract Regent's figure: x from 200 to 1800, full height
  await createPixelSprite({
    input: path.join(sts2Dir, 'characterselect_regent.webp'),
    output: path.join(pixelDir, 'regent_pixel.png'),
    crop: { left: 180, top: 0, width: 1550, height: 1218 },
    targetHeight: 880,
    pixelGridHeight: 130,
    saturation: 1.25,
    brightness: 1.08,
    numColors: 48,
  });

  // 3. Gilgamesh: King of Heroes in Golden Armor
  await createPixelSprite({
    input: path.join(fateDir, 'gilgamesh.png'),
    output: path.join(pixelDir, 'gilgamesh_pixel.png'),
    targetHeight: 880,
    pixelGridHeight: 130,
    saturation: 1.25,
    brightness: 1.05,
    numColors: 48,
  });

  // 4. Mash: Grand Guardian Shielder with Giant Wall Shield
  await createPixelSprite({
    input: path.join(fateDir, 'mash.png'),
    output: path.join(pixelDir, 'mash_pixel.png'),
    targetHeight: 880,
    pixelGridHeight: 130,
    saturation: 1.2,
    brightness: 1.05,
    numColors: 48,
  });

  // 5. Jalter: Jeanne Alter Dragon Witch Avenger with Cursed Flag
  await createPixelSprite({
    input: path.join(fateDir, 'jalter.png'),
    output: path.join(pixelDir, 'jalter_pixel.png'),
    targetHeight: 880,
    pixelGridHeight: 130,
    saturation: 1.2,
    brightness: 1.05,
    numColors: 48,
  });

  // 6. Serenity: Hassan of Serenity Poison Assassin
  await createPixelSprite({
    input: path.join(fateDir, 'serenity.png'),
    output: path.join(pixelDir, 'serenity_pixel.png'),
    targetHeight: 880,
    pixelGridHeight: 130,
    saturation: 1.25,
    brightness: 1.05,
    numColors: 48,
  });

  // 7. Rin: Tohsaka Rin Jewel Magus
  await createPixelSprite({
    input: path.join(fateDir, 'rin.png'),
    output: path.join(pixelDir, 'rin_pixel.png'),
    targetHeight: 880,
    pixelGridHeight: 130,
    saturation: 1.25,
    brightness: 1.05,
    numColors: 48,
  });

  console.log('All pixel character sprites created successfully!');
}

run().catch(err => {
  console.error('Error generating pixel sprites:', err);
  process.exit(1);
});
