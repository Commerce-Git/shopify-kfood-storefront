const fetch = require('node-fetch'); // We removed node-fetch require before, so let's keep it clean.
require('dotenv').config({ path: '/Users/junseoha/Downloads/blank-seoul-storefront/.env.local' });

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

const GET_ALL_COLLECTIONS = `
  query GetAllCollections {
    collections(first: 250) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

async function main() {
  const url = `https://${domain}/api/2025-10/graphql.json`;
  const response = await globalThis.fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({
      query: GET_ALL_COLLECTIONS
    }),
  });

  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
}

main();
