"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type PageMeta = { id: string; label: string };

const LOCK_MS = 500;
const WHEEL_THRESHOLD = 12;
const WHEEL_GESTURE_IDLE_MS = 180;
const TOUCH_THRESHOLD = 50;
const NAVIGATION_EVENT = "personal-site-navigation";

function subscribeNavigation(listener: () => void) {
  window.addEventListener("hashchange", listener);
  window.addEventListener("popstate", listener);
  window.addEventListener(NAVIGATION_EVENT, listener);
  return () => {
    window.removeEventListener("hashchange", listener);
    window.removeEventListener("popstate", listener);
    window.removeEventListener(NAVIGATION_EVENT, listener);
  };
}

export function usePageNav(pages: PageMeta[]) {
  const getHashIndex = useCallback(() => {
    if (typeof window === "undefined") return 0;
    const hash = window.location.hash.replace(/^#/, "");
    const hashIndex = pages.findIndex((page) => page.id === hash);
    return hashIndex >= 0 ? hashIndex : 0;
  }, [pages]);

  const index = useSyncExternalStore(subscribeNavigation, getHashIndex, () => 0);
  const setIndex = useCallback((next: number) => {
    const active = pages[next];
    if (!active) return;
    const baseUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", next === 0 ? baseUrl : `${baseUrl}#${active.id}`);
    window.dispatchEvent(new Event(NAVIGATION_EVENT));
  }, [pages]);
  const [direction, setDirection] = useState<1 | -1>(1);
  const indexRef = useRef(0);
  const lockRef = useRef(0);
  const lockDirectionRef = useRef<1 | -1 | null>(null);
  const wheelGestureLockedRef = useRef(false);
  const wheelDirectionRef = useRef<1 | -1 | null>(null);
  const scrollGestureActiveRef = useRef(false);
  const horizontalGestureActiveRef = useRef(false);
  const wheelIdleTimerRef = useRef<number | null>(null);
  const horizontalIdleTimerRef = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchScrollContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const onHashChange = () => {
      const next = getHashIndex();
      const cur = indexRef.current;
      if (next === cur) return;
      setDirection(next > cur ? 1 : -1);
      indexRef.current = next;
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [getHashIndex]);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(pages.length - 1, next));
      const cur = indexRef.current;
      if (clamped === cur) return;
      setDirection(clamped > cur ? 1 : -1);
      indexRef.current = clamped;
      setIndex(clamped);
    },
    [pages.length, setIndex],
  );

  const tryShift = useCallback(
    (dir: 1 | -1) => {
      const now = Date.now();
      if (now < lockRef.current && lockDirectionRef.current === dir) return;
      const cur = indexRef.current;
      const target = cur + dir;
      if (target < 0 || target >= pages.length) return;
      lockRef.current = now + LOCK_MS;
      lockDirectionRef.current = dir;
      setDirection(dir);
      indexRef.current = target;
      setIndex(target);
    },
    [pages.length, setIndex],
  );

  useEffect(() => {
    const isBlocked = () => document.body.dataset.modalOpen === "true";
    const onWheel = (e: WheelEvent) => {
      if (isBlocked()) return;

      const target = e.target instanceof Element ? e.target : null;
      const horizontalZone = target?.closest<HTMLElement>("[data-horizontal-wheel]");
      const horizontalIntent =
        Math.abs(e.deltaX) >= 8 && Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (horizontalZone && horizontalIntent) {
        e.preventDefault();
        horizontalGestureActiveRef.current = true;
        if (horizontalIdleTimerRef.current != null) {
          window.clearTimeout(horizontalIdleTimerRef.current);
        }
        horizontalIdleTimerRef.current = window.setTimeout(() => {
          horizontalGestureActiveRef.current = false;
          horizontalIdleTimerRef.current = null;
        }, WHEEL_GESTURE_IDLE_MS);
        return;
      }
      if (horizontalGestureActiveRef.current && Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
        e.preventDefault();
        return;
      }
      if (horizontalGestureActiveRef.current) {
        horizontalGestureActiveRef.current = false;
        if (horizontalIdleTimerRef.current != null) {
          window.clearTimeout(horizontalIdleTimerRef.current);
          horizontalIdleTimerRef.current = null;
        }
      }

      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;

      const scrollContainer = target?.closest<HTMLElement>("[data-page-scroll]");
      if (scrollContainer) {
        const scrollingDown = e.deltaY > 0;
        const atTop = scrollContainer.scrollTop <= 0;
        const atBottom =
          scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 1;

        if ((scrollingDown && !atBottom) || (!scrollingDown && !atTop)) {
          scrollGestureActiveRef.current = true;
          if (wheelIdleTimerRef.current != null) {
            window.clearTimeout(wheelIdleTimerRef.current);
          }
          wheelIdleTimerRef.current = window.setTimeout(() => {
            scrollGestureActiveRef.current = false;
            wheelGestureLockedRef.current = false;
            wheelDirectionRef.current = null;
            wheelIdleTimerRef.current = null;
          }, WHEEL_GESTURE_IDLE_MS);
          return;
        }
      }

      e.preventDefault();
      if (wheelIdleTimerRef.current != null) {
        window.clearTimeout(wheelIdleTimerRef.current);
      }
      wheelIdleTimerRef.current = window.setTimeout(() => {
        scrollGestureActiveRef.current = false;
        wheelGestureLockedRef.current = false;
        wheelDirectionRef.current = null;
        wheelIdleTimerRef.current = null;
      }, WHEEL_GESTURE_IDLE_MS);
      if (scrollGestureActiveRef.current) return;
      const wheelDirection: 1 | -1 = e.deltaY > 0 ? 1 : -1;
      if (wheelGestureLockedRef.current && wheelDirectionRef.current === wheelDirection) return;
      wheelGestureLockedRef.current = true;
      wheelDirectionRef.current = wheelDirection;
      tryShift(wheelDirection);
    };
    const onKey = (e: KeyboardEvent) => {
      if (isBlocked()) return;
      if (e.target instanceof Element && e.target.closest("button, a, input, select, textarea, [contenteditable='true']")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          e.preventDefault();
          tryShift(1);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          tryShift(-1);
          break;
        case "Home":
          e.preventDefault();
          go(0);
          break;
        case "End":
          e.preventDefault();
          go(pages.length - 1);
          break;
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      if (isBlocked()) return;
      touchStartY.current = e.touches[0]?.clientY ?? null;
      const target = e.target instanceof Element ? e.target : null;
      touchScrollContainerRef.current = target?.closest<HTMLElement>("[data-page-scroll]") ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (isBlocked()) return;
      const start = touchStartY.current;
      if (start == null) return;
      const end = e.changedTouches[0]?.clientY ?? start;
      const dy = start - end;
      if (Math.abs(dy) < TOUCH_THRESHOLD) return;

      const scrollContainer = touchScrollContainerRef.current;
      if (scrollContainer) {
        const scrollingDown = dy > 0;
        const atTop = scrollContainer.scrollTop <= 0;
        const atBottom =
          scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 1;
        if ((scrollingDown && !atBottom) || (!scrollingDown && !atTop)) {
          touchStartY.current = null;
          touchScrollContainerRef.current = null;
          return;
        }
      }

      tryShift(dy > 0 ? 1 : -1);
      touchStartY.current = null;
      touchScrollContainerRef.current = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      if (wheelIdleTimerRef.current != null) {
        window.clearTimeout(wheelIdleTimerRef.current);
      }
      if (horizontalIdleTimerRef.current != null) {
        window.clearTimeout(horizontalIdleTimerRef.current);
      }
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [tryShift, go, pages.length]);

  return { index, direction, go };
}
