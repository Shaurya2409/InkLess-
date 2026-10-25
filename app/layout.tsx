import type { Metadata } from "next";
import { Caveat, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inkless | Pinned in Ink",
  description: "Ephemeral words, quiet pages, and thoughts pinned in ink.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#1c1a17] text-[#24211e] font-sans selection:bg-[#d8c29d]/50">
        {children}
      </body>
    </html>
  );
}
