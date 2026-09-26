const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const W = 512;
const H = 724;

async function generatePolishedCards() {
  const outDir = path.resolve('test_cards_polished');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. IRONCLAD: extract centered face + greatsword from ironclad_mobalytics.png
  console.log('1. Polishing Ironclad...');
  // Source is 1140x768. Character center is around x: 550.
  // Take width 543, height 768 from left: 240.
  const ironcladVignette = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="emberGlow" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#ff4400" stop-opacity="0.15"/>
          <stop offset="70%" stop-color="transparent" stop-opacity="0"/>
          <stop offset="100%" stop-color="#120202" stop-opacity="0.75"/>
        </radialGradient>
        <linearGradient id="bottomFade" x1="0" y1="75%" x2="0" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#0a0101" stop-opacity="0.85"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#emberGlow)"/>
      <rect width="100%" height="100%" fill="url(#bottomFade)"/>
    </svg>
  `);

  await sharp('candidate_art/ironclad_mobalytics.png')
    .extract({ left: 230, top: 0, width: 544, height: 768 })
    .resize(W, H)
    .composite([{ input: ironcladVignette, top: 0, left: 0 }])
    .png()
    .toFile(path.join(outDir, 'ironclad_card.png'));
  console.log('✓ Ironclad polished.');

  // 2. SILENT: silent_banner.jpg (1920x1200)
  console.log('2. Polishing Silent...');
  const silentVignette = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="poisonGlow" cx="55%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#22c55e" stop-opacity="0.15"/>
          <stop offset="70%" stop-color="transparent" stop-opacity="0"/>
          <stop offset="100%" stop-color="#021406" stop-opacity="0.7"/>
        </radialGradient>
        <linearGradient id="bottomFade" x1="0" y1="75%" x2="0" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#020d04" stop-opacity="0.85"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#poisonGlow)"/>
      <rect width="100%" height="100%" fill="url(#bottomFade)"/>
    </svg>
  `);

  await sharp('candidate_art/silent_banner.jpg')
    .extract({ left: 1040, top: 0, width: 850, height: 1200 })
    .resize(W, H)
    .composite([{ input: silentVignette, top: 0, left: 0 }])
    .png()
    .toFile(path.join(outDir, 'silent_card.png'));
  console.log('✓ Silent polished.');

  // 3. DEFECT: silent_wp.png (1275x1642)
  console.log('3. Polishing Defect...');
  // Defect is at the bottom: left: 240, top: 800, width: 700, height: 989 -> 700/0.707 = 990
  const defectVignette = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lightningGlow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.15"/>
          <stop offset="70%" stop-color="transparent" stop-opacity="0"/>
          <stop offset="100%" stop-color="#020e18" stop-opacity="0.7"/>
        </radialGradient>
        <linearGradient id="bottomFade" x1="0" y1="75%" x2="0" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#01060a" stop-opacity="0.85"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#lightningGlow)"/>
      <rect width="100%" height="100%" fill="url(#bottomFade)"/>
    </svg>
  `);

  await sharp('candidate_art/silent_wp.png')
    .extract({ left: 220, top: 780, width: 620, height: 860 })
    .resize(W, H)
    .composite([{ input: defectVignette, top: 0, left: 0 }])
    .png()
    .toFile(path.join(outDir, 'defect_card.png'));
  console.log('✓ Defect polished.');

  // 4. WATCHER: scratch/sts2_source/cards/watcherPortrait.webp (1920x1200)
  console.log('4. Polishing Watcher...');
  const watcherVignette = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="zenGlow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#c084fc" stop-opacity="0.15"/>
          <stop offset="70%" stop-color="transparent" stop-opacity="0"/>
          <stop offset="100%" stop-color="#11031c" stop-opacity="0.65"/>
        </radialGradient>
        <linearGradient id="bottomFade" x1="0" y1="75%" x2="0" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#07010c" stop-opacity="0.85"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#zenGlow)"/>
      <rect width="100%" height="100%" fill="url(#bottomFade)"/>
    </svg>
  `);

  await sharp('scratch/sts2_source/cards/watcherPortrait.webp')
    .extract({ left: 700, top: 0, width: 850, height: 1200 })
    .resize(W, H)
    .composite([{ input: watcherVignette, top: 0, left: 0 }])
    .png()
    .toFile(path.join(outDir, 'watcher_card.png'));
  console.log('✓ Watcher polished.');

  // 5. NECROBINDER: clean upper body from candidate_art/necro_keengamer.png
  console.log('5. Polishing Necrobinder...');
  // The clean upper body is in { left: 950, top: 0, width: 680, height: 750 }
  // We composite this onto a background of character_select_necrobinder_bg.webp resized to WxH
  const necroCharBuffer = await sharp('candidate_art/necro_keengamer.png')
    .extract({ left: 960, top: 0, width: 680, height: 720 })
    .resize(W, Math.round(W * 720 / 680)) // 512 x 542
    .toBuffer();

  const necroGradient = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="necroFade" x1="0" y1="50%" x2="0" y2="100%">
          <stop offset="0%" stop-color="#831843" stop-opacity="0"/>
          <stop offset="65%" stop-color="#500724" stop-opacity="0.6"/>
          <stop offset="90%" stop-color="#2a0314" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#14010a" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#necroFade)"/>
    </svg>
  `);

  await sharp('scratch/sts2_source/characters/character_select_necrobinder_bg.webp')
    .resize(W, H)
    .composite([
      { input: necroCharBuffer, top: 0, left: 0 },
      { input: necroGradient, top: 0, left: 0 }
    ])
    .png()
    .toFile(path.join(outDir, 'necrobinder_card.png'));
  console.log('✓ Necrobinder polished.');

  // 6. REGENT: candidate_art/regent_gamespot.jpg
  console.log('6. Polishing Regent...');
  // In regent_gamespot.jpg (1280x720):
  // Clean region: { left: 520, top: 0, width: 560, height: 550 }
  const regentCharBuffer = await sharp('candidate_art/regent_gamespot.jpg')
    .extract({ left: 520, top: 0, width: 560, height: 550 })
    .resize(W, Math.round(W * 550 / 560)) // 512 x 503
    .toBuffer();

  const regentGradient = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="nebulaGlow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#1c0c02" stop-opacity="0.8"/>
        </radialGradient>
        <linearGradient id="regentFade" x1="0" y1="50%" x2="0" y2="100%">
          <stop offset="0%" stop-color="#78350f" stop-opacity="0"/>
          <stop offset="65%" stop-color="#451a03" stop-opacity="0.6"/>
          <stop offset="90%" stop-color="#220d02" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#0d0401" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <!-- Base star stone background -->
      <rect width="100%" height="100%" fill="#78350f"/>
      <rect width="100%" height="100%" fill="url(#nebulaGlow)"/>
      <rect width="100%" height="100%" fill="url(#regentFade)"/>
    </svg>
  `);

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: { r: 120, g: 53, b: 15, alpha: 1 }
    }
  })
    .composite([
      { input: regentCharBuffer, top: 0, left: 0 },
      { input: regentGradient, top: 0, left: 0 }
    ])
    .png()
    .toFile(path.join(outDir, 'regent_card.png'));
  console.log('✓ Regent polished.');
}

generatePolishedCards().catch(console.error);
