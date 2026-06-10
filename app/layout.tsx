import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolicyQuest",
  description: "A co-design toolkit platform for policy teams and students."
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
