/* ============================================================================
 * ZoomDialogModal — the loupe view. Also purely presentational: it receives
 * activeIndex/isOpen/origin/highRes as props and reports interactions back
 * through onSelect/onPreview/onClose. It never reaches into Gallery.
 * ========================================================================== */

import { useRef, useState, useCallback, useEffect } from "react";
import { CloseIcon, PanelArt } from "./pannel";
import { Panel, Origin, colors, ease } from "./types";
import {
  prefersReducedMotion,
  supportsViewTransitions,
  startViewTransition,
  debounce,
  getMostVisibleElement,
  isClickedOutside,
} from "./utilities";

interface ZoomDialogModalProps {
  panels: Panel[];
  isOpen: boolean;
  activeIndex: number;
  highRes: boolean[];
  origin: Origin;
  onSelect: (index: number) => void;
  onPreview: (index: number) => void;
  onClose: () => void;
}

export function ZoomDialogModal({
  panels,
  isOpen,
  activeIndex,
  highRes,
  origin,
  onSelect,
  onPreview,
  onClose,
}: ZoomDialogModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const mediaRailRef = useRef<HTMLDivElement>(null);
  const thumbRailRef = useRef<HTMLDivElement>(null);
  const previousScrollY = useRef(0);
  const [closing, setClosing] = useState(false);

  const scrollToActive = useCallback(
    (index: number, behavior: ScrollBehavior) => {
      mediaRailRef.current
        ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
        ?.scrollIntoView({ behavior, block: "center" });
      thumbRailRef.current
        ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
        ?.scrollIntoView({ behavior, block: "nearest", inline: "center" });
    },
    [],
  );

  const finishClose = useCallback(() => {
    console.log("FINISHCLOSE__", dialogRef.current);
    dialogRef.current?.close();
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo({ top: previousScrollY.current, behavior: "instant" });
    onClose();
  }, [onClose]);

  const requestClose = useCallback(async () => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open) return;

    const reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      finishClose();
      return;
    }

    // setClosing(true);

    // await new Promise<void>((resolve) => {
    //   dialog.addEventListener("animationend", () => resolve(), { once: true });
    // });

    // setClosing(false);

    finishClose();
  }, [finishClose]);

  // Open/close the native <dialog> + lock body scroll, driven by isOpen.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen || dialog.open) return;

    previousScrollY.current = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${previousScrollY.current}px`;
    document.body.style.width = "100%";

    const openNow = () => {
      dialog.showModal();
      scrollToActive(activeIndex, "instant");
      onPreview(activeIndex);
    };

    if (!supportsViewTransitions() || prefersReducedMotion()) {
      openNow();
    } else {
      startViewTransition(openNow);
    }
  }, [isOpen, activeIndex, onPreview, scrollToActive]);

  // Scroll-sync: whichever media panel is most visible becomes active.
  useEffect(() => {
    const rail = mediaRailRef.current;
    if (!rail) return;

    const handleScroll = debounce(async () => {
      const items = Array.from(
        rail.querySelectorAll<HTMLElement>("[data-index]"),
      );
      if (!items.length) return;
      const mostVisible = await getMostVisibleElement(items);
      const index = Number(mostVisible.dataset.index);
      onSelect(index);
      onPreview(index);
    }, 50);

    rail.addEventListener("scroll", handleScroll);
    return () => {
      handleScroll.cancel();
      rail.removeEventListener("scroll", handleScroll);
    };
  }, [onSelect, onPreview]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Zoomed product images"
      className={`zoom-dialog${closing ? " iris-closing" : ""}`}
      onClick={(e) => {
        if (
          layoutRef.current &&
          isClickedOutside(e.nativeEvent, layoutRef.current)
        )
          requestClose();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        requestClose();
      }}
      style={{
        padding: 0,
        border: "none",
        maxWidth: "none",
        maxHeight: "none",
        width: "100vw",
        height: "100vh",
        margin: 0,
        background: colors.ink,
        color: colors.paper,
        ["--origin-x" as string]: `${origin.x}%`,
        ["--origin-y" as string]: `${origin.y}%`,
      }}
    >
      <div
        ref={layoutRef}
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: `1px solid ${colors.line}`,
          }}
        >
          <span
            style={{
              fontFamily: "Courier New, ui-monospace, monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: colors.brass,
            }}
          >
            {panels[activeIndex]?.label ?? ""}
          </span>
          <button
            type="button"
            aria-label="Close"
            className="zoom-close-btn zoom-dialog__close"
            onClick={requestClose}
            style={{
              all: "unset",
              cursor: "pointer",
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              border: `1px solid ${colors.line}`,
              transition: `border-color 0.2s ${ease}, transform 0.2s ${ease}`,
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div
          ref={mediaRailRef}
          style={{
            overflowY: "auto",
            scrollSnapType: "y proximity",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 24,
            gap: 24,
          }}
        >
          {panels.map((panel, index) => (
            <div
              key={panel.id}
              data-index={index}
              style={{
                scrollSnapAlign: "center",
                width: "min(560px, 100%)",
                flexShrink: 0,
              }}
            >
              <PanelArt panel={panel} detailed={highRes[index]} />
            </div>
          ))}
        </div>

        <div
          ref={thumbRailRef}
          role="tablist"
          aria-label="Select image"
          style={{
            display: "flex",
            gap: 10,
            padding: "14px 20px",
            overflowX: "auto",
            borderTop: `1px solid ${colors.line}`,
            scrollbarWidth: "none",
          }}
        >
          {panels.map((panel, index) => (
            <button
              key={panel.id}
              type="button"
              role="tab"
              data-index={index}
              aria-selected={index === activeIndex}
              aria-label={panel.label}
              onClick={() => {
                onSelect(index);
                scrollToActive(index, "smooth");
              }}
              onPointerOver={() => {
                onPreview(index);
              }}
              style={{
                all: "unset",
                width: 52,
                height: 52,
                flexShrink: 0,
                borderRadius: 2,
                cursor: "pointer",
                overflow: "hidden",
                border: `1px solid ${index === activeIndex ? colors.brassBright : colors.line}`,
                transition: `border-color 0.2s ${ease}`,
              }}
            >
              <PanelArt panel={panel} />
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}
