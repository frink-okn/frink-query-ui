import { useLocalStorage } from "@uidotdev/usehooks";
import { produce } from "immer";
import React, { createContext, useContext } from "react";

const SavedQueriesContext = createContext<{
  saveQuery: (name: string, query: string, sources: string[]) => void;
  deleteQuery: (name: string) => void;
  savedQueries: SavedQuery[];
} | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSavedQueriesContext = () => {
  const context = useContext(SavedQueriesContext);
  if (context === undefined)
    throw new Error(
      "useSavedQueriesContext must be used under a SavedQueriesProvider",
    );
  return context;
};

type SavedQuery = {
  title: string;
  sources: string[];
  query: string;
  timestamp: number;
};

interface QueryProviderProps {
  children: React.ReactNode;
}
export const SavedQueriesProvider = ({ children }: QueryProviderProps) => {
  const [savedQueries, setSavedQueries] = useLocalStorage<SavedQuery[]>(
    "saved-queries",
    [],
  );

  const saveQuery = (title: string, query: string, sources: string[]) => {
    const trimmedTitle = title.trim();

    const newQuery = {
      title: trimmedTitle,
      query,
      timestamp: Date.now(),
      sources,
    };

    const index = savedQueries.findIndex((q) => q.title === trimmedTitle);
    if (index === -1) {
      setSavedQueries(
        produce((draft) => {
          draft.push(newQuery);
        }),
      );
    } else {
      setSavedQueries(
        produce((draft) => {
          draft[index] = newQuery;
        }),
      );
    }
  };

  const deleteQuery = (title: string) => {
    setSavedQueries((prev) => prev.filter((q) => q.title !== title));
  };

  return (
    <SavedQueriesContext.Provider
      value={{
        saveQuery,
        deleteQuery,
        savedQueries,
      }}
    >
      {children}
    </SavedQueriesContext.Provider>
  );
};
