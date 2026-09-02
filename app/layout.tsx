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
  metadataBase: new URL("https://blankseoul.com"),
  title: {
    default: "Blank Seoul — All Products Made in Korea 🇰🇷",
    template: "%s | Blank Seoul",
  },
  description:
    "Discover authentic Korean artisan goods made in Korea — traditional pouches, hair accessories, keyrings, and more. Delivered direct from Seoul with free global express.",
  keywords: [
    "Korean artisan goods",
    "Made in Korea",
    "Korean traditional crafts",
    "K-Culture",
    "Korean accessories",
    "Korean gift",
    "Seoul",
    "Korean pouches",
    "Korean hair accessories",
    "hanbok accessories",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Blank Seoul",
    title: "Blank Seoul — All Products Made in Korea 🇰🇷",
    description:
      "All products made in Korea — authentic pouches, accessories, and keyrings. Dispatched direct from Seoul.",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Blank Seoul — All Products Made in Korea",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blank Seoul — All Products Made in Korea",
    description:
      "All products made in Korea — direct from Seoul to your door.",
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
      data-scroll-behavior="smooth"
      suppressHydrationWarning={true}
    >
      <body className="min-h-screen flex flex-col bg-background text-text" suppressHydrationWarning={true}>
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
