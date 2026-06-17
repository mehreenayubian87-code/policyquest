import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolicyQuest",
  description: "A co-design toolkit platform for policy teams and students."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <footer className="siteFooter">
          <span>&copy; {year} PolicyQuest. All rights reserved.</span>
          <span>
            Developed by{" "}
            <strong>
              Dr. Mehreen Afsar Jadoon
            </strong>{" "}
            (College of Public Policy, Hamad Bin Khalifa University, Doha, Qatar)
          </span>
        </footer>
      </body>
    </html>
  );
}
