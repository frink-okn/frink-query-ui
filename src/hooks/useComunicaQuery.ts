import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { DataFactory } from "rdf-data-factory";
import type { Source } from "../data/sources";
import { engine } from "../engine";
import type {
  BindingsStream,
  Bindings,
  QueryStringContext,
} from "@comunica/types";
import { ArrayIterator } from "asynciterator";
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
  const [planned, setPlanned] = useState<{
    controller: AbortController;
    bindings: BindingsStream;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [possiblyIncomplete, setPossiblyIncomplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // The latest run, identified by its controller, whose abort destroys the
  // run's results stream. Only the latest run changes the hook's state.
  const runRef = useRef<{ controller: AbortController; ended: boolean } | null>(
    null,
  );

  // The latest callbacks, so that new ones don't restart a run's stream.
  const onStartRef = useRef(onStart);
  const onStopRef = useRef(onStop);
  useLayoutEffect(() => {
    onStartRef.current = onStart;
    onStopRef.current = onStop;
  });

  // Ends a run, if it is the latest and hasn't already ended.
  const endRun = useCallback((controller: AbortController): boolean => {
    const run = runRef.current;
    if (run?.controller !== controller || run.ended) return false;
    run.ended = true;
    setIsRunning(false);
    onStopRef.current?.();
    return true;
  }, []);

  const failRun = useCallback(
    (controller: AbortController, error: unknown) => {
      if (!endRun(controller)) return;
      setPossiblyIncomplete(true);
      setErrorMessage(
        error?.toLocaleString() ??
          "An unknown error occurred while running the query.",
      );
    },
    [endRun],
  );

  useEffect(() => {
    if (planned === null) return;
    const { controller, bindings } = planned;

    if (controller.signal.aborted) {
      bindings.destroy();
      return;
    }

    const _results: Bindings[] = [];

    const updateResults = () => {
      if (runRef.current?.controller === controller) {
        setResults([..._results]);
      }
    };

    const throttledUpdateResults = throttle(updateResults, 250);

    // Stopping the run, replacing it, or unmounting aborts it. Destroying
    // its stream doesn't end the for-await below, so the rows read so far
    // are shown here.
    controller.signal.addEventListener(
      "abort",
      () => {
        updateResults();
        bindings.destroy();
      },
      { once: true },
    );

    // Handle stream completion and errors within readData rather than using
    // separate event handlers. Prior to this approach, a separate "end" event
    // listener was used, which could fire synchronously during read() — before
    // the for-await loop had a chance to yield and push the last item — causing
    // an off-by-one in the results.
    const readData = async () => {
      try {
        for await (const item of bindings) {
          if (controller.signal.aborted) return;

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
        updateResults();
        failRun(controller, error);
        return;
      }

      updateResults();
      endRun(controller);
    };

    // Fallback error handler in case errors don't propagate through the
    // async iterator protocol for all stream implementations. It stays
    // attached, so that a stream no longer read doesn't throw its errors.
    bindings.on("error", (error: unknown) => {
      updateResults();
      failRun(controller, error);
    });
    readData();
  }, [planned, endRun, failRun]);

  // Unmounting cancels the latest run.
  useEffect(() => () => runRef.current?.controller.abort(), []);

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

      setLastSubmittedQuery({
        sources,
        query,
      });

      // A new run replaces any still under way.
      const previous = runRef.current;
      const controller = new AbortController();
      runRef.current = { controller, ended: false };
      previous?.controller.abort();

      setResults([]);
      setColumns([]);
      setErrorMessage("");
      setPossiblyIncomplete(false);
      setIsRunning(true);
      onStartRef.current?.();

      // Planning is part of the run: it is timed, and can be stopped, though
      // its requests are not cancelled. The engine caches sources by URL,
      // keeping the context of the query that first used them, and shares
      // them between queries; an abort signal in this run's context would
      // abort other queries' requests, and leave cached sources waiting on
      // responses that never come.
      let plan: [Variable[], BindingsStream];
      try {
        plan = await planQuery(query, {
          sources: queryContext,
        } as QueryStringContext);
      } catch (error: unknown) {
        failRun(controller, error);
        return;
      }

      const [variables, bindings] = plan;
      if (controller.signal.aborted) {
        bindings.destroy();
        return;
      }
      setColumns(variables);
      setPlanned({ controller, bindings });
    },
    [failRun, propsQuery, propsSources],
  );

  useEffect(() => {
    if (runOnMount) {
      runQuery();
    }
  }, [runQuery, runOnMount]);

  const stopQuery = () => {
    const run = runRef.current;
    if (run === null || !endRun(run.controller)) return;
    setPossiblyIncomplete(true);
    run.controller.abort();
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
