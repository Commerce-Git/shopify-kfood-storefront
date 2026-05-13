import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./components/CartProvider";
import { AuthProvider } from "./components/AuthProvider";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Blank Seoul — Curate Korea, Deliver Culture 🇰🇷",
    template: "%s | Blank Seoul",
  },
  description:
    "We curate Korea's trendiest culture — from snacks to beauty to lifestyle — and deliver it to your door. Premium K-Culture boxes shipped direct from Seoul.",
  keywords: [
    "K-Culture",
    "Korean culture box",
    "K-Beauty",
    "Korean lifestyle",
    "Korean snacks",
    "gift box",
    "Seoul",
    "K-Food",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Blank Seoul",
    title: "Blank Seoul — Curate Korea, Deliver Culture 🇰🇷",
    description:
      "Korea's trendiest culture — snacks, beauty, lifestyle — curated and delivered from Seoul.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blank Seoul — Curate Korea, Deliver Culture",
    description:
      "Korea's trendiest culture — curated and delivered from Seoul.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-background text-text">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
