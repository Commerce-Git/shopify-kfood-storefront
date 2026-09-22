const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function downloadToteBagImages() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

  console.log(`Connecting to Shopify Store: ${domain}`);

  const handle = "hunminjeongeum-reversible-tote-bag";

  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        images(first: 50) {
          edges {
            node {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({
        query,
        variables: { handle },
      }),
    });

    const json = await res.json();
    const product = json?.data?.product;

    if (!product) {
      console.error("Product not found with handle:", handle);
      console.log("Response:", JSON.stringify(json, null, 2));
      return;
    }

    console.log(`\nFound Product: ${product.title}`);
    const images = product.images.edges.map(e => e.node);
    console.log(`Total Images found: ${images.length}`);

    const targetDir = path.resolve(__dirname, '../downloaded-images/hunminjeongeum-reversible-tote-bag');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const imgUrl = img.url;
      // Get extension from URL or default to jpg
      const cleanUrl = imgUrl.split('?')[0];
      const ext = path.extname(cleanUrl) || '.jpg';
      const fileName = `hunminjeongeum_tote_${i + 1}${ext}`;
      const filePath = path.join(targetDir, fileName);

      console.log(`[${i + 1}/${images.length}] Downloading: ${cleanUrl} -> ${fileName}`);

      const imgRes = await fetch(imgUrl);
      if (!imgRes.ok) {
        console.error(`Failed to download image ${i + 1}`);
        continue;
      }

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      console.log(`  ✓ Saved: ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
    }

    console.log(`\n🎉 All ${images.length} images downloaded successfully to:`);
    console.log(targetDir);

  } catch (err) {
    console.error("Error during download:", err);
  }
}

downloadToteBagImages();
