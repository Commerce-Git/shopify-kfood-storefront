const fs = require('fs');
const path = require('path');
const https = require('https');

const sourcingListPath = path.join(__dirname, '../docs/sourcing-list.md');
const outputJsonPath = path.join(__dirname, '../docs/idus-products.json');
const outputImgDir = path.join(__dirname, '../assets/idus-products');

if (!fs.existsSync(outputImgDir)) {
  fs.mkdirSync(outputImgDir, { recursive: true });
}

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve();
    if (url.startsWith('//')) {
      url = 'https:' + url;
    }
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.warn(`Failed to download image ${url}: status ${res.statusCode}`);
        res.resume();
        return resolve();
      }
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', (err) => {
      console.error(`Error downloading image ${url}:`, err.message);
      resolve(); // Don't block the whole process
    });
  });
}

async function main() {
  const content = fs.readFileSync(sourcingListPath, 'utf8');
  const urlRegex = /https:\/\/www\.idus\.com\/v2\/product\/[a-zA-Z0-9-]+/g;
  const urls = [...new Set(content.match(urlRegex) || [])];

  console.log(`Found ${urls.length} URLs to scrape.`);
  
  const results = [];

  for (const url of urls) {
    try {
      console.log(`\nFetching ${url}...`);
      const html = await fetchHTML(url);
      
      // Extract structured data from ld+json
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      let title = '';
      let price = '';
      let imageUrl = '';
      let brand = '';

      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          title = jsonLd.name || '';
          imageUrl = Array.isArray(jsonLd.image) ? jsonLd.image[0] : (jsonLd.image || '');
          if (jsonLd.offers) {
            price = jsonLd.offers.price || '';
          }
          if (jsonLd.brand) {
            brand = jsonLd.brand.name || '';
          }
        } catch(e) {
          console.warn(`Failed to parse jsonLd for ${url}`);
        }
      }

      // Fallbacks via OpenGraph tags
      if (!title) {
        const ogTitle = html.match(/<meta property="og:title" content="([^"]+)">/);
        if (ogTitle) title = ogTitle[1];
      }
      if (!imageUrl) {
        const ogImage = html.match(/<meta property="og:image" content="([^"]+)">/);
        if (ogImage) imageUrl = ogImage[1];
      }

      console.log(` -> Extracted: ${title} / ${price ? price + ' KRW' : 'No Price'} / Brand: ${brand}`);

      let localImagePath = '';
      if (imageUrl) {
        const filename = imageUrl.split('/').pop().split('?')[0] || `img_${Date.now()}.jpg`;
        const filepath = path.join(outputImgDir, filename);
        await downloadImage(imageUrl, filepath);
        localImagePath = `assets/idus-products/${filename}`;
        console.log(` -> Image saved: ${localImagePath}`);
      }

      results.push({
        url,
        title,
        price,
        brand,
        imageUrl,
        localImagePath
      });

      // Small delay to be polite
      await new Promise(r => setTimeout(r, 500));

    } catch (e) {
      console.error(`Error scraping ${url}:`, e.message);
    }
  }

  fs.writeFileSync(outputJsonPath, JSON.stringify(results, null, 2));
  console.log(`\nScraping complete. Data saved to ${outputJsonPath}`);
}

main();
