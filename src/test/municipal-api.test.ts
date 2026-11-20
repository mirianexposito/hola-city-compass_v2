import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ handler: (callback: () => Promise<unknown>) => callback }),
}));
import { getZaragozaDirectories } from "@/lib/municipal.functions";
import { municipalFields } from "@/lib/municipal-data";

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const response = (id: string, title: string, totalCount = 1) =>
  Response.json({ totalCount, result: [{ id, title }] });

describe("Zaragoza municipal API", () => {
  it("requests only public fixed Zaragoza directories, without account or questionnaire data", async () => {
    const request = vi
      .fn()
      .mockImplementation(async (url: URL) =>
        response(url.pathname.includes("bibliotecas") ? "1" : "2", "Centro"),
      );
    vi.stubGlobal("fetch", request);
    const result = await getZaragozaDirectories();
    expect(result.items).toHaveLength(2);
    expect(result.failures).toEqual([]);
    expect(request).toHaveBeenCalledTimes(2);
    for (const [url, options] of request.mock.calls) {
      expect(url.origin).toBe("https://www.zaragoza.es");
      expect(url.pathname).toMatch(
        /^\/sede\/servicio\/equipamiento\/basic\/(bibliotecas|centros-civicos)\.json$/,
      );
      expect([...url.searchParams.keys()].sort()).toEqual(["fl", "rows", "start"]);
      expect(url.searchParams.get("fl")).toBe(municipalFields);
      expect(options.headers).toEqual({ Accept: "application/json" });
      expect(options.signal).toBeInstanceOf(AbortSignal);
    }
  });
  it("loads further pages instead of silently truncating the municipal directory", async () => {
    const request = vi.fn().mockImplementation(async (url: URL) => {
      if (url.pathname.includes("centros-civicos")) return response("3", "Cívico");
      return url.searchParams.get("start") === "0"
        ? response("1", "Primera", 2)
        : response("2", "Segunda", 2);
    });
    vi.stubGlobal("fetch", request);
    const result = await getZaragozaDirectories();
    expect(result.items.map((r) => r.name)).toEqual(["Cívico", "Primera", "Segunda"]);
    expect(request.mock.calls.map(([url]) => url.searchParams.get("start"))).toContain("1");
  });
  it("keeps the working source available when the other returns a provider error", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(async (url: URL) =>
          url.pathname.includes("bibliotecas")
            ? new Response("Unavailable", { status: 503 })
            : response("535", "Centro Cívico Valdefierro Pilar Adiego"),
        ),
    );
    const result = await getZaragozaDirectories();
    expect(result.items[0]?.name).toBe("Centro Cívico Valdefierro Pilar Adiego");
    expect(result.failures).toEqual(["bibliotecas"]);
  });
  it("returns a recoverable failure when both providers are offline", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await getZaragozaDirectories();
    expect(result.items).toEqual([]);
    expect(result.failures).toEqual(["bibliotecas", "centros-civicos"]);
  });
  it("does not present malformed or incomplete data as a successful directory", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(async (url: URL) =>
          Response.json(
            url.pathname.includes("bibliotecas")
              ? { totalCount: 2, result: [] }
              : { result: "invalid" },
          ),
        ),
    );
    const result = await getZaragozaDirectories();
    expect(result.items).toEqual([]);
    expect(result.failures).toEqual(["bibliotecas", "centros-civicos"]);
  });
});
