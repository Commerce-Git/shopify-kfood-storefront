import { NextResponse } from "next/server";
import { adminGraphQL } from "@/lib/shopify/admin";

export async function GET() {
  try {
    const logs: string[] = [];

    // 1. Fetch All Collections
    const getColsQuery = `
      query GetCollections {
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

    const colsRes = await adminGraphQL(getColsQuery);
    const collections = (colsRes?.data?.collections?.edges || []).map((e: any) => e.node);

    // 2. Fetch All Products
    const getProdsQuery = `
      query GetProducts {
        products(first: 250) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `;
    const prodsRes = await adminGraphQL(getProdsQuery);
    const products = (prodsRes?.data?.products?.edges || []).map((e: any) => e.node);
    const productIds = products.map((p: any) => p.id);

    // 3. Find or Create "All Heritage Editions" Collection
    let heritageCol = collections.find(
      (c: any) => c.title === "All Heritage Editions" || c.handle === "all-heritage-editions"
    );
    let heritageColId = heritageCol?.id;

    if (!heritageColId) {
      const createColMutation = `
        mutation collectionCreate($input: CollectionInput!) {
          collectionCreate(input: $input) {
            collection { id title }
            userErrors { field message }
          }
        }
      `;
      const createRes = await adminGraphQL(createColMutation, {
        input: {
          title: "All Heritage Editions",
          handle: "all-heritage-editions",
          descriptionHtml: "<p>All signature handcrafted Korean art pieces.</p>"
        }
      });
      heritageColId = createRes?.data?.collectionCreate?.collection?.id;
      logs.push(`✨ 'All Heritage Editions' 단일 컬렉션 신규 생성 완료 (${heritageColId})`);
    } else {
      logs.push(`ℹ️ 기존 'All Heritage Editions' 컬렉션 확인 (${heritageColId})`);
    }

    // 4. Assign all live products to "All Heritage Editions"
    if (heritageColId && productIds.length > 0) {
      const addProdsMutation = `
        mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
          collectionAddProducts(id: $id, productIds: $productIds) {
            userErrors { field message }
          }
        }
      `;
      await adminGraphQL(addProdsMutation, { id: heritageColId, productIds });
      logs.push(`✅ 'All Heritage Editions' 컬렉션에 ${productIds.length}개 상품 최종 매핑 완료`);
    }

    // 5. Delete the 8 empty legacy collections from Shopify Admin!
    const legacyTitlesToDelete = [
      "Necklaces & Headbands",
      "Hair Scrunchies & Binyeo",
      "Keyrings & Bag Charms",
      "Pouches & Wristlets",
      "Hobo & Shoulder Bags",
      "Wallets & Passport Cases",
      "Home Decor & Doorbells",
      "Tea & Dining"
    ];

    const deleteMutation = `
      mutation collectionDelete($input: CollectionDeleteInput!) {
        collectionDelete(input: $input) {
          deletedCollectionId
          userErrors { field message }
        }
      }
    `;

    const deletedResults: string[] = [];
    for (const title of legacyTitlesToDelete) {
      const target = collections.find((c: any) => c.title === title);
      if (target) {
        const delRes = await adminGraphQL(deleteMutation, {
          input: { id: target.id }
        });
        if (delRes?.data?.collectionDelete?.deletedCollectionId) {
          deletedResults.push(title);
          logs.push(`🧹 0개짜리 불필요 컬렉션 영구 삭제 완료: ${title}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        targetCollection: "All Heritage Editions",
        assignedProductsCount: productIds.length,
        deletedLegacyCollectionsCount: deletedResults.length,
        deletedCollectionsList: deletedResults,
      },
      logs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
