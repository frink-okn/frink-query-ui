import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { CssBaseline, CssVarsProvider, styled } from "@mui/joy";
import { Sidebar } from "../ui/Sidebar/Sidebar";
import { fetchSources } from "../data/sources";
import { QueryProvider } from "../context/query";

import "../styles.css";
import { SavedQueriesProvider } from "../context/savedQueries";
import type { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  loader: async () => ({
    sources: await fetchSources(),
  }),
  staleTime: Infinity,
  pendingComponent: () => <div>Loading...</div>,
});

function RootComponent() {
  return (
    <CssVarsProvider>
      <QueryProvider>
        <SavedQueriesProvider>
          <CssBaseline />

          <Wrapper>
            <Sidebar />
            <Main>
              <Outlet />
            </Main>
          </Wrapper>
        </SavedQueriesProvider>
      </QueryProvider>
    </CssVarsProvider>
  );
}

const Wrapper = styled("div")`
  height: 100%;
  display: flex;
  flex-direction: row;
`;

const Main = styled("main")`
  flex: 1;
  overflow: auto;
`;
