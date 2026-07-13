import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

let queryClient: QueryClient | undefined;

export const getRouter = () => {
  // Use a singleton on the client to preserve the cache across navigation and re-renders
  if (typeof window !== "undefined") {
    if (!queryClient) {
      queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            refetchOnWindowFocus: false, // Prevents refetching on window focus/tab change
            refetchOnMount: false, // Prevents automatic background refetch on component remount if fresh
            refetchOnReconnect: false, // Prevents background refetch on reconnect
          },
        },
      });
    }
  } else {
    // Fresh client per request on the server
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 10,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
        },
      },
    });
  }

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadDelay: 0,
    defaultPreloadStaleTime: 1000 * 60 * 5, // 5 minutes
  });

  return router;
};
