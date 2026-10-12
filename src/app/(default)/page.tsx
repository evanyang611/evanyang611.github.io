import Portfolio from "@/components/portfolio/Portfolio";
import { MESSAGES } from "@/i18n/messages";
import { portfolioMetadata } from "@/i18n/metadata";

export const metadata = portfolioMetadata("zh-CN");
export default function Home() {
  return <Portfolio locale="zh-CN" copy={MESSAGES["zh-CN"]} autoSelectLanguage />;
}
