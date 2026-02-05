import type { Metadata } from "next";
import { Space_Grotesk, Newsreader } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans"
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif"
});

export const metadata: Metadata = {
  title: "WilmAI — Wilma access for AI agents",
  description:
    "Run Wilma from the CLI and wire it into agents like OpenAI, Claude Code, and OpenClaw."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
