import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Curation & Followed Studios | Blank Seoul Atelier",
  description:
    "Review your personal curation of authentic Korean handcrafted pieces and manage VIP priority drop alerts for verified artisan studios.",
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
