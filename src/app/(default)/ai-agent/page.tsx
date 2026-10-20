import AgentProjects from "@/components/portfolio/AgentProjects";
import { MESSAGES } from "@/i18n/messages";
import { portfolioMetadata } from "@/i18n/metadata";

export const metadata = portfolioMetadata("zh-CN", "agents");
export default function AgentsPage() {
  return <AgentProjects locale="zh-CN" copy={MESSAGES["zh-CN"]} autoSelectLanguage />;
}
