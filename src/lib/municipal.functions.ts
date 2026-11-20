import { createServerFn } from "@tanstack/react-start";
import {
  municipalFields,
  municipalSources,
  parseMunicipalPage,
  type MunicipalKind,
  type MunicipalPlace,
} from "./municipal-data";

async function fetchDirectory(kind: MunicipalKind): Promise<MunicipalPlace[]> {
  const signal = AbortSignal.timeout(10000);
  const places = new Map<string, MunicipalPlace>();
  let start = 0;
  let total = 0;
  do {
    const url = new URL(`https://www.zaragoza.es/sede/servicio/equipamiento/basic/${kind}.json`);
    url.search = new URLSearchParams({
      rows: "100",
      start: String(start),
      fl: municipalFields,
    }).toString();
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal });
    if (!response.ok) {
      const body = await response.text();
      console.error(`Zaragoza directory ${kind} [${response.status}]: ${body.slice(0, 1000)}`);
      throw new Error(`Municipal provider [${response.status}]`);
    }
    const page = parseMunicipalPage(await response.json(), kind);
    total = page.total;
    for (const item of page.items) places.set(item.id, item);
    if (page.items.length === 0 && start < total) throw new Error("Incomplete municipal directory");
    start += page.items.length;
  } while (start < total);
  return [...places.values()];
}

// Fixed public directories only: no account, questionnaire or device location is sent upstream.
export const getZaragozaDirectories = createServerFn({ method: "GET" }).handler(async () => {
  const results = await Promise.all(
    municipalSources.map(async (source) => {
      try {
        return { items: await fetchDirectory(source.id), failure: null };
      } catch (error) {
        console.error(
          `Zaragoza directory ${source.id} unavailable:`,
          error instanceof Error ? error.message : "Invalid response",
        );
        return { items: [], failure: source.id };
      }
    }),
  );
  return {
    items: results
      .flatMap((result) => result.items)
      .sort((a, b) => a.name.localeCompare(b.name, "es")),
    failures: results.flatMap((result) => (result.failure ? [result.failure] : [])),
    fetchedAt: new Date().toISOString(),
  };
});
