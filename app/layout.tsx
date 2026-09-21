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
import CartDrawer from "./components/CartDrawer";
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
    default: "Blank Seoul — Curated in Seoul | Made in Korea 🇰🇷",
    template: "%s | Blank Seoul",
  },
  description:
    "Discover authentic Made in Korea lifestyle goods, design pouches, and accessories. Curated in Seoul, inspected, and dispatched direct from Korea with tracked air express.",
  keywords: [
    "Made in Korea",
    "Korean lifestyle goods",
    "Curated in Seoul",
    "Korean design accessories",
    "Korean pouches",
    "Korean stationery",
    "Korean gifts",
    "Dispatched direct from Korea",
    "K-Culture",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Blank Seoul",
    title: "Blank Seoul — Curated in Seoul | Made in Korea 🇰🇷",
    description:
      "Curated in Seoul, Made in Korea — authentic lifestyle pouches, accessories, and design goods. Dispatched direct from Korea.",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Blank Seoul — Curated in Seoul | Made in Korea",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blank Seoul — Curated in Seoul | Made in Korea",
    description:
      "Authentic products Made in Korea — dispatched direct from Korea to your door with tracked global express.",
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
            <main className="flex-1 flex flex-col pt-page-offset">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
