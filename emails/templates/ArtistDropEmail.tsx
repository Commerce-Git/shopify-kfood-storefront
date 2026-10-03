import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

export interface ArtistDropEmailProps {
  customerName?: string;
  artistName?: string;
  artistSlug?: string;
  artistAvatar?: string;
  productTitle?: string;
  productHandle?: string;
  productImageUrl?: string;
  productPrice?: string;
  storyHeading?: string;
  storyBody?: string;
  unsubscribeArtistUrl?: string;
  unsubscribeAllUrl?: string;
}

export const ArtistDropEmail = ({
  customerName = "Valued Collector",
  artistName = "Soyo Studio",
  artistSlug = "soyo-studio",
  artistAvatar = "https://blank-seoul-storefront.vercel.app/assets/blank_seoul_symbol.png",
  productTitle = "Hunminjeongeum Reversible Tote Bag",
  productHandle = "hunminjeongeum-reversible-tote-bag",
  productImageUrl = "https://blank-seoul-storefront.vercel.app/assets/hanji_paper_luxury_wrapping.jpg",
  productPrice = "$68.00",
  storyHeading = "Discover Something New from Korea",
  storyBody = "Explore this new addition to our collection of products made in Korea and shipped from Korea. Visit the product page for materials, availability and delivery details.",
  unsubscribeArtistUrl = "https://blank-seoul-storefront.vercel.app/unsubscribe?artist=soyo-studio",
  unsubscribeAllUrl = "https://blank-seoul-storefront.vercel.app/unsubscribe",
}: ArtistDropEmailProps) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://blank-seoul-storefront.vercel.app";
  const dropUrl = `${baseUrl}/product/${productHandle}?utm_source=artist_drop&utm_medium=email&utm_campaign=${artistSlug}`;
  
  const previewText = `New from ${artistName}: ${productTitle}`;

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>{previewText}</Preview>
        <Body className="bg-[#FAF8F5] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#E8DFC8] rounded-2xl my-[32px] mx-auto p-[24px] max-w-[500px] bg-white shadow-md">
            
            {/* 1. Brand and collection update */}
            <Section className="text-center pt-[8px] pb-[16px] border-b border-solid border-[#F4EFE6]">
              <Text className="text-[11px] font-bold tracking-[0.25em] text-[#C25E38] uppercase m-0">
                BLANK SEOUL &middot; MADE IN KOREA
              </Text>
              <Heading className="text-[#18181B] text-[22px] font-extrabold tracking-tight m-0 mt-[6px]">
                New from {artistName}
              </Heading>
              <Text className="text-[#71717A] text-[12px] font-medium tracking-wide mt-[4px] mb-0 uppercase">
                Korean Makers &amp; Brands
              </Text>
            </Section>

            {/* 2. Personal Connection & Hook */}
            <Section className="mt-[20px]">
              <Text className="text-[#18181B] text-[14px] leading-[22px] m-0">
                Dear {customerName},
              </Text>
              <Text className="text-[#4B5563] text-[13px] leading-[22px] mt-[6px] mb-0">
                Because you follow <strong>{artistName}</strong>, we wanted to share this new product with you.
              </Text>
            </Section>

            {/* 3. Featured Creation Card */}
            <Section className="mt-[20px] p-[18px] rounded-xl bg-[#FDF9F3] border border-solid border-[#E8DFC8] text-center">
              {productImageUrl && (
                <Img
                  src={productImageUrl}
                  alt={productTitle}
                  width="420"
                  height="280"
                  className="rounded-lg mx-auto object-cover max-w-full shadow-sm"
                />
              )}
              <Text className="text-[#C25E38] text-[11px] font-bold uppercase tracking-wider mt-[16px] mb-[4px]">
                Made in Korea &middot; Shipped from Korea
              </Text>
              <Heading className="text-[#18181B] text-[18px] font-extrabold m-0 leading-[26px]">
                {productTitle}
              </Heading>
              {productPrice && (
                <Text className="text-[#2D4A3E] text-[18px] font-extrabold mt-[6px] mb-[16px]">
                  {productPrice}
                </Text>
              )}

              {/* Direct Response 1st Person CTA */}
              <Button
                href={dropUrl}
                className="bg-[#2D4A3E] hover:bg-[#1F3A2F] text-white text-[14px] font-bold py-[14px] px-[28px] rounded-full no-underline inline-block text-center shadow-md transition-all"
              >
                View Product &rarr;
              </Button>
            </Section>

            {/* 4. Product details and availability */}
            <Section className="mt-[16px] p-[12px] rounded-lg bg-[#FEF3E8] border border-solid border-[#F8D2B1] text-center">
              <Text className="text-[#9A3412] text-[12px] font-semibold leading-[18px] m-0">
                Check the product page for current availability and preparation time.
              </Text>
            </Section>

            {/* 5. Origin and purchase information */}
            <Section className="mt-[20px] p-[16px] rounded-xl bg-[#FAF6F0] border border-solid border-[#E4DAC5]">
              <Text className="text-[#18181B] text-[12px] font-extrabold uppercase tracking-wider m-0 mb-[10px]">
                About This Product:
              </Text>
              <Text className="text-[#374151] text-[13px] leading-[22px] m-0 mb-[6px]">
                <strong>Made in Korea</strong> — Discover products from Korean makers and brands.
              </Text>
              <Text className="text-[#374151] text-[13px] leading-[22px] m-0 mb-[6px]">
                <strong>Shipped from Korea</strong> — See the product page and checkout for delivery details.
              </Text>
              <Text className="text-[#374151] text-[13px] leading-[22px] m-0">
                Review the product description for materials, dimensions and included items.
              </Text>
            </Section>

            {/* 6. Story (The Epiphany Bridge) */}
            <Section className="mt-[24px] px-[4px]">
              <Heading className="text-[#18181B] text-[15px] font-bold m-0">
                {storyHeading}
              </Heading>
              <Text className="text-[#4B5563] text-[13px] leading-[22px] mt-[8px] mb-0">
                {storyBody}
              </Text>
            </Section>

            {/* Secondary CTA Anchor */}
            <Section className="text-center mt-[24px]">
              <Button
                href={dropUrl}
                className="bg-[#18181B] hover:bg-[#27272A] text-white text-[13px] font-bold py-[12px] px-[24px] rounded-full no-underline inline-block shadow-sm"
              >
                Explore Product Details &rarr;
              </Button>
            </Section>

            <Hr className="border-t border-solid border-[#E8DFC8] my-[24px]" />

            {/* 7. Legal Footer & Granular RFC 8058 Unsubscribe */}
            <Section className="text-center text-[#9CA3AF] text-[11px] leading-[18px]">
              <Text className="m-0 text-[#71717A] font-medium">
                Blank Palette LLC &middot; Sheridan, Wyoming, USA
              </Text>
              <Text className="m-0 mt-[4px] text-[#9CA3AF]">
                Dispatched with tracking direct from central Korea hub.
              </Text>
              <Text className="m-0 mt-[12px] text-[#9CA3AF]">
                You received this product update because you follow {artistName} on Blank Seoul.
              </Text>
              <Text className="m-0 mt-[6px]">
                <Link
                  href={unsubscribeArtistUrl}
                  className="text-[#71717A] underline hover:text-[#18181B]"
                >
                  Unsubscribe from {artistName} alerts
                </Link>
                {" "}&middot;{" "}
                <Link
                  href={unsubscribeAllUrl}
                  className="text-[#71717A] underline hover:text-[#18181B]"
                >
                  Unsubscribe from all marketing emails
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ArtistDropEmail;
