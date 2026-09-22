const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputDir = path.resolve(__dirname, '../downloaded-images/hunminjeongeum-reversible-tote-bag');
const outputDir = path.join(inputDir, 'en');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const BG_COLOR = '#E9E8E1'; // Exact background tone of the lookbook
const DARK_BOX_COLOR = '#3C3F43'; // Exact dark grey tone of feature boxes

async function generateAll() {
  console.log('🚀 Starting English conversion for Hunminjeongeum Tote Bag images...\n');

  // =========================================================================
  // IMAGE 2: Cover Hero Banner
  // =========================================================================
  {
    console.log('Processing Image 2 (Hero Cover)...');
    const svg = `
      <svg width="860" height="1100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .main-title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; font-size: 38px; font-weight: 800; fill: #18181B; letter-spacing: -0.5px; }
            .sub-slogan { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; font-size: 19px; font-weight: 600; fill: #27272A; letter-spacing: -0.2px; }
          </style>
        </defs>

        <!-- Mask Korean Title: "투톤 훈민정음 양면 가방" -->
        <rect x="38" y="86" width="620" height="65" fill="${BG_COLOR}" />
        <text x="42" y="132" class="main-title">Two-Tone Reversible Tote Bag</text>

        <!-- Mask Korean Slogan: "고전의 품격과 현대의 세련미를 동시에" -->
        <rect x="440" y="1035" width="395" height="40" fill="${BG_COLOR}" />
        <text x="825" y="1062" class="sub-slogan" text-anchor="end">Timeless Classical Elegance Meets Modern Chic</text>
      </svg>
    `;

    await sharp(path.join(inputDir, 'hunminjeongeum_tote_2.png'))
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .toFile(path.join(outputDir, 'hunminjeongeum_tote_2_en.png'));
    console.log('  ✓ Image 2 complete: hunminjeongeum_tote_2_en.png');
  }

  // =========================================================================
  // IMAGE 3: Feature 1 (One Bag, Two Distinct Looks)
  // =========================================================================
  {
    console.log('Processing Image 3 (Dual Looks & Lightweight)...');
    const svg = `
      <svg width="860" height="1100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .header-l1 { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 42px; font-weight: 800; fill: #18181B; letter-spacing: -0.5px; }
            .header-l2 { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 42px; font-weight: 800; fill: #18181B; letter-spacing: -0.5px; }
            .badge-text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 19px; font-weight: 800; fill: #18181B; letter-spacing: 0.5px; }
            .caption { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; font-weight: 600; fill: #3F3F46; }
          </style>
        </defs>

        <!-- Mask & Replace Top Header ("하나의 가방 / 두 가지연출") -->
        <rect x="440" y="25" width="400" height="135" fill="${BG_COLOR}" />
        <text x="830" y="75" class="header-l1" text-anchor="end">One Bag,</text>
        <text x="830" y="130" class="header-l2" text-anchor="end">Two Distinct Looks</text>

        <!-- Mask & Replace Badge 1 ("양면사용") -->
        <rect x="250" y="275" width="250" height="52" fill="#FFFFFF" />
        <text x="375" y="308" class="badge-text" text-anchor="middle">REVERSIBLE</text>

        <!-- Mask & Replace Desc 1 ("앞뒤가 다른 매력 / 훈민정음 & 메탈") -->
        <rect x="160" y="340" width="350" height="30" fill="${BG_COLOR}" />
        <text x="500" y="360" class="caption" text-anchor="end">Dual-sided charm / Sacred Script &amp; Sleek Metallic</text>

        <!-- Mask & Replace Badge 2 ("가벼운 착용감") -->
        <rect x="548" y="785" width="250" height="52" fill="#FFFFFF" />
        <text x="673" y="818" class="badge-text" text-anchor="middle">FEATHERLIGHT FIT</text>

        <!-- Mask & Replace Desc 2 ("편안한 핏과 가벼운 무게로 부담없이 사용") -->
        <rect x="510" y="850" width="340" height="30" fill="${BG_COLOR}" />
        <text x="840" y="870" class="caption" text-anchor="end">Effortless relaxed silhouette and weightless daily wear</text>
      </svg>
    `;

    await sharp(path.join(inputDir, 'hunminjeongeum_tote_3.png'))
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .toFile(path.join(outputDir, 'hunminjeongeum_tote_3_en.png'));
    console.log('  ✓ Image 3 complete: hunminjeongeum_tote_3_en.png');
  }

  // =========================================================================
  // IMAGE 4: Fabrics & Materials
  // =========================================================================
  {
    console.log('Processing Image 4 (Fabric & Materials Specs)...');
    const svg = `
      <svg width="860" height="1100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .box-title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 22px; font-weight: 800; fill: #FFFFFF; letter-spacing: 0.5px; }
            .box-sub { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13.5px; font-weight: 500; fill: #FFFFFF; }
            .spec-text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14.5px; font-weight: 600; fill: #27272A; }
          </style>
        </defs>

        <!-- Box 1: Metallic PU (Top Right) -->
        <rect x="470" y="215" width="335" height="80" fill="${DARK_BOX_COLOR}" />
        <text x="637" y="247" class="box-title" text-anchor="middle">METALLIC PU</text>
        <text x="637" y="276" class="box-sub" text-anchor="middle">Deep &amp; Luxurious Wine Burgundy</text>

        <!-- Box 1 Spec text below box: "나이론100에 PU Coating" -->
        <rect x="520" y="308" width="290" height="28" fill="${BG_COLOR}" />
        <text x="795" y="327" class="spec-text" text-anchor="end">100% Nylon with PU Coating</text>

        <!-- Box 2: Hunminjeongeum (Middle Right Tilted) -->
        <!-- Tilted group matching the ~ -18deg angle -->
        <g transform="rotate(-18.5, 820, 520)">
          <rect x="650" y="490" width="280" height="58" fill="${DARK_BOX_COLOR}" />
          <text x="790" y="527" class="box-title" text-anchor="middle">HUNMINJEONGEUM</text>
        </g>
        <!-- Box 2 Spec: "면 100%" -->
        <rect x="780" y="530" width="75" height="28" fill="${BG_COLOR}" />
        <text x="850" y="550" class="spec-text" text-anchor="end">100% Cotton</text>

        <!-- Box 3: Cracked Cotton (Bottom Left) -->
        <rect x="70" y="785" width="255" height="58" fill="${DARK_BOX_COLOR}" />
        <text x="197" y="822" class="box-title" text-anchor="middle">CRACKED TEXTURE</text>

        <!-- Box 3 Spec: "폴리우레탄5%, 면20%, 폴리75%" -->
        <rect x="80" y="855" width="250" height="30" fill="${BG_COLOR}" />
        <text x="200" y="877" class="spec-text" text-anchor="middle">Poly 75%, Cotton 20%, PU 5%</text>
      </svg>
    `;

    await sharp(path.join(inputDir, 'hunminjeongeum_tote_4.png'))
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .toFile(path.join(outputDir, 'hunminjeongeum_tote_4_en.png'));
    console.log('  ✓ Image 4 complete: hunminjeongeum_tote_4_en.png');
  }

  // =========================================================================
  // IMAGE 5: Dimensions & Everyday Usability
  // =========================================================================
  {
    console.log('Processing Image 5 (Dimensions & Spec)...');
    const svg = `
      <svg width="860" height="1100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .header-size { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 42px; font-weight: 800; fill: #18181B; }
            .desc-line { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 15px; font-weight: 600; fill: #27272A; line-height: 1.6; }
          </style>
        </defs>

        <!-- Mask & Replace Top Header ("사이즈") -->
        <rect x="270" y="60" width="280" height="60" fill="${BG_COLOR}" />
        <text x="275" y="108" class="header-size">SPEC &amp; SIZING</text>

        <!-- Mask & Replace Bottom Paragraph -->
        <rect x="145" y="775" width="370" height="120" fill="${BG_COLOR}" />
        <text x="150" y="802" class="desc-line">Spacious interior accommodates</text>
        <text x="150" y="830" class="desc-line">everyday essentials effortlessly.</text>
        <text x="150" y="858" class="desc-line">Ergonomic handle designed for hand-carry.</text>
        <text x="150" y="886" class="desc-line">Lightweight, versatile for any daily styling.</text>
      </svg>
    `;

    await sharp(path.join(inputDir, 'hunminjeongeum_tote_5.png'))
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .toFile(path.join(outputDir, 'hunminjeongeum_tote_5_en.png'));
    console.log('  ✓ Image 5 complete: hunminjeongeum_tote_5_en.png');
  }

  // =========================================================================
  // IMAGE 6: Multi-Angle Craftsmanship Details
  // =========================================================================
  {
    console.log('Processing Image 6 (Craftsmanship Angles)...');
    const svg = `
      <svg width="860" height="1100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .header-detail { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 38px; font-weight: 800; fill: #18181B; letter-spacing: -0.5px; }
            .sub-detail { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 24px; font-weight: 600; fill: #3F3F46; letter-spacing: -0.2px; }
          </style>
        </defs>

        <!-- Mask & Replace Header: "다양한 각도에서 보는 / 디테일" -->
        <rect x="220" y="55" width="580" height="125" fill="${BG_COLOR}" />
        <text x="235" y="105" class="header-detail">Craftsmanship Details</text>
        <text x="235" y="150" class="sub-detail">Explored from Every Angle</text>
      </svg>
    `;

    await sharp(path.join(inputDir, 'hunminjeongeum_tote_6.png'))
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .toFile(path.join(outputDir, 'hunminjeongeum_tote_6_en.png'));
    console.log('  ✓ Image 6 complete: hunminjeongeum_tote_6_en.png');
  }

  console.log('\n🎉 ALL 5 DETAILED IMAGES SUCCESSFULLY CONVERTED TO ENGLISH!');
  console.log('Output location:', outputDir);
}

generateAll().catch(console.error);
