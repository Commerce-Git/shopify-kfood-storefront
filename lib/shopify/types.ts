// Shopify Storefront API Types

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: ShopifyImage | null;
  products?: {
    edges: {
      node: ShopifyProduct;
    }[];
  };
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyPrice {
  amount: string;
  currencyCode: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyPrice;
  compareAtPrice: ShopifyPrice | null;
  image: ShopifyImage | null;
  selectedOptions: {
    name: string;
    value: string;
  }[];
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  tags: string[];
  vendor: string;
  productType: string;
  availableForSale: boolean;
  images: {
    edges: {
      node: ShopifyImage;
    }[];
  };
  variants: {
    edges: {
      node: ShopifyProductVariant;
    }[];
  };
  priceRange: {
    minVariantPrice: ShopifyPrice;
    maxVariantPrice: ShopifyPrice;
  };
}

export interface ShopifyCheckout {
  id: string;
  webUrl: string;
  lineItems: {
    edges: {
      node: {
        title: string;
        quantity: number;
        variant: ShopifyProductVariant;
      };
    }[];
  };
  subtotalPrice: ShopifyPrice;
  totalPrice: ShopifyPrice;
  totalTax: ShopifyPrice;
}

export interface CartItem {
  variantId: string;
  productHandle: string;
  title: string;
  variantTitle: string;
  price: string;
  quantity: number;
  image: ShopifyImage | null;
  stockLimit?: number | null;
}

// API response wrapper
export interface StorefrontResponse<T> {
  data: T;
  errors?: {
    message: string;
    locations: { line: number; column: number }[];
  }[];
}
