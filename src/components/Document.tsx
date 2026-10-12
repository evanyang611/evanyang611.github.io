import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import "@/app/globals.css";

export default function Document({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <html lang={locale}><body>{children}</body></html>;
}
