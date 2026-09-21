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
  storyHeading = "A New Creation from the Atelier",
  storyBody = "Crafted with centuries of heritage techniques, this newly completed studio piece is now officially open for priority collector access before public availability.",
  unsubscribeArtistUrl = "https://blank-seoul-storefront.vercel.app/unsubscribe?artist=soyo-studio",
  unsubscribeAllUrl = "https://blank-seoul-storefront.vercel.app/unsubscribe",
}: ArtistDropEmailProps) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://blank-seoul-storefront.vercel.app";
  const dropUrl = `${baseUrl}/product/${productHandle}?utm_source=artist_drop&utm_medium=email&utm_campaign=${artistSlug}`;
  
  // Russell Brunson Hook: High-curiosity, status-affirming preview text
  const previewText = `Private Studio Drop: The ${artistName} Lunar Release is Live (${customerName}, your priority allocation is reserved)`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#FAF8F5] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#E8DFC8] rounded-2xl my-[32px] mx-auto p-[24px] max-w-[500px] bg-white shadow-md">
            
            {/* 1. Hook — Atelier Guild Brand Badge */}
            <Section className="text-center pt-[8px] pb-[16px] border-b border-solid border-[#F4EFE6]">
              <Text className="text-[11px] font-bold tracking-[0.25em] text-[#C25E38] uppercase m-0">
                BLANK SEOUL &middot; VERIFIED ATELIER GUILD
              </Text>
              <Heading className="text-[#18181B] text-[22px] font-extrabold tracking-tight m-0 mt-[6px]">
                {artistName} Studio Drop
              </Heading>
              <Text className="text-[#71717A] text-[12px] font-medium tracking-wide mt-[4px] mb-0 uppercase">
                Priority Private Collector Allocation
              </Text>
            </Section>

            {/* 2. Personal Connection & Hook */}
            <Section className="mt-[20px]">
              <Text className="text-[#18181B] text-[14px] leading-[22px] m-0">
                Dear {customerName},
              </Text>
              <Text className="text-[#4B5563] text-[13px] leading-[22px] mt-[6px] mb-0">
                Because you follow <strong>{artistName}</strong>, your private reservation window has just unlocked before this limited piece is announced to the public.
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
                Authentic Heritage &middot; 100% Handcrafted in Korea
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
                Claim Priority Atelier Piece &rarr;
              </Button>
            </Section>

            {/* 4. Russell Brunson Scarcity & Urgency Notice */}
            <Section className="mt-[16px] p-[12px] rounded-lg bg-[#FEF3E8] border border-solid border-[#F8D2B1] text-center">
              <Text className="text-[#9A3412] text-[12px] font-semibold leading-[18px] m-0">
                ⏳ <strong>Kiln Batch Scarcity:</strong> Strictly limited to 15 studio pieces per firing. Once claimed, the next kiln opening is approximately 90 days away.
              </Text>
            </Section>

            {/* 5. Russell Brunson Value Stack (Irresistible Offer Stack) */}
            <Section className="mt-[20px] p-[16px] rounded-xl bg-[#FAF6F0] border border-solid border-[#E4DAC5]">
              <Text className="text-[#18181B] text-[12px] font-extrabold uppercase tracking-wider m-0 mb-[10px]">
                🎁 Included With Your Studio Collector Allocation:
              </Text>
              <Text className="text-[#374151] text-[13px] leading-[22px] m-0 mb-[6px]">
                ✓ <strong>Authentic Paulownia Wooden Gift Box</strong> ($24 Value — Artisanal heritage keepsake)
              </Text>
              <Text className="text-[#374151] text-[13px] leading-[22px] m-0 mb-[6px]">
                ✓ <strong>Master Artisan Serialized Certificate</strong> (Numbered authenticity archive card)
              </Text>
              <Text className="text-[#374151] text-[13px] leading-[22px] m-0">
                ✓ <strong>Direct Seoul Air Express Insurance</strong> (100% damage-free delivery guarantee)
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
                Access Atelier Piece &rarr;
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
                You received this priority invitation because you follow {artistName} on Blank Seoul.
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
