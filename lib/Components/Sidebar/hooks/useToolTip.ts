"use client"
import { useState, useRef, useEffect, useCallback } from "react";
import { UseTooltipReturn, TooltipState } from "../types";

/**
 * A single shared tooltip driven by hover/focus on any element passed to
 * `show`. Returns { visible, text, x, y } plus show/hide handlers.
 * Positioned via getBoundingClientRect so it's never clipped by an
 * ancestor's overflow (the collapsed rail hides overflow-x to hide labels).
 */
export function useTooltip(): UseTooltipReturn {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, text: "", x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((el: HTMLElement, text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      setTooltip({ visible: true, text, x: rect.right + 12, y: rect.top + rect.height / 2 });
    }, 120);
  }, []);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTooltip((t) => (t.visible ? { ...t, visible: false } : t));
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { tooltip, show, hide };
}
