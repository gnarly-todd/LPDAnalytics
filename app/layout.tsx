import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./mobile-usability.css";
import "./screen-navigation.css";
import "./style-consistency.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  title: "Todd's Lock Collection — Analytics",
  description:
    "LPU profile analytics with owned and wishlist collections, community benchmarks, ranking opinions, catalog coverage, and picking practice ideas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
