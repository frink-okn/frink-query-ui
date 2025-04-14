import { Outlet, createRootRoute } from "@tanstack/react-router";
import { CssBaseline, CssVarsProvider, styled } from "@mui/joy";
import { Sidebar } from "../ui/Sidebar/Sidebar";
import { fetchSources } from "../data/sources";
import { fetchExamples } from "../data/examples";
import { QueryProvider } from "../context/query";

import "../styles.css";
import { SavedQueriesProvider } from "../context/savedQueries";

export const Route = createRootRoute({
  component: RootComponent,
  loader: async () => {
    const [sources, examples] = await Promise.all([
      fetchSources(),
      fetchExamples(),
    ]);
    return { sources, examples }
  },
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
