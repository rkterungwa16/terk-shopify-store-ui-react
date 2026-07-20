/**
 * Returns a promise that resolves after yielding to the main thread.
 * Uses `scheduler.yield()` where available, falling back to
 * `requestAnimationFrame` + `setTimeout(0)`.
 * @see https://web.dev/articles/optimize-long-tasks#scheduler-yield
 */
export const yieldToMainThread = (): Promise<void> => {
  // if (typeof scheduler !== 'undefined' && 'yield' in scheduler) {
  //   return (scheduler as Scheduler & { yield: () => Promise<void> }).yield();
  // }

  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0);
    });
  });
};
