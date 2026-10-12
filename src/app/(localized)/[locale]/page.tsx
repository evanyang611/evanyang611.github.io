import { notFound } from "next/navigation";
import Portfolio from "@/components/portfolio/Portfolio";
import { LOCALES, isLocale } from "@/i18n/config";
import { MESSAGES } from "@/i18n/messages";
import { portfolioMetadata } from "@/i18n/metadata";

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map(locale => ({ locale }));
}
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return portfolioMetadata(locale);
}
export default async function LocalizedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <Portfolio locale={locale} copy={MESSAGES[locale]} />;
}
