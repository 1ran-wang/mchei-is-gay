import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DotaWatch - Squad Monitor",
  description: "Monitoring Dota2 accounts for the squad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 antialiased">{children}</body>
    </html>
  );
}
