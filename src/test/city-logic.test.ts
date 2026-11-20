import { describe, expect, it } from "vitest";
import {
  matchesBudget,
  filterActivities,
  defaultPreferences,
  recommendActivities,
  simulateReply,
  type Activity,
  emptyFilters,
} from "@/lib/city-logic";
const activities: Activity[] = [
  {
    id: "walk",
    name: "Paseo por el Ebro",
    description: "Ribera",
    category: "Naturaleza",
    interest: "Naturaleza y excursiones",
    zone: "Centro",
    price: 0,
    duration: "Libre",
    group: false,
    outdoor: true,
    image: "",
    source: "",
  },
  {
    id: "workshop",
    name: "Taller",
    description: "Cultura",
    category: "Cultura",
    interest: "Cultura y museos",
    zone: "Delicias",
    price: null,
    duration: "Consultar",
    group: true,
    outdoor: false,
    image: "",
    source: "",
  },
];
describe("Budget rules from the brief", () => {
  it("Gratuito includes zero only", () => {
    expect(matchesBudget(0, "Gratuito")).toBe(true);
    expect(matchesBudget(1, "Gratuito")).toBe(false);
    expect(matchesBudget(null, "Gratuito")).toBe(false);
  });
  it("Bajo is strictly less than 15 euros", () => {
    expect(matchesBudget(14.99, "Bajo (menos de 15 €)")).toBe(true);
    expect(matchesBudget(15, "Bajo (menos de 15 €)")).toBe(false);
  });
  it("Medio includes 15 through 40 euros", () => {
    expect(matchesBudget(15, "Medio (15-40 €)")).toBe(true);
    expect(matchesBudget(40, "Medio (15-40 €)")).toBe(true);
    expect(matchesBudget(14, "Medio (15-40 €)")).toBe(false);
    expect(matchesBudget(41, "Medio (15-40 €)")).toBe(false);
  });
  it("Flexible allows unconfirmed prices", () => {
    expect(matchesBudget(null, "Flexible")).toBe(true);
    expect(matchesBudget(100, "Flexible")).toBe(true);
  });
});
describe("Session personalization and discovery", () => {
  it("combines filters and saved favorites", () => {
    expect(
      filterActivities(activities, { ...emptyFilters, setting: "Exterior", favoritesOnly: true }, [
        "walk",
      ]).map((a) => a.id),
    ).toEqual(["walk"]);
    expect(
      filterActivities(activities, { ...emptyFilters, category: "Cultura", setting: "Exterior" }),
    ).toHaveLength(0);
  });
  it("ranks interests and neighborhood", () => {
    expect(
      recommendActivities(activities, {
        ...defaultPreferences,
        interests: ["Cultura y museos"],
        neighborhood: "Delicias",
      })[0]?.id,
    ).toBe("workshop");
  });
  it("uses social proposals for someone wanting to meet people", () => {
    expect(simulateReply("No conozco a nadie", defaultPreferences, activities).activityIds).toEqual(
      ["workshop"],
    );
  });
  it("does not recommend paid or unknown-price plans for free requests", () => {
    expect(
      simulateReply("actividades gratuitas", defaultPreferences, activities).activityIds,
    ).toEqual(["walk"]);
  });
});
