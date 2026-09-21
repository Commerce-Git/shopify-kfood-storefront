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
  const previewText = `New Studio Drop: ${productTitle} by ${artistName} is now live!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#FAF8F5] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#E8DFC8] rounded-2xl my-[32px] mx-auto p-[24px] max-w-[480px] bg-white shadow-sm">
            {/* Header / Brand Mark */}
            <Section className="text-center pt-[8px] pb-[16px] border-b border-solid border-[#F4EFE6]">
              <Text className="text-[11px] font-bold tracking-[0.2em] text-[#C25E38] uppercase m-0">
                BLANK SEOUL &middot; VERIFIED ATELIER GUILD
              </Text>
              <Heading className="text-[#18181B] text-[20px] font-extrabold tracking-tight m-0 mt-[6px]">
                {artistName} Studio Drop
              </Heading>
            </Section>

            {/* Greeting */}
            <Section className="mt-[20px]">
              <Text className="text-[#18181B] text-[14px] leading-[22px] m-0">
                Hello {customerName},
              </Text>
              <Text className="text-[#4B5563] text-[13px] leading-[22px] mt-[6px] mb-0">
                As a priority follower of <strong>{artistName}</strong>, you are receiving exclusive first-look access to their newly completed creation.
              </Text>
            </Section>

            {/* Featured Product Card */}
            <Section className="mt-[20px] p-[16px] rounded-xl bg-[#FDF9F3] border border-solid border-[#E8DFC8] text-center">
              {productImageUrl && (
                <Img
                  src={productImageUrl}
                  alt={productTitle}
                  width="380"
                  height="260"
                  className="rounded-lg mx-auto object-cover max-w-full"
                />
              )}
              <Text className="text-[#C25E38] text-[11px] font-bold uppercase tracking-wider mt-[14px] mb-[4px]">
                New Studio Release &middot; 100% Made in Korea
              </Text>
              <Heading className="text-[#18181B] text-[17px] font-extrabold m-0 leading-[24px]">
                {productTitle}
              </Heading>
              {productPrice && (
                <Text className="text-[#18181B] text-[15px] font-bold mt-[4px] mb-[16px]">
                  {productPrice}
                </Text>
              )}

              <Button
                href={dropUrl}
                className="bg-[#18181B] text-white text-[13px] font-bold py-[12px] px-[24px] rounded-full no-underline inline-block text-center shadow-sm hover:bg-[#C25E38]"
              >
                Explore Studio Release &rarr;
              </Button>
            </Section>

            {/* Story / Craft Note */}
            <Section className="mt-[24px] px-[4px]">
              <Heading className="text-[#18181B] text-[15px] font-bold m-0">
                {storyHeading}
              </Heading>
              <Text className="text-[#4B5563] text-[13px] leading-[22px] mt-[6px] mb-0">
                {storyBody}
              </Text>
            </Section>

            <Hr className="border-t border-solid border-[#E8DFC8] my-[24px]" />

            {/* Legal Footer & Granular Unsubscribe */}
            <Section className="text-center text-[#9CA3AF] text-[11px] leading-[18px]">
              <Text className="m-0 text-[#71717A] font-medium">
                Blank Palette LLC &middot; Sheridan, Wyoming, USA
              </Text>
              <Text className="m-0 mt-[4px] text-[#9CA3AF]">
                Dispatched with tracking direct from central Korea hub.
              </Text>
              <Text className="m-0 mt-[12px] text-[#9CA3AF]">
                You received this because you follow {artistName} on Blank Seoul.
              </Text>
              <Text className="m-0 mt-[4px]">
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
                  Unsubscribe from all emails
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
