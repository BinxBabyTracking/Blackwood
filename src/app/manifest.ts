import type { MetadataRoute } from "next";

/**
 * The site as an installable app: added to a phone's home screen, it opens
 * without the browser's address bar. The only way to get a full screen on an
 * iPhone, where websites can't hide the address bar themselves.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Blackwood Investigations",
    short_name: "Blackwood",
    description: "A fictional private investigative agency. Work real-feeling cases as a newly recruited investigator.",
    start_url: "/agency",
    scope: "/",
    display: "standalone",
    background_color: "#12171D",
    theme_color: "#12171D",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
