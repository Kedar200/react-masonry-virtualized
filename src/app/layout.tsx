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
  title: "React Masonry Virtualized - High Performance Masonry Grid",
  description: "A blazing-fast, virtualized masonry grid component for React. Render thousands of items with smooth 60 FPS performance. Perfect for image galleries, Pinterest-style layouts, and more.",
  keywords: ["react", "masonry", "virtualized", "grid", "performance", "image gallery", "pinterest layout"],
  authors: [{ name: "Kedar" }],
  openGraph: {
    title: "React Masonry Virtualized",
    description: "High-performance virtualized masonry grid for React",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
