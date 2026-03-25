import type { Metadata } from "next";
import { Crimson_Pro, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kolam | Sacred Geometry Engine",
  description: "A digital heritage experience exploring the ancient art of Kolam patterns through generative geometry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${crimsonPro.variable} ${spaceGrotesk.variable} ${playfair.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
