import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My Account — Kamadhenu Silks" }] }),
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: (search.tab as string) || "orders",
  }),
});
