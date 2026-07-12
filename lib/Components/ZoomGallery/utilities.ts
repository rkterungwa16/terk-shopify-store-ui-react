export function prefersReducedMotion(): boolean {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface ViewTransitionLike {
  finished: Promise<void>;
}

export function supportsViewTransitions(): boolean {
  return (
    typeof (document as { startViewTransition?: unknown })
      .startViewTransition === "function"
  );
}

export function startViewTransition(callback: () => void): ViewTransitionLike {
  return document?.startViewTransition?.(callback);
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait: number,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  function debounced(this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  }
  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };
  return debounced;
}

export function isClickedOutside(event: MouseEvent, element: Element): boolean {
  if (
    event.target instanceof HTMLDialogElement ||
    !(event.target instanceof Element)
  ) {
    const { left, right, top, bottom } = element.getBoundingClientRect();
    return !(
      event.clientX >= left &&
      event.clientX <= right &&
      event.clientY >= top &&
      event.clientY <= bottom
    );
  }
  return !element.contains(event.target);
}

export function getMostVisibleElement(
  elements: HTMLElement[],
): Promise<HTMLElement> {
  return new Promise((resolve) => {
    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev,
        );
        observer.disconnect();
        resolve(mostVisible.target as HTMLElement);
      },
      { threshold: Array.from({ length: 100 }, (_, i) => i / 100) },
    );
    elements.forEach((el) => observer.observe(el));
  });
}
