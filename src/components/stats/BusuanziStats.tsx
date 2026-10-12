"use client";

import { useEffect, useState } from "react";

type BusuanziData = {
  site_uv: number;
  site_pv: number;
  page_pv?: number;
  version?: number;
};

declare global {
  interface Window {
    __busuanziStats?: BusuanziData;
    __busuanziStatsPromise?: Promise<BusuanziData>;
  }
}

const STATS_EVENT = "busuanzi-stats";

function emitStats() {
  window.dispatchEvent(new CustomEvent<BusuanziData>(STATS_EVENT, { detail: window.__busuanziStats }));
}

function loadBusuanziStats() {
  if (window.__busuanziStats) return Promise.resolve(window.__busuanziStats);
  if (window.__busuanziStatsPromise) return window.__busuanziStatsPromise;

  window.__busuanziStatsPromise = new Promise<BusuanziData>((resolve, reject) => {
    const callbackName = `BusuanziCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const globals = window as unknown as Record<string, unknown>;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      window.__busuanziStatsPromise = undefined;
      reject(new Error("Timed out loading Busuanzi stats"));
    }, 10000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      delete globals[callbackName];
      script.remove();
    };

    globals[callbackName] = (data: BusuanziData) => {
      window.__busuanziStats = data;
      emitStats();
      cleanup();
      resolve(data);
    };

    script.async = true;
    script.referrerPolicy = "no-referrer-when-downgrade";
    script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      window.__busuanziStatsPromise = undefined;
      reject(new Error("Failed to load Busuanzi stats"));
    };

    document.head.appendChild(script);
  });

  return window.__busuanziStatsPromise;
}

export function BusuanziStatsLoader() {
  useEffect(() => {
    void loadBusuanziStats().catch(() => {});
  }, []);

  return null;
}

export function BusuanziStatsText() {
  const [stats, setStats] = useState<BusuanziData | null>(null);

  useEffect(() => {
    const onStats = (event: Event) => {
      setStats((event as CustomEvent<BusuanziData>).detail ?? window.__busuanziStats ?? null);
    };

    window.addEventListener(STATS_EVENT, onStats);
    void loadBusuanziStats()
      .then((data) => setStats(data))
      .catch(() => {});

    return () => window.removeEventListener(STATS_EVENT, onStats);
  }, []);

  return (
    <>
      累计访客 <span>{stats?.site_uv ?? "—"}</span> · 总访问量{" "}
      <span>{stats?.site_pv ?? "—"}</span>
    </>
  );
}
