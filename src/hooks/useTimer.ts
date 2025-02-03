import { useEffect, useRef, useState } from "react";

export function useTimer(): {
  startTimer: () => void;
  stopTimer: () => void;
  msElapsed: number;
  secondsString: string;
} {
  const [active, setActive] = useState(false);
  const [msElapsed, setMsElapsed] = useState(0);
  const [startTime, setStartTime] = useState(new Date().getTime());
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
        if (active) setMsElapsed(new Date().getTime() - startTime);
      }, 10);
    }

    return cleanup;
  }, [active, startTime]);

  // if component unmounts while timer is running
  useEffect(() => {
    return cleanup;
  }, []);

  const startTimer = () => {
    setActive(true);
    setStartTime(new Date().getTime());
  };

  const stopTimer = () => {
    setActive(false);
  };

  return {
    startTimer,
    stopTimer,
    msElapsed,
    secondsString,
  };
}
