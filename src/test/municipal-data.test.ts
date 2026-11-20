import { describe, expect, it } from "vitest";
import { filterMunicipalPlaces, municipalText, parseMunicipalPage } from "@/lib/municipal-data";

const sample = {
  totalCount: 1,
  result: [
    {
      id: "535",
      title: "Centro Cívico Valdefierro Pilar Adiego",
      streetAddress: "Pza. de la Inmaculada, 3",
      postalCode: "50012",
      telephone: "976 726028",
      openingHours:
        "<ul><li>Lunes a viernes: de 8,30 a 21,30h.</li><li>Sábado y domingo de 9,30 a 20,30h.</li></ul>",
      distritoId: "Oliver-Valdefierro",
      lastUpdated: "2025-09-17T15:13:45",
    },
  ],
};

describe("Municipal data", () => {
  it("preserves the published municipal address, phone, hours and record date", () => {
    const page = parseMunicipalPage(sample, "centros-civicos");
    expect(page.total).toBe(1);
    expect(page.items[0]).toMatchObject({
      name: "Centro Cívico Valdefierro Pilar Adiego",
      address: "Pza. de la Inmaculada, 3",
      phone: "976 726028",
      hours: "Lunes a viernes: de 8,30 a 21,30h. Sábado y domingo de 9,30 a 20,30h.",
      updatedAt: "2025-09-17T15:13:45",
      url: "https://www.zaragoza.es/sede/servicio/equipamiento/535",
    });
  });
  it("does not invent hours or dates when the provider omits them", () => {
    const page = parseMunicipalPage(
      {
        totalCount: 1,
        result: [
          {
            id: "12329",
            title: "Biblioteca del Instituto Aragonés de Ciencias de la Salud",
            openingHours: " ",
            lastUpdated: "invalid",
          },
        ],
      },
      "bibliotecas",
    );
    expect(page.items[0]?.hours).toBe("");
    expect(page.items[0]?.updatedAt).toBeNull();
  });
  it("removes provider markup, scripts and styles, and decodes entities as text", () => {
    expect(
      municipalText(
        "<script>alert(1)</script><style>body{}</style><p>Atenci&oacute;n &amp; informaci&#243;n&#x20;local</p>",
      ),
    ).toBe("Atención & información local");
    expect(municipalText("&#xFFFFFFFF;")).toBe("");
  });
  it("rejects malformed responses and IDs that cannot form official record URLs", () => {
    expect(() => parseMunicipalPage({ result: [] }, "bibliotecas")).toThrow();
    expect(() =>
      parseMunicipalPage(
        { totalCount: 1, result: [{ id: "../../elsewhere", title: "Record" }] },
        "bibliotecas",
      ),
    ).toThrow();
  });
  it("filters by search, type and district together without requiring accents", () => {
    const civic = parseMunicipalPage(sample, "centros-civicos").items;
    const library = parseMunicipalPage(
      {
        totalCount: 1,
        result: [
          { id: "1", title: "Biblioteca", distritoId: "Centro", streetAddress: "Pza. España" },
        ],
      },
      "bibliotecas",
    ).items;
    expect(
      filterMunicipalPlaces(
        [...civic, ...library],
        "civico",
        "centros-civicos",
        "Oliver-Valdefierro",
      ).map((r) => r.id),
    ).toEqual(["centros-civicos:535"]);
    expect(filterMunicipalPlaces([...civic, ...library], "50012", "", "")).toHaveLength(1);
    expect(filterMunicipalPlaces([...civic, ...library], "civico", "bibliotecas", "")).toEqual([]);
  });
  it("merges the two published spellings of the Actur district", () => {
    const page = parseMunicipalPage(
      { totalCount: 1, result: [{ id: "1", title: "Centro", distritoId: "Actur - Rey Fernando" }] },
      "centros-civicos",
    );
    expect(page.items[0]?.district).toBe("Actur-Rey Fernando");
  });
});
