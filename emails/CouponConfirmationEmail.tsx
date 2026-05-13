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

interface CouponConfirmationEmailProps {
  customerName: string;
  couponCode: string;
  discountLabel: string;
  expiresAt: string;
  reviewToken: string;
  unsubscribeUrl: string;
}

export const CouponConfirmationEmail = ({
  customerName,
  couponCode,
  discountLabel,
  expiresAt,
  reviewToken,
  unsubscribeUrl,
}: CouponConfirmationEmailProps) => {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://shopify-kfood-storefront.vercel.app";
  const reviewUrl = `${siteUrl}/review?token=${reviewToken}`;
  const expiryDate = new Date(expiresAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const previewText = `🎉 Your ${discountLabel} coupon is ready! Code: ${couponCode}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white">
            <Section className="mt-[32px] text-center">
              <Text className="text-4xl m-0">🎉</Text>
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Your <strong>{discountLabel}</strong> coupon is ready!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {customerName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Thank you for sharing your Blank Seoul Box experience! Your honest
              review helps us make every box better. As promised, here&apos;s
              your exclusive discount:
            </Text>

            {/* Coupon Code */}
            <Section className="text-center my-[24px]">
              <Text className="text-[12px] text-gray-500 mb-2">
                Your coupon code:
              </Text>
              <Text className="text-[24px] font-bold tracking-wider text-[#f97316] bg-[#fff7ed] rounded-xl py-3 px-6 border-2 border-dashed border-[#fed7aa] inline-block">
                {couponCode}
              </Text>
              <Text className="text-[12px] text-gray-500 mt-2">
                Valid until {expiryDate}
              </Text>
            </Section>

            <Section className="text-center mt-[32px] mb-[16px]">
              <Button
                className="bg-[#f97316] rounded-md text-white text-[14px] font-semibold no-underline text-center px-6 py-3"
                href={siteUrl}
              >
                Yes, I Want More Snacks (Claim My {discountLabel}) →
              </Button>
            </Section>

            <Text className="text-[#999999] text-[11px] leading-[18px] text-center">
              You can always{" "}
              <Link href={reviewUrl} className="text-[#f97316] underline">
                view your coupon here
              </Link>{" "}
              if you need it later.
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center mb-0">
              This email was intended for {customerName}. If you didn&apos;t
              order a Blank Seoul Box, please ignore this email.
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

export default CouponConfirmationEmail;
