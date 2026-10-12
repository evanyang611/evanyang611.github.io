import "./globals.css";
import PlayerProvider from "@/components/songs/PlayerProvider";
import MiniPlayer from "@/components/songs/MiniPlayer";
import { BusuanziStatsLoader } from "@/components/stats/BusuanziStats";
import LocaleProvider from "@/i18n/LocaleProvider";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="h-full overflow-hidden">
        <LocaleProvider>
          <PlayerProvider>
            {children}
            <MiniPlayer />
          </PlayerProvider>
          <LanguageSwitcher />
          <BusuanziStatsLoader />
        </LocaleProvider>
      </body>
    </html>
  );
}
