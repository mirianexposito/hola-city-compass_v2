import { describe, expect, it } from "vitest";
import { neighborhoods, ruralNeighborhoods, urbanNeighborhoods } from "@/lib/city-data";

describe("Zaragoza neighborhood coverage", () => {
  it("includes every municipal urban district and familiar neighborhoods instead of Other", () => {
    const expected = [
      "Actur-Rey Fernando",
      "Casablanca",
      "Casco Histórico",
      "Centro",
      "Delicias",
      "Distrito Sur",
      "El Rabal",
      "La Almozara",
      "Las Fuentes",
      "Miralbueno",
      "Oliver-Valdefierro",
      "San José",
      "Santa Isabel",
      "Torrero-La Paz",
      "Universidad",
      "Arcosur",
      "Montecanal",
      "Rosales del Canal",
      "Valdespartera",
      "Parque Venecia",
      "El Gancho",
      "La Magdalena",
      "Parque Goya",
      "La Jota",
      "Picarral",
      "Vadorrey",
      "Cogullada",
      "Zalfonada",
      "El Portillo",
      "El Zorongo",
    ];
    expect(urbanNeighborhoods).toEqual(expect.arrayContaining(expected));
    expect(neighborhoods).not.toContain("Otro");
    expect(new Set(neighborhoods).size).toBe(neighborhoods.length);
  });

  it("includes all fourteen municipal rural neighborhoods", () => {
    expect(ruralNeighborhoods).toEqual([
      "Alfocea",
      "Casetas",
      "Garrapinillos",
      "Juslibol",
      "La Cartuja Baja",
      "Montañana",
      "Monzalbarba",
      "Movera",
      "Peñaflor de Gállego",
      "San Gregorio",
      "San Juan de Mozarrifar",
      "Torrecilla de Valmadrid",
      "Venta del Olivar",
      "Villarrapa",
    ]);
    expect(neighborhoods).toEqual(expect.arrayContaining(ruralNeighborhoods));
  });
});
