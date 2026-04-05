import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/shared/QueryProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Viciniti — Local Community Marketplace",
    template: "%s | Viciniti",
  },
  description:
    "Buy and sell items, hire and offer local services in your community. Viciniti connects people near you.",
  keywords: [
    "marketplace",
    "local services",
    "buy and sell",
    "Nigeria",
    "Lagos",
    "community marketplace",
  ],
  authors: [{ name: "Viciniti" }],
  creator: "Viciniti",
  metadataBase: new URL("https://viciniti-frontend.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://viciniti-frontend.vercel.app",
    siteName: "Viciniti",
    title: "Viciniti — Local Community Marketplace",
    description:
      "Buy and sell items, hire and offer local services in your community.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Viciniti — Local Community Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viciniti — Local Community Marketplace",
    description:
      "Buy and sell items, hire and offer local services in your community.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} antialiased`}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
