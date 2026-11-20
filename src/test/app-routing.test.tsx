import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
  it.each([
    "/auth",
    "/mi-zaragoza",
    "/onboarding",
    "/planes",
    "/compañero",
    "/conoce-gente",
    "/informacion",
    "/como-funciona",
    "/creditos",
    "/primeros-dias",
    "/cuenta",
    "/usuarios",
    "/privacidad",
  ])("matches the requested screen %s", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes(path);
    expect(matches.at(-1)?.pathname).toBe(path);
  });
  it.each([
    "/compañero",
    "/como-funciona",
    "/creditos",
    "/primeros-dias",
    "/cuenta",
    "/usuarios",
  ])("requires the authenticated parent for %s", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes(path).map((match) => match.routeId)).toContain("/_authenticated");
  });
  it.each([
    "/",
    "/auth",
    "/forgot-password",
    "/reset-password",
    "/privacidad",
    "/onboarding",
    "/mi-zaragoza",
    "/planes",
    "/conoce-gente",
    "/informacion",
  ])(
    "keeps the account entry point %s public",
    (path) => {
      const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
      const matches = router.matchRoutes(path);
      expect(matches.at(-1)?.pathname).toBe(path);
      expect(matches.map((match) => match.routeId)).not.toContain("/_authenticated");
    },
  );
});
