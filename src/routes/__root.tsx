import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  ScrollRestoration,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth-context";
import { AdminProvider } from "../lib/admin-context";
import { UserDataProvider } from "../lib/user-data-context";

function TopLoadingBar() {
  const state = useRouterState();
  const isLoading = state.status === "pending";
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(10);
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 8;
        });
      }, 150);
      return () => clearInterval(timer);
    } else {
      setProgress(100);
      const timer = setTimeout(() => {
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] h-[3px] bg-gradient-to-r from-gold/50 via-gold to-gold-soft transition-transform duration-300 ease-out origin-left"
      style={{
        transform: `scaleX(${progress / 100}) translateZ(0)`,
        boxShadow: "0 0 10px oklch(0.74 0.13 82 / 0.7), 0 0 5px oklch(0.74 0.13 82 / 0.4)",
        willChange: "transform",
      }}
    />
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kamadhenu Silks — Heirloom Kanchipuram Silk Sarees" },
      { name: "description", content: "Handwoven Kanchipuram silk sarees, certified Silk Mark, shipped worldwide. Wedding, festive and heirloom collections." },
      { property: "og:title", content: "Kamadhenu Silks — Heirloom Kanchipuram Silk Sarees" },
      { property: "og:description", content: "Handwoven Kanchipuram silk sarees, certified Silk Mark, shipped worldwide." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preload", as: "style", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <AuthProvider>
          <UserDataProvider>
            {/* Custom hardware-accelerated loading indicator */}
            <TopLoadingBar />
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#2d0a12",
                  color: "#f5e6c8",
                  border: "1px solid rgba(196,160,80,0.35)",
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "14px",
                },
              }}
              richColors
            />
          </UserDataProvider>
        </AuthProvider>
      </AdminProvider>
    </QueryClientProvider>
  );
}
