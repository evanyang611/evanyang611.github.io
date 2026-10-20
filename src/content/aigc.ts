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

// Intentionally empty: add only Evan's supplied, approved artworks and media paths.
export const AIGC_ARTWORKS: readonly AigcArtwork[] = [];
