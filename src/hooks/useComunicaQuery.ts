import { useCallback, useEffect, useRef, useState } from "react";
import { DataFactory } from "rdf-data-factory";
import type { Source } from "../data/sources";
import { QueryEngine } from "@comunica/query-sparql";
import type {
  BindingsStream,
  Bindings,
  QueryStringContext,
} from "@comunica/types";
import { ArrayIterator } from "asynciterator";
import type { Variable } from "@rdfjs/types";
import { asBindings, downloadTextAsFile } from "../utils";
import { ActorQueryResultSerializeSparqlCsv } from "@comunica/actor-query-result-serialize-sparql-csv";
import throttle from "throttleit";

interface ComunicaQueryParams {
  /**
   * Whether to run the query on mount.
   * @default false
   */
  runOnMount?: boolean;
  /**
   * The SPARQL query to run.
   */
  query?: string;
  /**
   * The sources to query.
   */
  sources?: Source[];
  /**
   * Optional callback function when the query starts.
   */
  onStart?: () => void;
  /**
   * Optional callback function when the query stops.
   */
  onStop?: () => void;
}

interface ComunicaQueryOutput {
  /**
   * Starts the query. If `runOnMount` is true, this will be called automatically.
   * If the query and source params are present, it will use these over the ones
   * passed to the hook.
   * The return does not indicate the query has finished, please check `running`.
   * @param query The SPARQL query to run.
   * @param sources The sources to query.
   */
  runQuery: (query?: string, sources?: Source[]) => Promise<void>;
  /**
   * Stops the query and sets `possiblyIncomplete` to true.
   */
  stopQuery: () => void;
  /**
   * The results of the query.
   */
  results: Bindings[];
  /**
   * The Comunica query and sources that were last submitted to the engine
   */
  lastSubmittedQuery: {
    query: string;
    sources: Source[];
  } | null;
  /**
   * The columns of the results.
   */
  columns: Variable[];
  /**
   * Whether the query is running.
   */
  isRunning: boolean;
  /**
   * Whether the query was stopped before returning all results (manually or
   * due to an error).
   */
  possiblyIncomplete: boolean;
  /**
   * The error message, which also indicates if the query failed.
   */
  errorMessage: string;
  /**
   * Immediately downloads the results as a CSV file.
   */
  downloadResultsAsCSV: () => void;
}

const DF = new DataFactory();
const engine = new QueryEngine();

export const useComunicaQuery = ({
  runOnMount = false,
  query: propsQuery,
  sources: propsSources,
  onStart,
  onStop,
}: ComunicaQueryParams): ComunicaQueryOutput => {
  const [results, setResults] = useState<Bindings[]>([]);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState<{
    query: string;
    sources: Source[];
  } | null>(null);
  const [columns, setColumns] = useState<Variable[]>([]);
  const [bindingsStream, setBindingsStream] = useState<BindingsStream>(
    new ArrayIterator<Bindings>([]),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [possiblyIncomplete, setPossiblyIncomplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const stoppedRef = useRef(false);

  useEffect(() => {
    let finished = false;

    const _results: Bindings[] = [];

    const updateResults = () => {
      setResults([..._results]);
    };

    const throttledUpdateResults = throttle(() => {
      if (finished) return;
      updateResults();
    }, 250);

    // Handle stream completion and errors within readData rather than using
    // separate event handlers. Prior to this approach, a separate "end" event
    // listener was used, which could fire synchronously during read() — before
    // the for-await loop had a chance to yield and push the last item — causing
    // an off-by-one in the results.
    const readData = async () => {
      // Immediately set results to empty list before processing starts
      throttledUpdateResults();
      try {
        for await (const item of bindingsStream) {
          if (finished) return;

          _results.push(item);

          if (_results.length < 100) {
            // Synchronously update results at the beginning to prevent a delay
            // in rendering results when they're available immediately.
            updateResults();
          } else {
            // Otherwise, call the throttled update function.
            throttledUpdateResults();
          }
        }
      } catch (error: unknown) {
        if (!finished) {
          finished = true;
          updateResults();
          setIsRunning(false);
          if (!stoppedRef.current) {
            stoppedRef.current = true;
            onStop?.();
          }
          setPossiblyIncomplete(true);
          setErrorMessage(
            error?.toLocaleString() ??
              "An unknown error occurred while streaming data.",
          );
        }
        return;
      }

      // Stream processing has stopped (either because it ended naturally or
      // because stopQuery() destroyed it). By this point, all items that were
      // actually emitted by the stream have been yielded and pushed, but the
      // overall result set may be incomplete in the destroy() case.
      if (!finished) {
        finished = true;
        updateResults();
        setIsRunning(false);
        if (!stoppedRef.current) {
          stoppedRef.current = true;
          onStop?.();
        }
      }
    };

    // Fallback error handler in case errors don't propagate through the
    // async iterator protocol for all stream implementations.
    const handleError = (error: unknown) => {
      if (finished) return;
      finished = true;
      updateResults();
      setIsRunning(false);
      if (!stoppedRef.current) {
        stoppedRef.current = true;
        onStop?.();
      }
      setPossiblyIncomplete(true);
      setErrorMessage(
        error?.toLocaleString() ??
          "An unknown error occurred while streaming data.",
      );
    };

    bindingsStream.on("error", handleError);
    readData();

    return () => {
      finished = true;
      bindingsStream.off("error", handleError);
    };
  }, [
    bindingsStream,
    setResults,
    setPossiblyIncomplete,
    setErrorMessage,
    onStop,
  ]);

  const runQuery = useCallback<ComunicaQueryOutput["runQuery"]>(
    async (q, s) => {
      const sources = s ?? propsSources;
      const query = q ?? propsQuery;

      if (!query) {
        throw new Error(
          "No query provided. A query must be either provided in the hook or passed to the runQuery function.",
        );
      }
      if (!sources) {
        throw new Error(
          "No sources array provided. A sources array must be either provided in the hook or passed to the runQuery function.",
        );
      }

      setLastSubmittedQuery({
        sources,
        query,
      });

      const queryContext = (() => {
        const useTpf = sources.length > 1;
        return sources.map((s) => {
          if ("endpoint" in s) {
            return { type: "sparql", value: s.endpoint };
          } else {
            return useTpf
              ? { type: "qpf", value: s.tpfEndpoint }
              : { type: "sparql", value: s.sparqlEndpoint };
          }
        });
      })();

      if (queryContext.length < 1) return;

      setResults([]);
      setErrorMessage("");
      setPossiblyIncomplete(false);
      stoppedRef.current = false;

      const result = await engine
        .query(query, { sources: queryContext } as QueryStringContext)
        .catch((error) => {
          setIsRunning(false);
          if (!stoppedRef.current) {
            stoppedRef.current = true;
            onStop?.();
          }
          setPossiblyIncomplete(true);
          setErrorMessage(error.toLocaleString());
        });

      if (result) {
        switch (result.resultType) {
          case "bindings":
            setColumns((await result.metadata()).variables);
            setBindingsStream(await result.execute());
            break;
          case "quads":
            setColumns(
              ["subject", "predicate", "object", "graph"].map((v) =>
                DF.variable(v),
              ),
            );
            setBindingsStream((await result.execute()).map(asBindings));
            break;
          case "boolean":
            setColumns([DF.variable("result")]);
            setBindingsStream(
              new ArrayIterator<Bindings>([asBindings(await result.execute())]),
            );
            break;
        }
        setIsRunning(true);
        onStart?.();
      }
    },
    [onStart, onStop, propsQuery, propsSources],
  );

  useEffect(() => {
    if (runOnMount) {
      runQuery();
    }
  }, [runQuery, runOnMount]);

  const stopQuery = () => {
    if (!bindingsStream.done) setPossiblyIncomplete(true);
    bindingsStream?.destroy();
    setIsRunning(false);
    if (!stoppedRef.current) {
      stoppedRef.current = true;
      onStop?.();
    }
  };

  const downloadResultsAsCSV = () => {
    if (results && results.length > 0) {
      const variables = Array.from(results[0].keys());
      const header = `${variables.map((v) => v.value).join(",")}\r\n`;
      const body = results
        .map(
          (result) =>
            `${variables
              .map((v) =>
                ActorQueryResultSerializeSparqlCsv.bindingToCsvBindings(
                  result.get(v),
                ),
              )
              .join(",")}\r\n`,
        )
        .join("");
      downloadTextAsFile([header, body], "sparql-results.csv", "text/csv");
    }
  };

  return {
    runQuery,
    stopQuery,
    results,
    lastSubmittedQuery,
    columns,
    isRunning,
    possiblyIncomplete,
    errorMessage,
    downloadResultsAsCSV,
  };
};
