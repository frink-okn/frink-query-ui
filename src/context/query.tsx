import { createContext, useContext, useEffect, useState } from "react";
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
import { produce } from "immer";
import { useTimer } from "../hooks/useTimer";

const QueryContext = createContext<{
  runQuery: (query: string, sources: Source[]) => Promise<void>;
  stopQuery: () => void;
  results: Bindings[];
  columns: Variable[];
  running: boolean;
  possiblyIncomplete: boolean;
  errorMessage: string;
  downloadResultsAsCSV: () => void;
  secondsString: string;
} | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useQueryContext = () => {
  const context = useContext(QueryContext);
  if (context === undefined)
    throw new Error("useQueryContext must be used under a QueryProvider");
  return context;
};

interface QueryProviderProps {
  children: React.ReactNode;
}

const DF = new DataFactory();
const engine = new QueryEngine();

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const { startTimer, stopTimer, secondsString } = useTimer();
  const [results, setResults] = useState<Bindings[]>([]);
  const [columns, setColumns] = useState<Variable[]>([]);
  const [bindingsStream, setBindingsStream] = useState<BindingsStream>(
    new ArrayIterator<Bindings>([]),
  );
  const [running, setRunning] = useState(false);
  const [possiblyIncomplete, setPossiblyIncomplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleData = (item: Bindings) => {
      setResults(
        produce((draft) => {
          draft.push(item);
        }),
      );
    };

    const handleEnd = () => {
      setRunning(false);
      stopTimer();
      setPossiblyIncomplete(false);
    };

    const handleError = (error: unknown) => {
      setRunning(false);
      stopTimer();
      setPossiblyIncomplete(true);
      setErrorMessage(
        error?.toLocaleString() ??
          "An unknown error occurred while streaming data.",
      );
    };

    bindingsStream.on("data", handleData);
    bindingsStream.on("end", handleEnd);
    bindingsStream.on("error", handleError);

    return () => {
      bindingsStream.off("data", handleData);
      bindingsStream.off("end", handleEnd);
      bindingsStream.off("error", handleError);
    };
  }, [
    bindingsStream,
    results,
    setResults,
    setPossiblyIncomplete,
    setErrorMessage,
    stopTimer,
  ]);

  const runQuery = async (query: string, sources: Source[]) => {
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

    const result = await engine
      .query(query, { sources: queryContext } as QueryStringContext)
      .catch((error) => {
        setRunning(false);
        stopTimer();
        setPossiblyIncomplete(true);
        setErrorMessage(error.toLocalString());
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
      setRunning(true);
      startTimer();
    }
  };

  const stopQuery = () => {
    if (!bindingsStream.done) setPossiblyIncomplete(true);
    bindingsStream?.destroy();
    setRunning(false);
    stopTimer();
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

  return (
    <QueryContext.Provider
      value={{
        runQuery,
        stopQuery,
        results,
        columns,
        running,
        possiblyIncomplete,
        errorMessage,
        downloadResultsAsCSV,
        secondsString,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
};
