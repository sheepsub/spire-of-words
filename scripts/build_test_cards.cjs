const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const W = 512;
const H = 724;

async function buildCards() {
  const outDir = path.resolve('test_cards');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('=== Building 6 Collector Character Cards ===');

  // 1. IRONCLAD: candidate_art/ironclad_mobalytics.png (1140x768)
  // Character face, helmet, sword, glowing eyes are around x: 200..1000, y: 0..768
  console.log('1. Processing Ironclad...');
  // 512/724 = 0.707. In 768 height, width is 768 * 0.707 = 543.
  await sharp('candidate_art/ironclad_mobalytics.png')
    .extract({ left: 340, top: 0, width: 544, height: 768 })
    .resize(W, H)
    .toFile(path.join(outDir, 'ironclad_card.png'));
  console.log('✓ Ironclad card saved.');

  // 2. SILENT: candidate_art/silent_banner.jpg (1920x1200)
  // Silent is on the right side: mask, shivs, green smoke
  console.log('2. Processing Silent...');
  // 1200 * 0.707 = 848 width. Left ~ 1072
  await sharp('candidate_art/silent_banner.jpg')
    .extract({ left: 1050, top: 0, width: 850, height: 1200 })
    .resize(W, H)
    .toFile(path.join(outDir, 'silent_card.png'));
  console.log('✓ Silent card saved.');

  // 3. DEFECT: candidate_art/defect_wp.png (1920x1080)
  // Defect is on the right side: orb, glowing core, automaton head
  console.log('3. Processing Defect...');
  // 1080 * 0.707 = 764 width. Left ~ 1100
  await sharp('candidate_art/defect_wp.png')
    .extract({ left: 1000, top: 0, width: 764, height: 1080 })
    .resize(W, H)
    .toFile(path.join(outDir, 'defect_card.png'));
  console.log('✓ Defect card saved.');

  // 4. WATCHER: public/assets/sts2/cards/watcherPortrait.webp (1920x1200)
  // Watcher is centered in the composition: staff, eye, robes
  console.log('4. Processing Watcher...');
  // 1200 * 0.707 = 848 width. Center around left: 700
  await sharp('public/assets/sts2/cards/watcherPortrait.webp')
    .extract({ left: 700, top: 0, width: 850, height: 1200 })
    .resize(W, H)
    .toFile(path.join(outDir, 'watcher_card.png'));
  console.log('✓ Watcher card saved.');

  // 5. NECROBINDER: candidate_art/necro_keengamer.png (1920x1080)
  // Necrobinder is on the right: skull, purple fire, scythe, skeletal hand
  console.log('5. Processing Necrobinder...');
  // 1080 * 0.707 = 764 width. Left ~ 950
  await sharp('candidate_art/necro_keengamer.png')
    .extract({ left: 950, top: 0, width: 764, height: 1080 })
    .resize(W, H)
    .toFile(path.join(outDir, 'necrobinder_card.png'));
  console.log('✓ Necrobinder card saved.');

  // 6. REGENT: candidate_art/regent_gamespot.jpg (1280x720)
  // Regent is on his throne: star mask, blue robe, throne
  console.log('6. Processing Regent...');
  // 720 * 0.707 = 509 width. Left ~ 500
  await sharp('candidate_art/regent_gamespot.jpg')
    .extract({ left: 500, top: 0, width: 510, height: 720 })
    .resize(W, H)
    .toFile(path.join(outDir, 'regent_card.png'));
  console.log('✓ Regent card saved.');
}

buildCards().catch(console.error);
