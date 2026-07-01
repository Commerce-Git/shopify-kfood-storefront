require('dotenv').config({ path: '.env.local' });

async function checkCollections() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_CLIENT_SECRET;

  const query = `
    {
      collections(first: 10) {
        edges {
          node {
            title
            handle
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token
      },
      body: JSON.stringify({ query })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkCollections();
