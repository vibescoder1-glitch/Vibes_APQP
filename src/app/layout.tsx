import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibes APQP | APQP & NPD Management",
  description:
    "Integrated Advanced Product Quality Planning and New Product Development workspace for automotive manufacturing."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
