import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import { COUPON_CONFIG } from "@/lib/coupon-config";

interface ReviewRequestEmailProps {
  customerName: string;
  reviewToken: string;
  unsubscribeUrl: string;
}

export const ReviewRequestEmail = ({
  customerName,
  reviewToken,
  unsubscribeUrl,
}: ReviewRequestEmailProps) => {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://shopify-kfood-storefront.vercel.app";
  const reviewUrl = `${siteUrl}/review?token=${reviewToken}`;
  const discountLabel =
    COUPON_CONFIG.discountType === "percentage"
      ? `${COUPON_CONFIG.discountValue}% OFF`
      : `$${COUPON_CONFIG.discountValue} OFF`;

  const previewText = `Your Seoul Box arrived! Share your experience & get ${discountLabel}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white">
            <Section className="mt-[32px] text-center">
              <Text className="text-4xl m-0">🇰🇷 📦</Text>
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              How was your <strong>Seoul Box</strong>?
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {customerName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Your Seoul Box arrived a few weeks ago — we&apos;d love to
              hear what you think! Every review helps us pick better snacks for
              the next box. Your honest opinion shapes what goes in! 🙌
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              As a thank you, you&apos;ll receive an{" "}
              <strong>exclusive {discountLabel} coupon</strong> (valid for{" "}
              {COUPON_CONFIG.validityDays} days) after sharing your experience.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#f97316] rounded-md text-white text-[14px] font-semibold no-underline text-center px-6 py-3"
                href={reviewUrl}
              >
                Yes, I Want {discountLabel} OFF! (Write a Quick Review) →
              </Button>
            </Section>
            <Text className="text-[#999999] text-[11px] leading-[18px] text-center">
              This offer is available for {COUPON_CONFIG.tokenExpiryDays} days.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center mb-0">
              This email was intended for {customerName}. If you didn&apos;t
              order a Seoul Box, please ignore this email.
            </Text>
            <Text className="text-[#999999] text-[10px] leading-[20px] text-center mt-4">
              Blank Palette LLC
              <br />
              30 N Gould St, STE R, Sheridan, WY 82801, USA
              <br />
              <br />
              <Link href={unsubscribeUrl} className="text-[#999999] underline">
                Unsubscribe
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ReviewRequestEmail;
