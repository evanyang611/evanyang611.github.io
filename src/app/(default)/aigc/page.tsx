import Gallery from "@/components/gallery/Gallery";
import { MESSAGES } from "@/i18n/messages";
import { portfolioMetadata } from "@/i18n/metadata";

export const metadata = portfolioMetadata("zh-CN", "aigc");
export default function AigcPage() {
  return <Gallery locale="zh-CN" copy={MESSAGES["zh-CN"]} autoSelectLanguage />;
}
