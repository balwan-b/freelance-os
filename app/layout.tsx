import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { AuthBootstrap } from "@/components/auth-bootstrap";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Freelance OS",
  description:
    "A focused CRM, booking, and workflow workspace for solo service businesses.",
  openGraph: {
    title: "Freelance OS",
    description:
      "A focused CRM, booking, and workflow workspace for solo service businesses.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance OS",
    description:
      "A focused CRM, booking, and workflow workspace for solo service businesses.",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

// viewport must be a separate export in Next.js 14+
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <ClerkProvider dynamic>
          <ConvexClientProvider>
            <AuthBootstrap />
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
