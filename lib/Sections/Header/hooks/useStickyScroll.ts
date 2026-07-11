import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { StickyScrollState, ScrollDirection } from "../types";

/** rAF-throttled scroll direction + sticky-active tracking. */
export function useStickyScroll(enabled: boolean): StickyScrollState {
  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection>("none");
  const [stickyActive, setStickyActive] = useState<boolean>(false);
  const lastScrollTop = useRef<number>(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const updateScrollState = (): void => {
      const scrollTop = document.scrollingElement?.scrollTop ?? 0;
      const isScrollingUp = scrollTop < lastScrollTop.current;
      const isAtTop = scrollTop <= 4;

      if (isAtTop) {
        setScrollDirection("none");
        setStickyActive(false);
      } else if (isScrollingUp) {
        setScrollDirection("up");
        setStickyActive(true);
      } else {
        setScrollDirection("down");
      }
      lastScrollTop.current = scrollTop;
    };

    const handleScroll = (): void => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        updateScrollState();
      });
    };

    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", handleScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [enabled]);

  return { scrollDirection, stickyActive };
}
