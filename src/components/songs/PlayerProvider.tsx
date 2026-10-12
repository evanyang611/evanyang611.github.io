"use client";

import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SongEntry } from "@/content/songs";

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  loadVideoById: (id: string) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type Ctx = {
  current: SongEntry | null;
  playing: boolean;
  queue: SongEntry[];
  error: string | null;
  play: (song: SongEntry, list?: SongEntry[]) => void;
  playAll: (songs: SongEntry[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  close: () => void;
  dismissError: () => void;
};

const PlayerCtx = createContext<Ctx | null>(null);

export function usePlayer() {
  const v = useContext(PlayerCtx);
  if (!v) throw new Error("usePlayer outside PlayerProvider");
  return v;
}

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<SongEntry | null>(null);
  const [playing, setPlaying] = useState(false);
  const [queue, setQueue] = useState<SongEntry[]>([]);
  const [apiReady, setApiReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.YT?.Player),
  );
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pendingRef = useRef<string | null>(null);
  const queueRef = useRef<SongEntry[]>([]);
  const currentRef = useRef<SongEntry | null>(null);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentRef.current = current; }, [current]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.YT?.Player) {
      const timer = window.setTimeout(() => setApiReady(true), 0);
      return () => window.clearTimeout(timer);
    }
    window.onYouTubeIframeAPIReady = () => setApiReady(true);
    const timeout = setTimeout(() => {
      if (!window.YT?.Player) {
        setError("无法连接 YouTube，播放功能不可用");
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, []);

  const playById = useCallback((videoId: string) => {
    if (!playerRef.current) {
      pendingRef.current = videoId;
      return;
    }
    playerRef.current.loadVideoById(videoId);
  }, []);

  const playNext = useCallback(() => {
    const q = queueRef.current;
    const cur = currentRef.current;
    if (q.length === 0 || !cur) return;
    const idx = q.findIndex((s) => s.id === cur.id);
    const next = q[(idx + 1) % q.length];
    if (!next?.videoId) return;
    setCurrent(next);
    playById(next.videoId);
  }, [playById]);

  const playPrev = useCallback(() => {
    const q = queueRef.current;
    const cur = currentRef.current;
    if (q.length === 0 || !cur) return;
    const idx = q.findIndex((s) => s.id === cur.id);
    const prev = q[(idx - 1 + q.length) % q.length];
    if (!prev?.videoId) return;
    setCurrent(prev);
    playById(prev.videoId);
  }, [playById]);

  useEffect(() => {
    if (!apiReady || playerRef.current) return;
    const el = document.getElementById("yt-host");
    if (!el || !window.YT) return;
    playerRef.current = new window.YT.Player(el, {
      playerVars: { playsinline: 1, controls: 0, disablekb: 1, modestbranding: 1 },
      events: {
        onReady: () => {
          if (pendingRef.current) {
            playerRef.current?.loadVideoById(pendingRef.current);
            pendingRef.current = null;
          }
        },
        onStateChange: (e) => {
          const S = window.YT?.PlayerState;
          if (!S) return;
          if (e.data === S.PLAYING) setPlaying(true);
          else if (e.data === S.PAUSED) setPlaying(false);
          else if (e.data === S.ENDED) {
            setPlaying(false);
            playNext();
          }
        },
      },
    });
  }, [apiReady, playNext]);

  const play = useCallback((song: SongEntry, list?: SongEntry[]) => {
    if (!song.videoId) return;
    setCurrent(song);
    if (list) setQueue(list.filter((s) => s.videoId));
    else setQueue((prev) => prev.length > 0 ? prev : [song]);
    playById(song.videoId);
  }, [playById]);

  const playAll = useCallback((songs: SongEntry[]) => {
    const playable = songs.filter((s) => s.videoId);
    if (playable.length === 0) return;
    setQueue(playable);
    setCurrent(playable[0]);
    playById(playable[0].videoId!);
  }, [playById]);

  const toggle = useCallback(() => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [playing]);

  const close = useCallback(() => {
    playerRef.current?.pauseVideo();
    setCurrent(null);
    setQueue([]);
    setPlaying(false);
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  return (
    <PlayerCtx.Provider value={{ current, playing, queue, error, play, playAll, toggle, next: playNext, prev: playPrev, close, dismissError }}>
      <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
      <div className="pointer-events-none fixed left-[-9999px] top-[-9999px] h-px w-px overflow-hidden opacity-0">
        <div id="yt-host" />
      </div>
      {children}
    </PlayerCtx.Provider>
  );
}
