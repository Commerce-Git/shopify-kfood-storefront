import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Blank Seoul — Curated in Seoul",
    short_name: "Blank Seoul",
    description:
      "Curated in Seoul, Made in Korea. Products made in Korea and shipped directly from Korea with tracked air express.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF8F5",
    theme_color: "#FAF8F5",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
