import { useCallback, useEffect, useRef, useState } from "react";
import { DataFactory } from "rdf-data-factory";
import type { Source } from "../data/sources";
import { engine } from "../engine";
import type {
  BindingsStream,
  Bindings,
  QueryStringContext,
} from "@comunica/types";
import { ArrayIterator, wrap } from "asynciterator";
import type { Variable } from "@rdfjs/types";
import { asBindings, downloadTextAsFile } from "../utils";
import { ActorQueryResultSerializeSparqlCsv } from "@comunica/actor-query-result-serialize-sparql-csv";
import { ActorQueryResultSerializeSparqlTsv } from "@comunica/actor-query-result-serialize-sparql-tsv";
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
  /**
   * Immediately downloads the results as a SPARQL TSV file, preserving RDF
   * term details such as literal language tags and datatypes.
   */
  downloadResultsAsTSV: () => void;
}

const DF = new DataFactory();

/**
 * Plans a query, returning the variables of its results and a stream of them,
 * with quads and a boolean answer given as bindings.
 */
const planQuery = async (
  query: string,
  context: QueryStringContext,
): Promise<[Variable[], BindingsStream]> => {
  const result = await engine.query(query, context);
  switch (result.resultType) {
    case "bindings":
      return [(await result.metadata()).variables, await result.execute()];
    case "quads":
      return [
        ["subject", "predicate", "object", "graph"].map((v) => DF.variable(v)),
        (await result.execute()).map(asBindings),
      ];
    case "boolean":
      return [
        [DF.variable("result")],
        new ArrayIterator<Bindings>([asBindings(await result.execute())]),
      ];
    default:
      throw new Error(
        "Only SELECT, CONSTRUCT, DESCRIBE and ASK queries are supported.",
      );
  }
};

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
  const finishedRef = useRef(false);

  useEffect(() => {
    finishedRef.current = false;

    const _results: Bindings[] = [];

    const updateResults = () => {
      setResults([..._results]);
    };

    const throttledUpdateResults = throttle(() => {
      if (finishedRef.current) return;
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
          if (finishedRef.current) return;

          // Some complex queries can return bindings even when Comunica's
          // result metadata contains no variables. Fall back to the first
          // binding's keys so those rows still have columns to render.
          if (_results.length === 0) {
            setColumns((currentColumns) =>
              currentColumns.length > 0
                ? currentColumns
                : Array.from(item.keys()),
            );
          }

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
        if (!finishedRef.current) {
          finishedRef.current = true;
          updateResults();
          setIsRunning(false);
          onStop?.();
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
      if (!finishedRef.current) {
        finishedRef.current = true;
        updateResults();
        setIsRunning(false);
        onStop?.();
      }
    };

    // Fallback error handler in case errors don't propagate through the
    // async iterator protocol for all stream implementations.
    const handleError = (error: unknown) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      updateResults();
      setIsRunning(false);
      onStop?.();
      setPossiblyIncomplete(true);
      setErrorMessage(
        error?.toLocaleString() ??
          "An unknown error occurred while streaming data.",
      );
    };

    bindingsStream.on("error", handleError);
    readData();

    return () => {
      finishedRef.current = true;
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
        // Several sources are federated pattern by pattern, each preferring
        // its native KGF route, then its TPF interface, then its SPARQL
        // endpoint. One source gets the whole query, preferring its SPARQL
        // endpoint, then its KGF route, then its TPF interface.
        const federated = sources.length > 1;
        return sources.map((s) => {
          if ("endpoint" in s) {
            return { type: "sparql", value: s.endpoint };
          }

          if (!federated && s.sparqlEndpoint !== undefined) {
            return { type: "sparql", value: s.sparqlEndpoint };
          }

          return s.kgfEndpoint === undefined
            ? { type: "qpf", value: s.tpfEndpoint }
            : { type: "kgf", value: s.kgfEndpoint };
        });
      })();

      if (queryContext.length < 1) return;

      setResults([]);
      setColumns([]);
      setErrorMessage("");
      setPossiblyIncomplete(false);
      finishedRef.current = false;

      // Planning happens inside the results stream, so that it is timed and
      // can be stopped like the rest of the query, and its errors are
      // reported the same way.
      const stream: BindingsStream = wrap(
        planQuery(query, { sources: queryContext } as QueryStringContext).then(
          // Planning can finish after the query was stopped, even after a
          // newer query has started, and then its columns and errors no
          // longer apply.
          ([variables, results]) => {
            if (!stream.done) setColumns(variables);
            return results;
          },
          (error) => {
            if (stream.done) return new ArrayIterator<Bindings>([]);
            throw error;
          },
        ),
      );
      setBindingsStream(stream);
      setIsRunning(true);
      onStart?.();
    },
    [onStart, propsQuery, propsSources],
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
    if (!finishedRef.current) {
      finishedRef.current = true;
      onStop?.();
    }
  };

  const downloadResultsAsCSV = () => {
    if (results && results.length > 0) {
      const variables =
        columns.length > 0 ? columns : Array.from(results[0].keys());
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

  const downloadResultsAsTSV = () => {
    if (results && results.length > 0) {
      const variables =
        columns.length > 0 ? columns : Array.from(results[0].keys());
      const header = `${variables.map((v) => `?${v.value}`).join("\t")}\n`;
      const body = results
        .map(
          (result) =>
            `${variables
              .map((v) =>
                ActorQueryResultSerializeSparqlTsv.bindingToTsvBindings(
                  result.get(v),
                ),
              )
              .join("\t")}\n`,
        )
        .join("");
      downloadTextAsFile(
        [header, body],
        "sparql-results.tsv",
        "text/tab-separated-values",
      );
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
    downloadResultsAsTSV,
  };
};
