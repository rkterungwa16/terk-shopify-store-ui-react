"use client";

import { Gallery } from "./Gallery";
import { PANELS } from "./pannel";
import { ProductCopy } from "./ProductCopy";
import { colors } from "./types";
import { useZoomGallery } from "./useZoomGallery";
import { ZoomDialogModal } from "./ZoomDialog";

export default function ZoomGalleryDemo() {
  const gallery = useZoomGallery(PANELS);

  return (
    <>
      <div
        style={{
          background: colors.ink,
          color: colors.paper,
          fontFamily: "Iowan Old Style, Palatino Linotype, Georgia, serif",
          minHeight: "100vh",
        }}
      >
        <main
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: "clamp(24px, 5vw, 72px) 24px 96px",
            display: "grid",
            gap: 32,
          }}
        >
          <ProductCopy />
          <Gallery
            panels={PANELS}
            activeIndex={gallery.activeIndex}
            highRes={gallery.highRes}
            onSelect={gallery.selectPanel}
            onOpen={gallery.openDialog}
          />
        </main>
      </div>
      <ZoomDialogModal
        panels={PANELS}
        isOpen={gallery.isOpen}
        activeIndex={gallery.activeIndex}
        highRes={gallery.highRes}
        origin={gallery.origin}
        onSelect={gallery.selectPanel}
        onPreview={gallery.markHighRes}
        onClose={gallery.closeDialog}
      />
    </>
  );
}
