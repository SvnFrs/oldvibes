import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Old Vibes - Discover Amazing Secondhand Treasures",
  description:
    "Connect with vintage enthusiasts and discover unique secondhand items through our mobile app. Share your old vibes and find amazing treasures from the past.",
  keywords: [
    "secondhand",
    "vintage",
    "marketplace",
    "old items",
    "retro",
    "antique",
    "preloved",
  ],
  authors: [{ name: "Old Vibes Team" }],
  creator: "Old Vibes",
  publisher: "Old Vibes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://oldvibes.io.vn"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Old Vibes - Discover Amazing Secondhand Treasures",
    description:
      "Connect with vintage enthusiasts and discover unique secondhand items through our mobile app.",
    url: "https://oldvibes.io.vn",
    siteName: "Old Vibes",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Old Vibes - Secondhand Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Old Vibes - Discover Amazing Secondhand Treasures",
    description:
      "Connect with vintage enthusiasts and discover unique secondhand items through our mobile app.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
