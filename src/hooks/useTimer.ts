import { useEffect, useRef, useState } from "react";

export function useTimer(): {
  start: () => void;
  stop: () => void;
  msElapsed: number;
  secondsString: string;
} {
  const [active, setActive] = useState(false);
  const [msElapsed, setMsElapsed] = useState(0);
  // The start of the running query, or null when none is running. A ref, so
  // that stop can read it without start and stop changing on every query.
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const secondsString = `${(msElapsed / 1000).toFixed(2)}s`;

  // get rid of the interval, if it exists
  const cleanup = () => {
    if (intervalRef.current === null) return;
    window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    if (intervalRef.current === null && active) {
      intervalRef.current = window.setInterval(() => {
        if (startTimeRef.current !== null)
          setMsElapsed(new Date().getTime() - startTimeRef.current);
      }, 10);
    }

    return cleanup;
  }, [active]);

  // if component unmounts while timer is running
  useEffect(() => {
    return cleanup;
  }, []);

  const start = () => {
    startTimeRef.current = new Date().getTime();
    setMsElapsed(0);
    setActive(true);
  };

  // Record the final time here rather than relying on the interval, which
  // may not have ticked yet if the query finished quickly.
  const stop = () => {
    if (startTimeRef.current !== null) {
      setMsElapsed(new Date().getTime() - startTimeRef.current);
      startTimeRef.current = null;
    }
    setActive(false);
  };

  return {
    start,
    stop,
    msElapsed,
    secondsString,
  };
}
