const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createCharacterCard({
  id,
  name,
  title,
  servantClass,
  portraitPath,
  spritePath,
  color,
  glowColor,
  bgGradient,
  output,
}) {
  const width = 512;
  const height = 724;

  console.log(`Generating card for ${name} (${id})...`);

  // 1. Prepare character art
  // We composite the portrait / sprite onto the card
  let charArtBuf;
  if (fs.existsSync(portraitPath)) {
    charArtBuf = await sharp(portraitPath)
      .resize(400, 480, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
  } else if (fs.existsSync(spritePath)) {
    charArtBuf = await sharp(spritePath)
      .resize(380, 460, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
  }

  // 2. Generate Ornate Gothic Card Frame SVG
  const cardSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background Gradient -->
      <radialGradient id="bgGlow" cx="50%" cy="38%" r="65%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.38"/>
        <stop offset="60%" stop-color="#0a0c14" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#040508" stop-opacity="1"/>
      </radialGradient>

      <!-- Gold Metallic Outer Border -->
      <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="30%" stop-color="#eab308"/>
        <stop offset="70%" stop-color="#854d0e"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </linearGradient>

      <!-- Inner Accent Border -->
      <linearGradient id="accentBorder" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>

      <!-- Banner Gradient -->
      <linearGradient id="bannerBg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0f172a" stop-opacity="0.95"/>
        <stop offset="50%" stop-color="#1e1b4b" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95"/>
      </linearGradient>
    </defs>

    <!-- Base Card Fill -->
    <rect x="0" y="0" width="${width}" height="${height}" rx="16" fill="url(#bgGlow)"/>

    <!-- Subtle Dungeon Brick Lines -->
    <path d="M 30 180 L 482 180 M 30 360 L 482 360 M 30 520 L 482 520" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>

    <!-- Arcane Halo Behind Character -->
    <circle cx="256" cy="300" r="180" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.45"/>
    <circle cx="256" cy="300" r="140" fill="none" stroke="${color}" stroke-width="1" opacity="0.3"/>

    <!-- Double Outer Ornate Frame -->
    <rect x="10" y="10" width="492" height="704" rx="12" fill="none" stroke="url(#goldBorder)" stroke-width="4"/>
    <rect x="18" y="18" width="476" height="688" rx="8" fill="none" stroke="url(#accentBorder)" stroke-width="2"/>
    <rect x="24" y="24" width="464" height="676" rx="6" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>

    <!-- Corner Filigree Ornaments -->
    <!-- Top-Left -->
    <path d="M 18 45 L 45 18 L 45 32 L 32 45 Z" fill="url(#goldBorder)"/>
    <!-- Top-Right -->
    <path d="M 494 45 L 467 18 L 467 32 L 480 45 Z" fill="url(#goldBorder)"/>
    <!-- Bottom-Left -->
    <path d="M 18 679 L 45 706 L 45 692 L 32 679 Z" fill="url(#goldBorder)"/>
    <!-- Bottom-Right -->
    <path d="M 494 679 L 467 706 L 467 692 L 480 679 Z" fill="url(#goldBorder)"/>

    <!-- Top Header Badge: Class & Title -->
    <g transform="translate(256, 48)">
      <path d="M -130 -14 L 130 -14 L 145 12 L -145 12 Z" fill="#0c0e17" stroke="url(#goldBorder)" stroke-width="1.5"/>
      <text x="0" y="4" font-family="Cinzel, Georgia, serif" font-weight="900" font-size="14" fill="#fef08a" text-anchor="middle" letter-spacing="3">
        ${servantClass.toUpperCase()}
      </text>
    </g>

    <!-- Bottom Character Info Plaque -->
    <g transform="translate(256, 620)">
      <!-- Outer Plaque Shape -->
      <path d="M -210 -35 L 210 -35 L 225 15 L 210 40 L -210 40 L -225 15 Z" fill="#090b14" stroke="url(#goldBorder)" stroke-width="2"/>
      
      <!-- Inner Plaque Accent -->
      <rect x="-195" y="-28" width="390" height="60" fill="url(#bannerBg)" rx="4" stroke="${color}" stroke-width="1"/>
      
      <!-- Character Name -->
      <text x="0" y="-4" font-family="Cinzel, Georgia, serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle" letter-spacing="2">
        ${name}
      </text>

      <!-- Subtitle & Archetype -->
      <text x="0" y="20" font-family="'Courier New', monospace" font-weight="700" font-size="12" fill="${color}" text-anchor="middle" letter-spacing="1">
        ✦ ${title} ✦
      </text>
    </g>

    <!-- STS Rarity Gems on Corners -->
    <polygon points="256,12 262,24 256,36 250,24" fill="${color}" stroke="#ffffff" stroke-width="1"/>
  </svg>
  `;

  // 3. Composite card: Background + Character Artwork + Frame
  const baseCard = await sharp(Buffer.from(cardSvg)).png().toBuffer();

  const finalCard = await sharp(baseCard)
    .composite([
      {
        input: charArtBuf,
        top: 100,
        left: 56,
      },
      // Re-apply frame on top so borders and plaque sit above the character
      {
        input: Buffer.from(cardSvg),
        top: 0,
        left: 0,
      }
    ])
    .png({ quality: 95 })
    .toFile(output);

  console.log(`✓ Card created: ${path.basename(output)}, ${(fs.statSync(output).size / 1024).toFixed(1)} KB`);
}

async function run() {
  const cardsDir = path.resolve('src/assets/cards');
  const stsCardsDir = path.resolve('android/app/src/main/assets/public/assets/sts2/cards');
  const pixelDir = path.resolve('src/assets/pixel');

  // 1. Ironclad
  await createCharacterCard({
    id: 'ironclad',
    name: '铁甲战士 · IRONCLAD',
    title: '恶魔之契 · 狂暴重剑',
    servantClass: 'VANGUARD · 狂暴战鬼',
    portraitPath: path.join(stsCardsDir, 'char_select_ironclad.webp'),
    spritePath: path.join(pixelDir, 'ironclad_pixel.png'),
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    output: path.join(cardsDir, 'ironclad_card.png'),
  });

  // 2. Silent
  await createCharacterCard({
    id: 'silent',
    name: '静默猎手 · SILENT',
    title: '幽冥毒刺 · 雾林猎手',
    servantClass: 'ASSASSIN · 幽冥双刃',
    portraitPath: path.join(stsCardsDir, 'char_select_silent.webp'),
    spritePath: path.join(pixelDir, 'silent_pixel.png'),
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.6)',
    output: path.join(cardsDir, 'silent_card.png'),
  });

  // 3. Defect
  await createCharacterCard({
    id: 'defect',
    name: '故障机器人 · DEFECT',
    title: '远古灵械 · 充能核心',
    servantClass: 'AUTOMATON · 元素导能',
    portraitPath: path.join(stsCardsDir, 'char_select_defect.webp'),
    spritePath: path.join(pixelDir, 'defect_pixel.png'),
    color: '#0ea5e9',
    glowColor: 'rgba(14, 165, 233, 0.6)',
    output: path.join(cardsDir, 'defect_card.png'),
  });

  // 4. Watcher
  await createCharacterCard({
    id: 'watcher',
    name: '观者 · WATCHER',
    title: '禅心澈悟 · 诛灭神姿',
    servantClass: 'MONK · 盲眼神性',
    portraitPath: path.join(stsCardsDir, 'char_select_watcher.webp'),
    spritePath: path.join(pixelDir, 'watcher_pixel.png'),
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    output: path.join(cardsDir, 'watcher_card.png'),
  });

  // 5. Necrobinder
  await createCharacterCard({
    id: 'necrobinder',
    name: '亡灵契约师 · NECROBINDER',
    title: '幽冥誓约 · 尖塔巫妖',
    servantClass: 'LICH QUEEN · 奥斯提之契',
    portraitPath: path.join(stsCardsDir, 'char_select_necrobinder.webp'),
    spritePath: path.join(pixelDir, 'necrobinder_pixel.png'),
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.6)',
    output: path.join(cardsDir, 'necrobinder_card.png'),
  });

  // 6. Regent
  await createCharacterCard({
    id: 'regent',
    name: '储君 · REGENT',
    title: '群星之冕 · 苍穹继承者',
    servantClass: 'SOVEREIGN · 群星王座',
    portraitPath: path.join(stsCardsDir, 'char_select_regent.webp'),
    spritePath: path.join(pixelDir, 'regent_pixel.png'),
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    output: path.join(cardsDir, 'regent_card.png'),
  });

  console.log('All 6 Slay the Spire character cards generated successfully!');
}

run().catch(console.error);
