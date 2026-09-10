import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#18181B" },
  ],
};
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
    default: "Blank Seoul — Curated Korean Artisan Works | Made in Korea 🇰🇷",
    template: "%s | Blank Seoul",
  },
  description:
    "Discover authentic Korean artisan goods made in Korea. Curated in Seoul, handcrafted across Korea, and delivered direct with free global express.",
  keywords: [
    "Korean artisan goods",
    "Made in Korea",
    "Korean traditional crafts",
    "Korean master craft",
    "K-Culture",
    "Korean accessories",
    "Korean gift",
    "Korean pouches",
    "Korean hair accessories",
    "hanbok accessories",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Blank Seoul",
    title: "Blank Seoul — Curated Korean Artisan Works | Made in Korea 🇰🇷",
    description:
      "Curated in Seoul, handcrafted across Korea — authentic heritage pouches, accessories, and craft treasures. Dispatched direct from Korea.",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Blank Seoul — Curated Korean Artisan Works | Made in Korea",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blank Seoul — Curated Korean Artisan Works | Made in Korea",
    description:
      "All products handcrafted in Korea — direct from Korea to your door with free global express.",
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
