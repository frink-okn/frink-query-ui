import { useQueryContext } from "../context/query";

export function ResultsTimer() {
  const { results, secondsString } = useQueryContext()!;
  const count = results.length;
  const resultLabel = count === 1 ? "result" : "results";

  return (
    <div>
      {count.toLocaleString()} {resultLabel} in {secondsString}
    </div>
  );
}
