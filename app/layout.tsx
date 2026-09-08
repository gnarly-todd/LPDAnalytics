import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todd's Lock Collection — Analytics",
  description:
    "Owned-first analysis of Todd's Lock Pickers United collection, with 78 owned locks and 69 wishlist locks kept separate.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
