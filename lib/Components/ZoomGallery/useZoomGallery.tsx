import { useState, useCallback } from "react";
import { Origin, Panel } from "./types";

export function useZoomGallery(panels: Panel[]) {
  const [activeIndex, setActiveIndexState] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [origin, setOrigin] = useState<Origin>({ x: 50, y: 50 });
  const [highRes, setHighRes] = useState<boolean[]>(() =>
    panels.map(() => false),
  );

  const selectPanel = useCallback(
    (index: number) => {
      if (index < 0 || index >= panels.length) return;
      setActiveIndexState(index);
    },
    [panels.length],
  );

  const openDialog = useCallback(
    (index: number, o?: Partial<Origin>) => {
      selectPanel(index);
      if (o) setOrigin((prev) => ({ x: o.x ?? prev.x, y: o.y ?? prev.y }));
      setIsOpen(true);
    },
    [selectPanel],
  );

  const closeDialog = useCallback(() => setIsOpen(false), []);

  const markHighRes = useCallback((index: number) => {
    setHighRes((prev) => {
      if (prev[index]) return prev; // already loaded, skip the re-render
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, []);

  return {
    activeIndex,
    isOpen,
    origin,
    highRes,
    selectPanel,
    openDialog,
    closeDialog,
    markHighRes,
  };
}
