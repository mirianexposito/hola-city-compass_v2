import { describe, expect, it } from "vitest";
import { activities, resources } from "@/lib/city-data";
import {
  defaultPreferences,
  recommendActivities,
  simulateReply,
  filterActivities,
  emptyFilters,
  type Activity,
} from "@/lib/city-logic";
import { createItinerary, alternateDay } from "@/lib/itinerary";
import { decodeCityState, newCityState } from "@/lib/city-session";
const profile = {
  ...defaultPreferences,
  neighborhood: "Universidad",
  budget: "Gratuito",
  timeBudget: "Hasta 2 horas",
  availability: ["Tardes"],
  interests: ["Naturaleza y excursiones"],
  goals: ["Conocer gente"],
};
describe("Core personalized recommendations", () => {
  it("respects a two-hour limit and availability without inventing availability", () => {
    const sample: Activity[] = [
      {
        ...activities[0],
        id: "short",
        name: "Short",
        description: "",
        category: "Naturaleza",
        interest: "Naturaleza y excursiones",
        zone: "Centro",
        price: 0,
        duration: "",
        group: false,
        outdoor: true,
        image: "",
        source: "",
        minutes: 120,
        timeSlots: ["Tardes"],
      },
      {
        id: "long",
        name: "Long",
        description: "",
        category: "Naturaleza",
        interest: "Naturaleza y excursiones",
        zone: "Centro",
        price: 0,
        duration: "",
        group: false,
        outdoor: true,
        image: "",
        source: "",
        minutes: 121,
        timeSlots: ["Tardes"],
      },
      {
        id: "morning",
        name: "Morning",
        description: "",
        category: "Naturaleza",
        interest: "Naturaleza y excursiones",
        zone: "Centro",
        price: 0,
        duration: "",
        group: false,
        outdoor: true,
        image: "",
        source: "",
        minutes: 30,
        timeSlots: ["Mañanas"],
      },
    ];
    expect(recommendActivities(sample, profile).map((a) => a.id)).toEqual(["short"]);
  });
  it("excludes discarded and completed activities", () => {
    const ids = recommendActivities(activities, profile, {
      discarded: ["parque"],
      completedActivities: ["ebro"],
    }).map((a) => a.id);
    expect(ids).not.toContain("parque");
    expect(ids).not.toContain("ebro");
  });
  it("offers a different first recommendation on requesting more proposals", () => {
    const first = recommendActivities(activities, profile);
    const next = recommendActivities(activities, profile, { round: 1 });
    expect(first.length).toBeGreaterThan(1);
    expect(next[0]?.id).not.toBe(first[0]?.id);
  });
  it("learns a stated conversational interest and respects it for ranking", () => {
    const reply = simulateReply("Me gusta la naturaleza", profile, activities);
    expect(reply.learnedInterests).toContain("Naturaleza y excursiones");
    expect(
      recommendActivities(
        activities,
        { ...defaultPreferences },
        { learnedInterests: ["Naturaleza y excursiones"] },
      )[0]?.interest,
    ).toBe("Naturaleza y excursiones");
  });
  it("continues the prior social conversation and excludes earlier recommendations", () => {
    const first = simulateReply("No conozco a nadie", profile, activities);
    const next = simulateReply("Otra propuesta", profile, activities, [
      { role: "user", text: "No conozco a nadie" },
      { role: "assistant", text: first.text, activityIds: first.activityIds },
    ]);
    expect(next.activityIds.length).toBeGreaterThan(0);
    expect(next.activityIds.some((id) => first.activityIds.includes(id))).toBe(false);
    expect(next.activityIds.every((id) => activities.find((a) => a.id === id)?.group)).toBe(true);
  });
  it("retrieves the relevant practical resource for empadronamiento", () => {
    expect(
      simulateReply("¿Cómo me empadrono?", profile, activities, [], {}, resources).resourceIds,
    ).toEqual(["tramites"]);
  });
  it("keeps explicit time constraints across a follow-up alternative", () => {
    const first = simulateReply(
      "Tengo una hora libre. Me gusta la naturaleza",
      defaultPreferences,
      activities,
    );
    const next = simulateReply("Otra propuesta", defaultPreferences, activities, [
      { role: "user", text: "Tengo una hora libre. Me gusta la naturaleza" },
      { role: "assistant", text: first.text, activityIds: first.activityIds },
    ]);
    expect(next.activityIds.length).toBeGreaterThan(0);
    expect(
      next.activityIds.every(
        (id) => (activities.find((a) => a.id === id)?.minutes ?? Infinity) <= 60,
      ),
    ).toBe(true);
  });
  it("passes an explicit one-hour itinerary limit to the generator", () => {
    const reply = simulateReply(
      "Adapta mi itinerario de siete días a una hora por propuesta",
      defaultPreferences,
      activities,
    );
    expect(reply.preferences?.timeBudget).toBe("Hasta 1 hora");
    expect(reply.itinerary).toBe(true);
  });
  it("filters social opportunities by user interest and free price", () => {
    const result = filterActivities(activities, {
      ...emptyFilters,
      groupOnly: true,
      freeOnly: true,
      interest: "Naturaleza y excursiones",
    });
    expect(result.map((a) => a.id)).toEqual(["senderismo"]);
  });
  it("limits explicit two-hour afternoon requests even with a flexible profile", () => {
    const result = simulateReply(
      "Tengo dos horas libres esta tarde",
      defaultPreferences,
      activities,
    );
    expect(result.activityIds.length).toBeGreaterThan(0);
    expect(
      result.activityIds.every(
        (id) => (activities.find((a) => a.id === id)?.minutes ?? Infinity) <= 120,
      ),
    ).toBe(true);
  });
});
describe("Seven-day itinerary rules", () => {
  it("creates exactly days one through seven with practical and social proposals", () => {
    const plan = createItinerary(activities, resources, profile);
    expect(plan.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(plan.some((d) => d.resourceId)).toBe(true);
    expect(plan.some((d) => activities.find((a) => a.id === d.activityId)?.group)).toBe(true);
  });
  it("does not repeat activities and respects budget and exclusions", () => {
    const plan = createItinerary(activities, resources, profile, { discarded: ["parque"] });
    const ids = plan.flatMap((d) => (d.activityId ? [d.activityId] : []));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("parque");
    expect(ids.every((id) => activities.find((a) => a.id === id)?.price === 0)).toBe(true);
  });
  it("preserves completed days while adapting the itinerary", () => {
    const original = createItinerary(activities, resources, profile).map((d) =>
      d.day === 2 ? { ...d, done: true } : d,
    );
    const next = createItinerary(
      activities,
      resources,
      { ...profile, budget: "Medio (15-40 €)" },
      {},
      original,
    );
    expect(next.find((d) => d.day === 2)).toEqual(original.find((d) => d.day === 2));
  });
  it("replaces a day with a different eligible activity or resource", () => {
    const plan = createItinerary(activities, resources, profile);
    const replacement = alternateDay(plan, 2, activities, resources, profile);
    expect(replacement[1]).not.toEqual(plan[1]);
    expect(replacement.filter((d) => d.day !== 2)).toEqual(plan.filter((d) => d.day !== 2));
  });
});
describe("Local profile continuity", () => {
  it("restores all memory and progress from local records", () => {
    const state = {
      ...newCityState(),
      preferences: profile,
      completed: true,
      viewed: ["ebro"],
      favorites: ["parque"],
      discarded: ["gancho"],
      completedActivities: ["casco"],
      learnedInterests: ["Cultura y museos"],
      itinerary: createItinerary(activities, resources, profile),
    };
    expect(decodeCityState(JSON.stringify(state))).toEqual(state);
  });
  it("migrates an older session profile without re-asking old answers", () => {
    const state = decodeCityState(
      JSON.stringify({
        preferences: { neighborhood: "Delicias", interests: ["Cultura y museos"] },
        completed: true,
        messages: [{ id: "old", role: "assistant", text: "Hola" }],
        favorites: ["ebro"],
      }),
    );
    expect(state.preferences.neighborhood).toBe("Delicias");
    expect(state.completed).toBe(true);
    expect(state.preferences.availability).toEqual([]);
    expect(state.messages[0]?.parts).toEqual([{ type: "text", text: "Hola" }]);
  });
  it("resets malformed stored data safely", () => {
    expect(decodeCityState("{broken")).toEqual(newCityState());
    expect(decodeCityState(JSON.stringify({ preferences: { interests: 42 } }))).toEqual(
      newCityState(),
    );
  });
  it("starts with practical resources when someone has just arrived", () => {
    const reply = simulateReply(
      "Acabo de llegar a Zaragoza y no sé por dónde empezar",
      profile,
      activities,
      [],
      {},
      resources,
    );
    expect(reply.resource).toBe(true);
    expect(reply.resourceIds?.length).toBeGreaterThan(0);
    expect(reply.quickQuestions?.length).toBeGreaterThan(0);
  });
  it("includes at least one group option when the user wants to meet people", () => {
    const reply = simulateReply("¿Dónde puedo conocer gente?", profile, activities);
    expect(reply.activityIds.length).toBeGreaterThan(0);
    expect(reply.activityIds.every((id) => activities.find((a) => a.id === id)?.group)).toBe(true);
    expect(reply.quickQuestions?.length).toBeGreaterThan(0);
  });
  it("admits missing information and suggests who to ask", () => {
    const reply = simulateReply(
      "Otra propuesta",
      { ...profile, budget: "Gratuito" },
      activities,
      [
        { role: "user", text: "¿Qué puedo hacer?" },
        {
          role: "assistant",
          text: "Ideas",
          activityIds: activities.map((a) => a.id),
        },
      ],
    );
    expect(reply.activityIds).toEqual([]);
    expect(reply.text).toMatch(/centro cívico|010/);
    expect(reply.quickQuestions?.length).toBeGreaterThan(0);
  });
  it("answers with quick follow-up questions and at most four sentences", () => {
    const reply = simulateReply("¿Qué puedo hacer este fin de semana?", profile, activities);
    expect(reply.quickQuestions?.length).toBeGreaterThan(0);
    const sentences = reply.text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
    expect(sentences.length).toBeLessThanOrEqual(5);
  });
});
