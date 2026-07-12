require('dotenv').config({ path: '/Users/junseoha/Downloads/blank-seoul-storefront/.env.local' });

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

const GET_PRODUCT_BY_HANDLE = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      availableForSale
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            currentlyNotInStock
            selectedOptions {
              name
              value
            }
          }
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
      query: GET_PRODUCT_BY_HANDLE,
      variables: { handle: 'hunminjeongeum-mini-square-pouch' },
    }),
  });

  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
}

main();
