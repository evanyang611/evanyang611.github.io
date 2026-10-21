import type { Locale } from "@/i18n/config";

type LocalizedText = Record<Locale, string>;
type ArtworkBase = { id: string; title: LocalizedText; description?: LocalizedText; year?: string; tool?: string };
export type AigcArtwork = ArtworkBase & (
  | { kind: "images"; src: string; width: number; height: number; alt: LocalizedText }
  | { kind: "videos"; src: string; poster?: string }
  | { kind: "music"; src: string; cover?: { src: string; width: number; height: number; alt: LocalizedText } }
);
export const AIGC_CATEGORIES = ["images", "videos", "music"] as const;
export type AigcCategory = (typeof AIGC_CATEGORIES)[number];

// Only Evan's supplied and approved works belong in this registry.
export const AIGC_ARTWORKS: readonly AigcArtwork[] = [
  {
    id: "blue-archive-ensemble",
    kind: "images",
    src: "/aigc/images/blue-archive-ensemble.webp",
    width: 2720,
    height: 1530,
    title: {
      "zh-CN": "Blue Archive · 合绘",
      "zh-TW": "Blue Archive · 合繪",
      en: "Blue Archive · Ensemble",
      ja: "Blue Archive · 集合イラスト",
    },
    alt: {
      "zh-CN": "七位身着彩色礼服的动漫角色，在阳光洒落、鲜花环绕的房间里合影。",
      "zh-TW": "七位身著彩色禮服的動漫角色，在陽光灑落、鮮花環繞的房間裡合影。",
      en: "Seven anime characters in colorful dresses together in a sunlit room filled with flowers.",
      ja: "色とりどりのドレスを着た7人のアニメキャラクターが、陽光と花に包まれた部屋に集う。",
    },
  },
  {
    id: "sunna-warm-cg",
    kind: "images",
    src: "/aigc/images/sunna-warm-cg.webp",
    width: 1728,
    height: 2432,
    title: {
      "zh-CN": "Sunna · 暖光肖像",
      "zh-TW": "Sunna · 暖光肖像",
      en: "Sunna · Warm Light",
      ja: "Sunna · 暖かな光",
    },
    alt: {
      "zh-CN": "绿发动漫角色坐在浅色沙发上，窗帘间透入温暖的阳光。",
      "zh-TW": "綠髮動漫角色坐在淺色沙發上，窗簾間透入溫暖的陽光。",
      en: "A green-haired anime character sits on a light sofa in warm sunlight filtering through curtains.",
      ja: "カーテン越しの暖かな日差しが注ぐソファに、緑髪のアニメキャラクターが座っている。",
    },
  },
];
