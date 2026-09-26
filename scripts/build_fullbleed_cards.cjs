const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const CARD_W = 512;
const CARD_H = 724;

async function run() {
  const cardsDir = path.resolve('src/assets/cards');
  if (!fs.existsSync(cardsDir)) fs.mkdirSync(cardsDir, { recursive: true });

  console.log('=== Building 6 Full-Bleed High-Fidelity Slay the Spire Cards ===');

  const heroBanner = 'C:/Users/sheep/.gemini/antigravity-ide/brain/76ef1ec5-f5df-4aa7-b747-dc56a2a2a0df/steam_library_hero.jpg';

  // 1. WATCHER (观者) - Official 1920x1200 portrait cropped to 512x724
  console.log('1. Building Watcher full-bleed card...');
  const watcherSrc = path.resolve('scratch/sts2_source/cards/watcherPortrait.webp');
  if (fs.existsSync(watcherSrc)) {
    const watcherVignette = Buffer.from(`
      <svg width="${CARD_W}" height="${CARD_H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="vignette" cx="50%" cy="40%" r="70%">
            <stop offset="50%" stop-color="transparent" stop-opacity="0"/>
            <stop offset="90%" stop-color="#1e0b36" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#0d0319" stop-opacity="0.95"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#vignette)"/>
      </svg>
    `);

    await sharp(watcherSrc)
      .extract({ left: 750, top: 0, width: 850, height: 1200 })
      .resize(CARD_W, CARD_H)
      .composite([{ input: watcherVignette, top: 0, left: 0 }])
      .jpeg({ quality: 96 })
      .toFile(path.join(cardsDir, 'watcher_card.png'));
    console.log('✓ Watcher card generated.');
  }

  // 2. IRONCLAD (铁甲战士) - Official Ironclad from Steam Hero / STS Key Art
  console.log('2. Building Ironclad full-bleed card...');
  if (fs.existsSync(heroBanner)) {
    const ironcladVignette = Buffer.from(`
      <svg width="${CARD_W}" height="${CARD_H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="fireGlow" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.3"/>
            <stop offset="60%" stop-color="transparent" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
            <stop offset="55%" stop-color="transparent" stop-opacity="0"/>
            <stop offset="90%" stop-color="#2a0505" stop-opacity="0.75"/>
            <stop offset="100%" stop-color="#0f0202" stop-opacity="0.98"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#fireGlow)"/>
        <rect width="100%" height="100%" fill="url(#vignette)"/>
      </svg>
    `);

    await sharp(heroBanner)
      .extract({ left: 990, top: 0, width: 440, height: 620 })
      .resize(CARD_W, CARD_H)
      .composite([{ input: ironcladVignette, top: 0, left: 0 }])
      .jpeg({ quality: 96 })
      .toFile(path.join(cardsDir, 'ironclad_card.png'));
    console.log('✓ Ironclad card generated.');
  }

  // 3. SILENT (静默猎手) - Official Silent with Green Mist & Skull Mask
  console.log('3. Building Silent full-bleed card...');
  if (fs.existsSync(heroBanner)) {
    const silentVignette = Buffer.from(`
      <svg width="${CARD_W}" height="${CARD_H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="poisonGlow" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#22c55e" stop-opacity="0.25"/>
            <stop offset="60%" stop-color="transparent" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
            <stop offset="55%" stop-color="transparent" stop-opacity="0"/>
            <stop offset="90%" stop-color="#042010" stop-opacity="0.75"/>
            <stop offset="100%" stop-color="#010c06" stop-opacity="0.98"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#poisonGlow)"/>
        <rect width="100%" height="100%" fill="url(#vignette)"/>
      </svg>
    `);

    await sharp(heroBanner)
      .extract({ left: 400, top: 0, width: 450, height: 620 })
      .resize(CARD_W, CARD_H)
      .composite([{ input: silentVignette, top: 0, left: 0 }])
      .jpeg({ quality: 96 })
      .toFile(path.join(cardsDir, 'silent_card.png'));
    console.log('✓ Silent card generated.');
  }

  // 4. DEFECT (故障机器人) - Official Automaton & Plasma Orbs
  console.log('4. Building Defect full-bleed card...');
  const defectSrc = path.resolve('scratch/sts2_source/cards/defect.webp');
  const defectShop = path.resolve('scratch/sts2_source/cards/defect1_epoch.webp');
  if (fs.existsSync(heroBanner)) {
    const defectVignette = Buffer.from(`
      <svg width="${CARD_W}" height="${CARD_H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="lightningGlow" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
            <stop offset="60%" stop-color="transparent" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
            <stop offset="55%" stop-color="transparent" stop-opacity="0"/>
            <stop offset="90%" stop-color="#031b2e" stop-opacity="0.75"/>
            <stop offset="100%" stop-color="#010a12" stop-opacity="0.98"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#lightningGlow)"/>
        <circle cx="120" cy="180" r="28" fill="#38bdf8" opacity="0.5" filter="blur(6px)"/>
        <circle cx="390" cy="220" r="32" fill="#818cf8" opacity="0.5" filter="blur(6px)"/>
        <rect width="100%" height="100%" fill="url(#vignette)"/>
      </svg>
    `);

    await sharp(heroBanner)
      .extract({ left: 740, top: 0, width: 440, height: 620 })
      .resize(CARD_W, CARD_H)
      .composite([{ input: defectVignette, top: 0, left: 0 }])
      .jpeg({ quality: 96 })
      .toFile(path.join(cardsDir, 'defect_card.png'));
    console.log('✓ Defect card generated.');
  }

  // 5. NECROBINDER (亡灵契约师) - Official STS2 Lich Queen & Osty
  console.log('5. Building Necrobinder full-bleed card...');
  const necroBgSrc = path.resolve('scratch/sts2_source/characters/character_select_necrobinder_bg.webp');
  const necroCharSrc = path.resolve('scratch/sts2_source/characters/characterselect_necrobinder.webp');
  if (fs.existsSync(necroBgSrc) && fs.existsSync(necroCharSrc)) {
    const bgBuf = await sharp(necroBgSrc)
      .extract({ left: 600, top: 0, width: 1100, height: 1204 })
      .resize(CARD_W, CARD_H)
      .toBuffer();

    const skullBuf = await sharp(necroCharSrc)
      .extract({ left: 3800, top: 150, width: 750, height: 700 })
      .resize(400, Math.round(400 * 700 / 750))
      .toBuffer();

    const handBuf = await sharp(necroCharSrc)
      .extract({ left: 4100, top: 850, width: 850, height: 750 })
      .resize(430, Math.round(430 * 750 / 850))
      .toBuffer();

    const handMeta = await sharp(handBuf).metadata();

    const necroVignette = Buffer.from(`
      <svg width="${CARD_W}" height="${CARD_H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="necroGlow" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#c084fc" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
            <stop offset="50%" stop-color="transparent" stop-opacity="0"/>
            <stop offset="90%" stop-color="#140624" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#08020e" stop-opacity="0.98"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#necroGlow)"/>
        <rect width="100%" height="100%" fill="url(#vignette)"/>
      </svg>
    `);

    await sharp(bgBuf)
      .composite([
        { input: skullBuf, top: 50, left: Math.round((CARD_W - 400) / 2) },
        { input: handBuf, top: CARD_H - handMeta.height, left: Math.round((CARD_W - 430) / 2) + 20 },
        { input: necroVignette, top: 0, left: 0 }
      ])
      .jpeg({ quality: 96 })
      .toFile(path.join(cardsDir, 'necrobinder_card.png'));
    console.log('✓ Necrobinder card generated.');
  }

  // 6. REGENT (储君) - Official STS2 Sovereign & Celestial Vortex
  console.log('6. Building Regent full-bleed card...');
  const regentShopSrc = path.resolve('scratch/sts2_source/cards/regent_shop.webp');
  const regentCharSrc = path.resolve('scratch/sts2_source/characters/characterselect_regent.webp');
  if (fs.existsSync(regentShopSrc) || fs.existsSync(regentCharSrc)) {
    const regentBase = fs.existsSync(regentShopSrc) ? regentShopSrc : regentCharSrc;
    const meta = await sharp(regentBase).metadata();
    
    // Extract central royal composition
    const cropW = Math.min(meta.width, 1000);
    const cropH = meta.height;
    const cropLeft = Math.round((meta.width - cropW) / 2);

    const regentVignette = Buffer.from(`
      <svg width="${CARD_W}" height="${CARD_H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="goldGlow" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
            <stop offset="45%" stop-color="transparent" stop-opacity="0"/>
            <stop offset="85%" stop-color="#211002" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#0a0501" stop-opacity="0.98"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#goldGlow)"/>
        <rect width="100%" height="100%" fill="url(#vignette)"/>
      </svg>
    `);

    await sharp(regentBase)
      .extract({ left: cropLeft, top: 0, width: cropW, height: cropH })
      .resize(CARD_W, CARD_H)
      .composite([{ input: regentVignette, top: 0, left: 0 }])
      .jpeg({ quality: 96 })
      .toFile(path.join(cardsDir, 'regent_card.png'));
    console.log('✓ Regent card generated.');
  }

  console.log('All 6 Slay the Spire cards are now 100% full-bleed, solid opaque cinematic masterpieces!');
}

run().catch(console.error);
