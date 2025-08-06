import { createContext, useContext } from "react";
import type { Source } from "../data/sources";
import type { Bindings } from "@comunica/types";
import type { Variable } from "@rdfjs/types";
import { useTimer } from "../hooks/useTimer";
import { useComunicaQuery } from "../hooks/useComunicaQuery";

const QueryContext = createContext<{
  runQuery: (query: string, sources: Source[]) => Promise<void>;
  stopQuery: () => void;
  results: Bindings[];
  lastSubmittedQuery: {
    query: string;
    sources: Source[];
  } | null;
  columns: Variable[];
  isRunning: boolean;
  possiblyIncomplete: boolean;
  errorMessage: string;
  downloadResultsAsCSV: () => void;
  secondsString: string;
  msElapsed: number;
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

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const timer = useTimer();

  const {
    runQuery,
    stopQuery,
    results,
    lastSubmittedQuery,
    columns,
    isRunning,
    possiblyIncomplete,
    errorMessage,
    downloadResultsAsCSV,
  } = useComunicaQuery({
    onStart: timer.start,
    onStop: timer.stop,
  });

  return (
    <QueryContext.Provider
      value={{
        runQuery,
        stopQuery,
        results,
        lastSubmittedQuery,
        columns,
        isRunning,
        possiblyIncomplete,
        errorMessage,
        downloadResultsAsCSV,
        secondsString: timer.secondsString,
        msElapsed: timer.msElapsed,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
};
