require('dotenv').config({ path: '.env.local' });

async function updateHandles() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_CLIENT_SECRET;

  const fetchProductsQuery = `
    {
      products(first: 50) {
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

  try {
    // 1. Fetch all products
    const res = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token
      },
      body: JSON.stringify({ query: fetchProductsQuery })
    });
    
    const json = await res.json();
    
    if (!json.data) {
      console.error("API Error Response:", JSON.stringify(json, null, 2));
      return;
    }
    
    const products = json.data.products.edges.map(e => e.node);

    for (const product of products) {
      // Create a clean English slug from the title
      const expectedHandle = product.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
        .replace(/(^-|-$)+/g, '');   // Trim leading/trailing dashes

      // If the current handle doesn't match the clean English slug
      if (product.handle !== expectedHandle) {
        console.log(`Updating [${product.title}]`);
        console.log(`  Old handle: ${product.handle}`);
        console.log(`  New handle: ${expectedHandle}`);

        const updateMutation = `
          mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
              product {
                id
                handle
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const updateRes = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": token
          },
          body: JSON.stringify({
            query: updateMutation,
            variables: {
              input: {
                id: product.id,
                handle: expectedHandle
              }
            }
          })
        });

        const updateJson = await updateRes.json();
        
        if (updateJson.data?.productUpdate?.userErrors?.length > 0) {
          console.error(`  Error updating:`, updateJson.data.productUpdate.userErrors);
        } else {
          console.log(`  Success!`);
        }
      } else {
        console.log(`Skipping [${product.title}] - handle is already correct: ${product.handle}`);
      }
    }
    
    console.log("Done updating handles.");

  } catch (err) {
    console.error("Error running script:", err);
  }
}

updateHandles();
