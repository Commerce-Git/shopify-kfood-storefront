import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testRobotsAndSitemap() {
  console.log("=== Testing robots.ts & sitemap.ts ===");

  // Test robots.ts
  const robotsModule = await import("../app/robots.ts");
  const robotsConfig = robotsModule.default();
  console.log("\n[robots.ts Result]:");
  console.log(JSON.stringify(robotsConfig, null, 2));

  // Test sitemap.ts
  const sitemapModule = await import("../app/sitemap.ts");
  const sitemapEntries = await sitemapModule.default();
  console.log(`\n[sitemap.ts Result]: Total Entries Generated: ${sitemapEntries.length}`);
  
  const sampleProducts = sitemapEntries.filter(e => e.url.includes("/product/"));
  const sampleCollections = sitemapEntries.filter(e => e.url.includes("/collections/"));
  const sampleStatic = sitemapEntries.filter(e => !e.url.includes("/product/") && !e.url.includes("/collections/"));

  console.log(`- Static pages: ${sampleStatic.length}`);
  console.log(`- Collections: ${sampleCollections.length}`);
  console.log(`- Products: ${sampleProducts.length}`);

  if (sampleProducts.length > 0) {
    console.log("\nSample Product Entry (with Google Lens images):");
    console.log(JSON.stringify(sampleProducts[0], null, 2));
  }

  console.log("\n✅ robots and sitemap execution verified successfully!");
}

testRobotsAndSitemap().catch(console.error);
