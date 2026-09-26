const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const W = 512;
const H = 724;

async function buildFinalCards() {
  const cardsDir = path.resolve('src/assets/cards');
  if (!fs.existsSync(cardsDir)) fs.mkdirSync(cardsDir, { recursive: true });

  console.log('=== Building Final 6 High-Fidelity Character Cards ===');

  // -------------------------------------------------------------
  // 1. IRONCLAD (铁甲战士) - Official STS2 Key Art / Greatsword & Visor
  // -------------------------------------------------------------
  console.log('1. Building Ironclad...');
  const ironcladVignette = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ironcladGlow" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#ff3b00" stop-opacity="0.18"/>
          <stop offset="65%" stop-color="transparent" stop-opacity="0"/>
          <stop offset="100%" stop-color="#140202" stop-opacity="0.8"/>
        </radialGradient>
        <linearGradient id="ironcladBottomFade" x1="0" y1="72%" x2="0" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#0c0101" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#ironcladGlow)"/>
      <rect width="100%" height="100%" fill="url(#ironcladBottomFade)"/>
    </svg>
  `);

  await sharp('candidate_art/ironclad_mobalytics.png')
    .extract({ left: 230, top: 0, width: 544, height: 768 })
    .resize(W, H)
    .composite([{ input: ironcladVignette, top: 0, left: 0 }])
    .png()
    .toFile(path.join(cardsDir, 'ironclad_card.png'));
  console.log('✓ Ironclad card saved.');

  // -------------------------------------------------------------
  // 2. SILENT (静默猎手) - Official STS Splash / Shivs & Skull Mask
  // -------------------------------------------------------------
  console.log('2. Building Silent...');
  const silentVignette = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="silentGlow" cx="55%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#22c55e" stop-opacity="0.18"/>
          <stop offset="65%" stop-color="transparent" stop-opacity="0"/>
          <stop offset="100%" stop-color="#021406" stop-opacity="0.75"/>
        </radialGradient>
        <linearGradient id="silentBottomFade" x1="0" y1="72%" x2="0" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#010d04" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#silentGlow)"/>
      <rect width="100%" height="100%" fill="url(#silentBottomFade)"/>
    </svg>
  `);

  await sharp('candidate_art/silent_banner.jpg')
    .extract({ left: 1040, top: 0, width: 850, height: 1200 })
    .resize(W, H)
    .composite([{ input: silentVignette, top: 0, left: 0 }])
    .png()
    .toFile(path.join(cardsDir, 'silent_card.png'));
  console.log('✓ Silent card saved.');

  // -------------------------------------------------------------
  // 3. DEFECT (故障机器人) - Official Automaton Plasma Orb & Core
  // -------------------------------------------------------------
  console.log('3. Building Defect...');
  // Extract defect with top starting at 840 so no green sliver at top
  const defectVignette = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="defectTopFade" x1="0" y1="0%" x2="0" y2="25%">
          <stop offset="0%" stop-color="#020e18" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#020e18" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="defectGlow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.18"/>
          <stop offset="70%" stop-color="transparent" stop-opacity="0"/>
          <stop offset="100%" stop-color="#020e18" stop-opacity="0.8"/>
        </radialGradient>
        <linearGradient id="defectBottomFade" x1="0" y1="72%" x2="0" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#01060a" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#defectGlow)"/>
      <rect width="100%" height="100%" fill="url(#defectTopFade)"/>
      <rect width="100%" height="100%" fill="url(#defectBottomFade)"/>
    </svg>
  `);

  await sharp('candidate_art/silent_wp.png')
    .extract({ left: 160, top: 820, width: 680, height: 822 })
    .resize(W, H)
    .composite([{ input: defectVignette, top: 0, left: 0 }])
    .png()
    .toFile(path.join(cardsDir, 'defect_card.png'));
  console.log('✓ Defect card saved.');

  // -------------------------------------------------------------
  // 4. WATCHER (观者) - Official Selection Art / Golden Lotus Staff
  // -------------------------------------------------------------
  console.log('4. Building Watcher...');
  const watcherVignette = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="watcherGlow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#c084fc" stop-opacity="0.18"/>
          <stop offset="70%" stop-color="transparent" stop-opacity="0"/>
          <stop offset="100%" stop-color="#11031c" stop-opacity="0.75"/>
        </radialGradient>
        <linearGradient id="watcherBottomFade" x1="0" y1="72%" x2="0" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#07010c" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#watcherGlow)"/>
      <rect width="100%" height="100%" fill="url(#watcherBottomFade)"/>
    </svg>
  `);

  await sharp('scratch/sts2_source/cards/watcherPortrait.webp')
    .extract({ left: 700, top: 0, width: 850, height: 1200 })
    .resize(W, H)
    .composite([{ input: watcherVignette, top: 0, left: 0 }])
    .png()
    .toFile(path.join(cardsDir, 'watcher_card.png'));
  console.log('✓ Watcher card saved.');

  // -------------------------------------------------------------
  // 5. NECROBINDER (亡灵契约师) - Official STS2 Key Art Scythe & Osty
  // -------------------------------------------------------------
  console.log('5. Building Necrobinder...');
  // From regent_icyveins.webp (1920x1080), Necrobinder is at x: 1220..1920, y: 30..880
  // Osty hand + Necrobinder with Scythe and Purple Hair!
  const necroVignette = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="necroGlow" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#c084fc" stop-opacity="0.2"/>
          <stop offset="70%" stop-color="transparent" stop-opacity="0"/>
          <stop offset="100%" stop-color="#1a0426" stop-opacity="0.8"/>
        </radialGradient>
        <linearGradient id="necroBottomFade" x1="0" y1="65%" x2="0" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="85%" stop-color="#14011f" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#08000d" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#necroGlow)"/>
      <rect width="100%" height="100%" fill="url(#necroBottomFade)"/>
    </svg>
  `);

  await sharp('candidate_art/regent_icyveins.webp')
    .extract({ left: 1240, top: 40, width: 680, height: 750 })
    .resize(W, H)
    .composite([{ input: necroVignette, top: 0, left: 0 }])
    .png()
    .toFile(path.join(cardsDir, 'necrobinder_card.png'));
  console.log('✓ Necrobinder card saved.');

  // -------------------------------------------------------------
  // 6. REGENT (储君 / 摄政王) - Official STS2 Throne of Stars
  // -------------------------------------------------------------
  console.log('6. Building Regent...');
  const regentVignette = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="regentGlow" cx="55%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.25"/>
          <stop offset="70%" stop-color="transparent" stop-opacity="0"/>
          <stop offset="100%" stop-color="#1f0f03" stop-opacity="0.85"/>
        </radialGradient>
        <linearGradient id="regentBottomFade" x1="0" y1="65%" x2="0" y2="92%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="70%" stop-color="#1f0f03" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#0c0501" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#regentGlow)"/>
      <rect width="100%" height="100%" fill="url(#regentBottomFade)"/>
    </svg>
  `);

  await sharp('candidate_art/regent_gamespot.jpg')
    .extract({ left: 560, top: 0, width: 500, height: 700 })
    .resize(W, H)
    .composite([{ input: regentVignette, top: 0, left: 0 }])
    .png()
    .toFile(path.join(cardsDir, 'regent_card.png'));
  console.log('✓ Regent card saved.');

  console.log('=== All 6 Final Character Cards Built Successfully! ===');
}

buildFinalCards().catch(console.error);
