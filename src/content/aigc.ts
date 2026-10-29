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
    src: "/aigc/images/blue-archive-ensemble-0932d0c2979d.webp",
    width: 1920,
    height: 1080,
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
    id: "mika-softlight",
    kind: "images",
    src: "/aigc/images/mika-softlight-7a970f19aba1.webp",
    width: 1536,
    height: 1152,
    title: {
      "zh-CN": "Mika · 柔光肖像",
      "zh-TW": "Mika · 柔光肖像",
      en: "Mika · Soft Light",
      ja: "ミカ · やわらかな光",
    },
    alt: {
      "zh-CN": "《碧蓝档案》的粉发少女 Mika 身着白色制服，倚在象牙白台面旁，在柔和光线中仰头微笑。",
      "zh-TW": "《蔚藍檔案》的粉髮少女 Mika 身著白色制服，倚在象牙白檯面旁，在柔和光線中仰頭微笑。",
      en: "Mika from Blue Archive, with pink hair and a white uniform, looks up with a smile beside an ivory vanity in soft light.",
      ja: "『ブルーアーカイブ』のミカが、ピンクの髪と白い制服姿で象牙色の化粧台に寄り添い、やわらかな光の中で見上げて微笑む。",
    },
  },
];
