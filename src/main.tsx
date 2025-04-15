import React, { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

import "@triply/yasqe/build/yasqe.min.css";

// This file is created automatically by Tanstack Router based
// on the files in `./routes/`
import { routeTree } from "./routeTree.gen";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      gcTime: 24 * 60 * 60 * 1000,
      retry: false,
    },
  },
});

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  }
});

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense>
        <TanStackRouterDevtools router={router} position="bottom-right" />
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} position="left" buttonPosition="top-right" />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
