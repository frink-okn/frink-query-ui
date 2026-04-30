import React, { createContext, useContext, useState } from "react";

const ExplicitQueryContext = createContext<{
  explicitQuery: string | null;
  setExplicitQuery: (query: string) => void;
} | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useExplicitQueryContext = () => {
  const context = useContext(ExplicitQueryContext);

  if (context == null)
    throw new Error(
      "useExplicitQueryContext must be used under a ExplicitQueryProvider",
    );

  return context;
};

interface ExplicitQueryProviderProps {
  children: React.ReactNode;
}

export const ExplicitQueryProvider = ({ children }: ExplicitQueryProviderProps) => {
  const [explicitQuery, setExplicitQuery] = useState<null | string>(null)

  return (
    <ExplicitQueryContext.Provider
      value={{
        explicitQuery: explicitQuery,
        setExplicitQuery: (query: string) => {
          setExplicitQuery(query);
        },
      }}
    >
      {children}
    </ExplicitQueryContext.Provider>
  )
}
