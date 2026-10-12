import zhCN from "./messages/zh-CN.json";
import zhTW from "./messages/zh-TW.json";
import en from "./messages/en.json";
import ja from "./messages/ja.json";
import type { Locale } from "./config";

export type PortfolioMessages = typeof zhCN;
export const MESSAGES: Record<Locale, PortfolioMessages> = {
  "zh-CN": zhCN, "zh-TW": zhTW, en, ja,
};
