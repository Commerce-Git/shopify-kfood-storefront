import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Products & Followed Makers | Blank Seoul",
  description:
    "Explore your saved products made in Korea and manage updates from the makers and brands you follow.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
