import { z } from "zod";
import type { Preferences } from "./city-logic";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export const profileAnswersSchema = z.object({
  origin: z.string().trim(),
  arrival: z.string().trim(),
  neighborhood: z.string().trim(),
  interests: z.array(z.string().trim()),
  goals: z.array(z.string().trim()),
  budget: z.string().trim(),
  company: z.string().trim(),
  desiredActivities: z.array(z.string().trim()),
  availability: z.array(z.string().trim()),
  ageRange: z.string().trim(),
});

export function toProfileRecord(
  userId: string,
  preferences: Preferences,
  completed: boolean,
): TablesInsert<"profiles"> {
  const answers = profileAnswersSchema.parse(preferences);
  return {
    user_id: userId,
    origin: answers.origin,
    arrival: answers.arrival,
    neighborhood: answers.neighborhood,
    interests: answers.interests,
    goals: answers.goals,
    budget: answers.budget,
    company: answers.company,
    desired_activities: answers.desiredActivities,
    availability: answers.availability,
    age_range: answers.ageRange,
    onboarding_completed: completed,
  };
}

export function fromProfileRecord(row: Tables<"profiles">, localTimeBudget = ""): Preferences {
  return {
    origin: row.origin,
    arrival: row.arrival,
    neighborhood: row.neighborhood,
    interests: row.interests,
    goals: row.goals,
    budget: row.budget,
    company: row.company,
    desiredActivities: row.desired_activities,
    availability: row.availability,
    ageRange: row.age_range,
    timeBudget: localTimeBudget,
  };
}
