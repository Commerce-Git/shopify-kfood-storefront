// Shopify Storefront API — GraphQL Queries & Mutations

/** Full-text, relevant product results with bounded cursor pagination. */
export const SEARCH_PRODUCTS = `
  query SearchProducts($query: String!, $first: Int!, $after: String) {
    search(query: $query, first: $first, after: $after, types: [PRODUCT], prefix: LAST, unavailableProducts: LAST) {
      totalCount
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          ... on Product {
            id handle title description vendor productType tags availableForSale
            images(first: 1) { edges { node { url altText width height } } }
            priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
            variants(first: 10) { edges { node { id title availableForSale price { amount currencyCode } } } }
          }
        }
      }
    }
  }
`;

/** Fetch a single product by its handle (URL slug) */
export const GET_PRODUCT_BY_HANDLE = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      tags
      vendor
      productType
      availableForSale
      images(first: 20) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              url
              altText
              width
              height
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

/** Fetch all products (for catalog / landing page) with cursor pagination */
export const GET_ALL_PRODUCTS = `
  query GetAllProducts($first: Int = 250, $after: String) {
    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          handle
          title
          createdAt
          description
          vendor
          productType
          tags
          availableForSale
          images(first: 1) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

/** Fetch a single collection by handle and its products with cursor pagination */
export const GET_COLLECTION_BY_HANDLE = `
  query GetCollectionByHandle($handle: String!, $first: Int = 250, $after: String) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          cursor
          node {
            id
            handle
            title
            description
            availableForSale
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/** Fetch all collections */
export const GET_ALL_COLLECTIONS = `
  query GetAllCollections($first: Int = 20) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
            width
            height
          }
          products(first: 1) {
            edges {
              node {
                images(first: 1) {
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
          }
        }
      }
    }
  }
`;

/** Create a cart → returns the Shopify checkout URL */
export const CREATE_CART = `
  mutation CartCreate($lines: [CartLineInput!]!, $discountCodes: [String!], $note: String) {
    cartCreate(input: { lines: $lines, discountCodes: $discountCodes, note: $note }) {
      cart {
        id
        checkoutUrl
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
