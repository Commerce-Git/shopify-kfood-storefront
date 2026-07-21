import * as React from "react";
import {
  Body,
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

export interface OrderCancellationEmailProps {
  customerName: string;
  orderNumber: string;
  refundAmount?: string;
  unsubscribeUrl: string;
}

export const OrderCancellationEmail = ({
  customerName,
  orderNumber,
  refundAmount,
  unsubscribeUrl,
}: OrderCancellationEmailProps) => {
  const previewText = `Your Blank Seoul order ${orderNumber} has been cancelled.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white">
            <Section className="mt-[32px] text-center">
              <Text className="text-4xl m-0">🏷️ ❌</Text>
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Order Cancellation Confirmed
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {customerName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Your order <strong>#{orderNumber}</strong> has been successfully cancelled.
              {refundAmount && (
                <> A full refund of <strong>${refundAmount}</strong> has been issued to your original payment method.</>
              )}
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              If you have any questions or need further assistance, please contact our support team at support@blankseoul.com.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center mb-0">
              This email confirms the cancellation of order #{orderNumber}.
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

export default OrderCancellationEmail;
