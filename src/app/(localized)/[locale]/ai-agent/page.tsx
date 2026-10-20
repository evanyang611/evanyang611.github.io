import { notFound } from "next/navigation";
import AgentProjects from "@/components/portfolio/AgentProjects";
import { LOCALES, isLocale } from "@/i18n/config";
import { MESSAGES } from "@/i18n/messages";
import { portfolioMetadata } from "@/i18n/metadata";

export const dynamicParams = false;
export function generateStaticParams() { return LOCALES.map(locale => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return portfolioMetadata(locale, "agents");
}
export default async function LocalizedAgentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AgentProjects locale={locale} copy={MESSAGES[locale]} />;
}
