const fetch = require('node-fetch'); // We will use globalThis.fetch in node v22

async function main() {
  const url = 'http://localhost:3001/collections/carry-art-bags';
  try {
    const res = await globalThis.fetch(url);
    const text = await res.text();
    console.log('Page size in chars:', text.length);
    const hasProduct = text.includes('Hunminjeongeum Mini Square Pouch');
    console.log('Includes Hunminjeongeum Mini Square Pouch?', hasProduct);

    if (hasProduct) {
      // Find the index of the product title
      const idx = text.indexOf('Hunminjeongeum Mini Square Pouch');
      // Print 500 characters around it to inspect the HTML/RSC block
      console.log('Context around product:', text.slice(idx - 1000, idx + 1000));
    }
  } catch (err) {
    console.error(err);
  }
}

main();
