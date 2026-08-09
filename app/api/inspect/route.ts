import { NextResponse } from "next/server";
import { adminGraphQL } from "@/lib/shopify/admin";
import { getAllProducts, getAllCollections } from "@/lib/shopify/api";

export async function GET() {
  try {
    // 1. Fetch Storefront Public Data
    const storefrontProducts = await getAllProducts(50);
    const storefrontCollections = await getAllCollections(20);

    // 2. Fetch Admin Deep API Data (2026 Admin OAuth)
    const adminProductsQuery = `
      query GetAdminProducts {
        products(first: 250) {
          edges {
            node {
              id
              title
              handle
              status
              vendor
              productType
              tags
              options {
                id
                name
                values
              }
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    inventoryQuantity
                    availableForSale
                    inventoryItem {
                      id
                      tracked
                      harmonizedSystemCode
                    }
                  }
                }
              }
              collections(first: 20) {
                edges {
                  node {
                    id
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
    `;

    const adminCollectionsQuery = `
      query GetAdminCollections {
        collections(first: 250) {
          edges {
            node {
              id
              title
              handle
              productsCount {
                count
              }
            }
          }
        }
      }
    `;

    let adminProducts: any[] = [];
    let adminCollections: any[] = [];
    let adminError: string | null = null;

    try {
      const adminProdRes = await adminGraphQL(adminProductsQuery);
      adminProducts = (adminProdRes?.data?.products?.edges || []).map((e: any) => e.node);

      const adminColRes = await adminGraphQL(adminCollectionsQuery);
      adminCollections = (adminColRes?.data?.collections?.edges || []).map((e: any) => ({
        id: e.node.id,
        title: e.node.title,
        handle: e.node.handle,
        productsCount: e.node.productsCount?.count || 0,
      }));
    } catch (err: any) {
      adminError = err.message || String(err);
      console.warn("⚠️ Admin API fetch warning:", adminError);
    }

    // 3. Health & Consistency Checks
    const activeProducts = adminProducts.filter((p) => p.status === "ACTIVE");
    const draftProducts = adminProducts.filter((p) => p.status === "DRAFT");
    
    const missingProductType = adminProducts.filter((p) => !p.productType || p.productType.trim() === "");
    const missingCollections = adminProducts.filter((p) => !p.collections?.edges || p.collections.edges.length === 0);
    const multiVariantProducts = adminProducts.filter((p) => p.variants?.edges?.length > 1);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      storefrontSummary: {
        totalProductsFetched: storefrontProducts.length,
        totalCollectionsFetched: storefrontCollections.length,
        collections: storefrontCollections.map((c) => ({
          id: c.id,
          title: c.title,
          handle: c.handle,
        })),
        productsPreview: storefrontProducts.slice(0, 10).map((p) => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
          availableForSale: p.availableForSale,
          variantsCount: p.variants.edges.length,
        })),
      },
      adminSummary: adminError ? { error: adminError } : {
        totalProducts: adminProducts.length,
        totalCollections: adminCollections.length,
        statusBreakdown: {
          ACTIVE: activeProducts.length,
          DRAFT: draftProducts.length,
        },
        health: {
          missingProductTypeCount: missingProductType.length,
          missingCollectionsCount: missingCollections.length,
          multiVariantProductsCount: multiVariantProducts.length,
        },
        collections: adminCollections,
        productsList: adminProducts.map((p) => {
          const variants = (p.variants?.edges || []).map((e: any) => e.node);
          return {
            id: p.id,
            title: p.title,
            handle: p.handle,
            status: p.status,
            vendor: p.vendor,
            productType: p.productType,
            tags: p.tags,
            options: p.options?.map((o: any) => ({ name: o.name, values: o.values })),
            variantsCount: variants.length,
            variants: variants.map((v: any) => ({
              id: v.id,
              title: v.title,
              sku: v.sku,
              price: v.price,
              inventoryQuantity: v.inventoryQuantity,
              availableForSale: v.availableForSale,
              hsCode: v.inventoryItem?.harmonizedSystemCode,
            })),
            collections: (p.collections?.edges || []).map((e: any) => e.node.title),
          };
        }),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
