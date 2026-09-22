const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputDir = path.resolve(__dirname, '../downloaded-images/hunminjeongeum-reversible-tote-bag');
const outputDir = path.join(inputDir, 'en');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function convertImage2() {
  // Image 2: 860 x 1100
  // Background color around title: ~#E5E3DE / #EAE8E3
  // Korean to replace:
  // 1) "투톤 훈민정음 양면 가방" (around x: 40~650, y: 75~135)
  // 2) "고전의 품격과 현대의 세련미를 동시에" (around x: 500~830, y: 940~975)

  const svgOverlay = `
    <svg width="860" height="1100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap');
          .title { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 38px; font-weight: 800; fill: #1C1C1E; letter-spacing: -0.5px; }
          .subtitle { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 19px; font-weight: 600; fill: #2C2C2E; letter-spacing: -0.2px; }
        </style>
      </defs>

      <!-- Mask Korean Title -->
      <rect x="35" y="70" width="650" height="75" fill="#E8E6E1" />
      <text x="42" y="125" class="title">Two-Tone Reversible Tote Bag</text>

      <!-- Mask Korean Subtitle -->
      <rect x="420" y="935" width="415" height="45" fill="#E8E6E1" />
      <text x="825" y="964" class="subtitle" text-anchor="end">Timeless Classical Elegance &amp; Modern Chic</text>
    </svg>
  `;

  await sharp(path.join(inputDir, 'hunminjeongeum_tote_2.png'))
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .toFile(path.join(outputDir, 'hunminjeongeum_tote_2_en.png'));

  console.log('✓ Converted image 2 to English');
}

convertImage2();
