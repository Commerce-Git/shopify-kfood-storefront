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

interface FeedbackEmailProps {
  customerName: string;
  customerEmail: string;
}

export const FeedbackEmail = ({
  customerName,
  customerEmail,
}: FeedbackEmailProps) => {
  const previewText = "Your Seoul Snack Box arrived! How was it?";

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
              How was your <strong>Seoul Snack Box</strong>?
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {customerName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We hope you are enjoying your recent Seoul Snack Box! We are
              constantly trying to improve and would love to hear your thoughts.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              What should we include in the next box? Was there anything you
              didn&apos;t like?
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#f97316] rounded-md text-white text-[14px] font-semibold no-underline text-center px-6 py-3"
                href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://shopify-kfood-storefront.vercel.app"}/feedback?email=${encodeURIComponent(
                  customerEmail
                )}`}
              >
                Rate Your Box & Get $5 Off
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center mb-0">
              This email was intended for {customerName}. If you didn&apos;t order a
              Seoul Snack Box, please ignore this email.
            </Text>
            <Text className="text-[#999999] text-[10px] leading-[20px] text-center mt-4">
              Blank Palette LLC<br />
              30 N Gould St, STE R, Sheridan, WY 82801, USA<br />
              <br />
              <Link href="#" className="text-[#999999] underline">
                Unsubscribe
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default FeedbackEmail;
