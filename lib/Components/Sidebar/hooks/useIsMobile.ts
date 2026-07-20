"use client"
import { useState, useEffect, } from "react";

import { MOBILE_BREAKPOINT } from "../constants";

/** Tracks whether the viewport is at/under the mobile breakpoint. */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia(`(max-width: ${breakpoint}px)`).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return isMobile;
}
