import { config } from "dotenv";
config({ path: ".env.local" });
import { adminGraphQL } from "../lib/shopify/admin";

async function testHsCodeQuery() {
  console.log("🔍 Testing Shopify Admin GraphQL API for harmonizedSystemCodes...");
  
  const query = `
    query SearchHsCodes($searchTerm: String!) {
      harmonizedSystemCodes(searchTerm: $searchTerm, first: 5) {
        edges {
          node {
            code
            description
          }
        }
      }
    }
  `;

  try {
    const searchTerms = ["4202", "bag", "ceramic"];
    for (const term of searchTerms) {
      console.log(`\n----------------------------------------`);
      console.log(`🔎 Search Term: "${term}"`);
      const data = await adminGraphQL(query, { searchTerm: term });
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("❌ Error querying Shopify HS Codes:", err);
  }
}

testHsCodeQuery();
