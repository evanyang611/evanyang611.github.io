import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Serif_SC, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PlayerProvider from "@/components/songs/PlayerProvider";
import MiniPlayer from "@/components/songs/MiniPlayer";
import { BusuanziStatsLoader } from "@/components/stats/BusuanziStats";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Evan Yang · 个人主页",
  description: "Evan Yang 的个人主页。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${cormorant.variable} ${notoSerifSC.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        <PlayerProvider>
          {children}
          <MiniPlayer />
        </PlayerProvider>
        <BusuanziStatsLoader />
      </body>
    </html>
  );
}
