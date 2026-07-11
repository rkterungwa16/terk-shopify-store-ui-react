import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type MutableRefObject,
  type RefObject,
} from "react";

/** Keeps a CSS custom property on document.body in sync with an element's height. */
export function useHeaderHeightVar(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;
      const height = Math.round(entry.borderBoxSize[0].blockSize);
      document.body.style.setProperty("--header-height", `${height}px`);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}
