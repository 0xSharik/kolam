import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HEADACHE | Digital Installation",
  description: "A subliminal neon glitch-art experience. Chaos vs Stillness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
