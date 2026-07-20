import { useEffect, useRef } from "react";
import { yieldToMainThread } from "./yieldToMainThread";
import type { FlyToCartItemProps } from "./types";
import styles from "./FlyToCart.module.css";

/**
 * Renders a single flying node and animates it from `flight.source` to
 * `flight.destination`, then reports back via `onFinished` so the parent
 * can remove it from state.
 *
 * Mirrors the original custom element: it waits for both the source and
 * destination to report an IntersectionObserver entry, sets the CSS custom
 * properties that drive the animation, yields to the main thread so the
 * browser can paint the starting position, then waits for the CSS
 * animation to finish before signalling completion.
 */
export function FlyToCartItem({ flight, onFinished }: FlyToCartItemProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    let cancelled = false;

    const intersectionObserver = new IntersectionObserver((entries) => {
      let sourceRect: DOMRectReadOnly | null = null;
      let destinationRect: DOMRectReadOnly | null = null;

      entries.forEach((entry) => {
        if (entry.target === flight.source) {
          sourceRect = entry.boundingClientRect;
        } else if (entry.target === flight.destination) {
          destinationRect = entry.boundingClientRect;
        }
      });

      if (sourceRect && destinationRect) {
        void animate(
          node,
          sourceRect,
          destinationRect,
          flight.useSourceSize,
        ).then(() => {
          if (!cancelled) onFinished(flight.id);
        });
      }

      intersectionObserver.disconnect();
    });

    intersectionObserver.observe(flight.source);
    intersectionObserver.observe(flight.destination);

    return () => {
      cancelled = true;
      intersectionObserver.disconnect();
    };
    // flight fields are stable for the lifetime of a single flight id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flight.id]);

  return (
    <div ref={nodeRef} className={styles.flyToCart} aria-hidden="true">
      {flight.content}
    </div>
  );
}

/**
 * Sets the CSS custom properties that drive the animation, yields to the
 * main thread so the starting position paints first, then resolves once
 * every animation on the node has finished.
 */
async function animate(
  node: HTMLDivElement,
  sourceRect: DOMRectReadOnly,
  destinationRect: DOMRectReadOnly,
  useSourceSize: boolean,
): Promise<void> {
  const startPoint = {
    x: sourceRect.left + sourceRect.width / 2,
    y: sourceRect.top + sourceRect.height / 2,
  };

  const endPoint = {
    x: destinationRect.left + destinationRect.width / 2,
    y: destinationRect.top + destinationRect.height / 2,
  };

  if (useSourceSize) {
    node.style.setProperty("--width", `${sourceRect.width}px`);
    node.style.setProperty("--height", `${sourceRect.height}px`);
  }
  node.style.setProperty("--start-x", `${startPoint.x}px`);
  node.style.setProperty("--start-y", `${startPoint.y}px`);
  node.style.setProperty("--travel-x", `${endPoint.x - startPoint.x}px`);
  node.style.setProperty("--travel-y", `${endPoint.y - startPoint.y}px`);

  await yieldToMainThread();

  await Promise.allSettled(node.getAnimations().map((a) => a.finished));
}
