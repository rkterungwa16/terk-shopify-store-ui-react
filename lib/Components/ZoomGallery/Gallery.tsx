/* ============================================================================
 * Gallery — storefront thumbnail rail + main image.
 * Pure presentational component: reads state and calls the callbacks it's
 * given, has no idea whether the dialog is open or how state is stored.
 * ========================================================================== */

import { PanelArt, ZoomIcon } from "./pannel";
import { Panel, Origin, colors, ease } from "./types";

interface GalleryProps {
  panels: Panel[];
  activeIndex: number;
  highRes: boolean[];
  onSelect: (index: number) => void;
  onOpen: (index: number, origin: Origin) => void;
}

export function Gallery({
  panels,
  activeIndex,
  highRes,
  onSelect,
  onOpen,
}: GalleryProps) {
  const openFrom = (index: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    onOpen(index, {
      x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
      y: ((rect.top + rect.height / 2) / window.innerHeight) * 100,
    });
  };

  return (
    <section
      aria-label="Product gallery"
      style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 12 }}
    >
      <div
        role="tablist"
        aria-label="Select image"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxHeight: 420,
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        {panels.map((panel, index) => (
          <button
            key={panel.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={panel.label}
            onClick={() => onSelect(index)}
            className="zoom-thumb"
            style={{
              all: "unset",
              display: "block",
              width: 64,
              height: 64,
              flexShrink: 0,
              borderRadius: 2,
              cursor: "pointer",
              overflow: "hidden",
              border: `1px solid ${index === activeIndex ? colors.brassBright : colors.line}`,
              boxShadow:
                index === activeIndex
                  ? `0 0 0 1px ${colors.brassBright}`
                  : "none",
              transition: `border-color 0.2s ${ease}`,
            }}
          >
            <PanelArt panel={panel} />
          </button>
        ))}
      </div>

      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 5",
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${colors.line}`,
          background: colors.inkRaised,
        }}
      >
        {panels.map((panel, index) => (
          <div
            key={panel.id}
            onClick={(e) => openFrom(index, e.currentTarget)}
            style={{
              position: "absolute",
              inset: 0,
              opacity: index === activeIndex ? 1 : 0,
              pointerEvents: index === activeIndex ? "auto" : "none",
              transition: `opacity 0.25s ${ease}`,
              cursor: "zoom-in",
            }}
          >
            <PanelArt panel={panel} detailed={highRes[index]} />
          </div>
        ))}

        <button
          type="button"
          aria-label="Open zoomed view"
          className="zoom-cue-btn"
          onClick={(e) =>
            openFrom(activeIndex, e.currentTarget.parentElement as HTMLElement)
          }
          style={{
            all: "unset",
            position: "absolute",
            right: 14,
            bottom: 14,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(23, 19, 15, 0.72)",
            border: `1px solid ${colors.line}`,
            display: "grid",
            placeItems: "center",
            cursor: "zoom-in",
            transition: `transform 0.2s ${ease}, border-color 0.2s ${ease}`,
          }}
        >
          <ZoomIcon />
        </button>
      </div>
    </section>
  );
}
