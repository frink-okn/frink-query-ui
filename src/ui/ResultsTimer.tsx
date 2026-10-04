import { useQueryContext } from "../context/query";
import { useElapsedSeconds } from "../hooks/useTimer";

export function ResultsTimer() {
  const { results, timing } = useQueryContext()!;
  const secondsString = useElapsedSeconds(timing);
  const count = results.length;
  const resultLabel = count === 1 ? "result" : "results";

  return (
    <div>
      {count.toLocaleString()} {resultLabel} in {secondsString}
    </div>
  );
}
