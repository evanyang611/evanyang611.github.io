import { notFound } from "next/navigation";
import Document from "@/components/Document";
import { isLocale } from "@/i18n/config";

export default async function LocalizedLayout({ children, params }: {
  children: React.ReactNode; params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <Document locale={locale}>{children}</Document>;
}
