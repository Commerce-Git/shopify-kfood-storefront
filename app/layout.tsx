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
    default: "K-Food Store — Gift a Piece of Korea 🇰🇷",
    template: "%s | K-Food Store",
  },
  description:
    "Discover curated K-Food snack boxes shipped direct from Seoul. Premium Korean snacks, ramen, and treats — the perfect gift for K-Culture lovers.",
  keywords: [
    "Korean snacks",
    "K-Food",
    "Korean food box",
    "snack box",
    "K-Pop snacks",
    "gift box",
    "Korean treats",
    "Seoul snacks",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "K-Food Store",
    title: "K-Food Store — Gift a Piece of Korea 🇰🇷",
    description:
      "Curated K-Food snack boxes shipped direct from Seoul. The perfect gift for K-Culture lovers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "K-Food Store — Gift a Piece of Korea",
    description:
      "Curated K-Food snack boxes shipped direct from Seoul.",
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
