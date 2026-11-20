import { z } from "zod";
import { defaultPreferences, type Preferences } from "./city-logic";
import type { PlanDay } from "./itinerary";
export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  parts: { type: "text"; text: string }[];
  activityIds?: string[] | undefined;
  resource?: boolean | undefined;
  resourceIds?: string[] | undefined;
  itinerary?: boolean | undefined;
  quickQuestions?: string[] | undefined;
};
export type CityState = {
  preferences: Preferences;
  completed: boolean;
  favorites: string[];
  messages: Message[];
  viewed: string[];
  discarded: string[];
  completedActivities: string[];
  learnedInterests: string[];
  round: number;
  itinerary: PlanDay[];
};
export const storageKey = "hola-ciudad-profile-v2";
const strings = z.array(z.string()).default([]);
const preferencesSchema = z.object({
  origin: z.string().default(""),
  arrival: z.string().default(""),
  neighborhood: z.string().default(""),
  interests: strings,
  goals: strings,
  budget: z.string().default(""),
  company: z.string().default(""),
  desiredActivities: strings,
  availability: strings,
  ageRange: z.string().default(""),
  timeBudget: z.string().default(""),
});
const messageSchema = z
  .object({
    id: z.string(),
    role: z.enum(["user", "assistant"]),
    text: z.string(),
    parts: z.array(z.object({ type: z.literal("text"), text: z.string() })).optional(),
    activityIds: z.array(z.string()).optional(),
    resource: z.boolean().optional(),
    resourceIds: z.array(z.string()).optional(),
    itinerary: z.boolean().optional(),
    quickQuestions: z.array(z.string()).optional(),
  })
  .transform((m) => ({ ...m, parts: m.parts ?? [{ type: "text" as const, text: m.text }] }));
const stateSchema = z.object({
  preferences: preferencesSchema,
  completed: z.boolean().default(false),
  favorites: strings,
  messages: z.array(messageSchema).default([]),
  viewed: strings,
  discarded: strings,
  completedActivities: strings,
  learnedInterests: strings,
  round: z.number().int().nonnegative().default(0),
  itinerary: z
    .array(
      z.object({
        day: z.number().int().min(1).max(7),
        activityId: z.string().nullable(),
        resourceId: z.string().nullable(),
        title: z.string(),
        done: z.boolean(),
      }),
    )
    .default([]),
});
export function newCityState(): CityState {
  return {
    preferences: {
      ...defaultPreferences,
      interests: [],
      goals: [],
      desiredActivities: [],
      availability: [],
    },
    completed: false,
    favorites: [],
    messages: [],
    viewed: [],
    discarded: [],
    completedActivities: [],
    learnedInterests: [],
    round: 0,
    itinerary: [],
  };
}
export function decodeCityState(raw: string | null): CityState {
  if (!raw) return newCityState();
  try {
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : newCityState();
  } catch {
    return newCityState();
  }
}
