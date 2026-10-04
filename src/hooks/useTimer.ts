import { useEffect, useState } from "react";

/** When a query started and, once it has, stopped, as `performance.now()` times. */
export interface Timing {
  start: number;
  stop?: number;
}

/**
 * Records when a query starts and stops. It renders only then; the time shown
 * while a query runs is kept current by `useElapsedSeconds`.
 */
export function useTimer(): {
  start: () => void;
  stop: () => void;
  timing: Timing | null;
} {
  const [timing, setTiming] = useState<Timing | null>(null);

  const start = () => {
    setTiming({ start: performance.now() });
  };

  const stop = () => {
    const now = performance.now();
    setTiming((timing) =>
      timing === null || timing.stop !== undefined
        ? timing
        : { ...timing, stop: now },
    );
  };

  return {
    start,
    stop,
    timing,
  };
}

/** The seconds a timing has run, to two decimals, kept current while it runs. */
export function useElapsedSeconds(timing: Timing | null): string {
  const [now, setNow] = useState(() => performance.now());

  useEffect(() => {
    if (timing === null || timing.stop !== undefined) return;
    const interval = window.setInterval(() => setNow(performance.now()), 10);
    return () => window.clearInterval(interval);
  }, [timing]);

  // Until its first tick after a start, `now` is from before the start.
  const ms =
    timing === null ? 0 : Math.max(0, (timing.stop ?? now) - timing.start);
  return `${(ms / 1000).toFixed(2)}s`;
}
