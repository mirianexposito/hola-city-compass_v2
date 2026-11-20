import { describe, expect, it, vi, beforeEach } from "vitest";
import { defaultPreferences } from "@/lib/city-logic";
import { fromProfileRecord, toProfileRecord } from "@/lib/profile-record";
import type { Tables } from "@/integrations/supabase/types";

const query = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  upsert: vi.fn(),
  single: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: query.from } }));
import { readProfile, writeProfile, removeProfile } from "@/lib/profile-storage";

const preferences = {
  ...defaultPreferences,
  origin: "Otro país",
  arrival: "Acabo de llegar",
  neighborhood: "San José",
  interests: ["Cultura y museos"],
  goals: ["Conocer gente", "Encontrar voluntariado"],
  budget: "Gratuito",
  company: "Por mi cuenta",
  desiredActivities: ["Aprender cerámica"],
  availability: ["Tardes"],
  ageRange: "25–34",
  timeBudget: "Hasta 1 hora",
};
const row: Tables<"profiles"> = {
  display_name: "",
  user_id: "owner-a",
  origin: preferences.origin,
  arrival: preferences.arrival,
  neighborhood: preferences.neighborhood,
  interests: preferences.interests,
  goals: preferences.goals,
  budget: preferences.budget,
  company: preferences.company,
  desired_activities: preferences.desiredActivities,
  availability: preferences.availability,
  age_range: preferences.ageRange,
  onboarding_completed: true,
  created_at: "2026-11-13T18:00:00Z",
  updated_at: "2026-11-13T18:00:00Z",
};

beforeEach(() => {
  vi.resetAllMocks();
  query.from.mockReturnValue(query);
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.upsert.mockReturnValue(query);
  query.delete.mockReturnValue(query);
});

describe("Private profile database", () => {
  it("stores every form answer including free goals and activities but not removed duration", () => {
    expect(toProfileRecord("owner-a", preferences, true)).toEqual({
      user_id: "owner-a",
      origin: "Otro país",
      arrival: "Acabo de llegar",
      neighborhood: "San José",
      interests: ["Cultura y museos"],
      goals: ["Conocer gente", "Encontrar voluntariado"],
      budget: "Gratuito",
      company: "Por mi cuenta",
      desired_activities: ["Aprender cerámica"],
      availability: ["Tardes"],
      age_range: "25–34",
      onboarding_completed: true,
    });
    expect(fromProfileRecord(row)).toEqual({ ...preferences, timeBudget: "" });
  });
  it("reads only the requested owner's record", async () => {
    query.maybeSingle.mockResolvedValue({ data: row, error: null });
    expect(await readProfile("owner-a")).toEqual(row);
    expect(query.eq).toHaveBeenCalledWith("user_id", "owner-a");
  });
  it("updates one owner record and reads back the saved answer", async () => {
    query.single.mockResolvedValue({ data: row, error: null });
    expect(await writeProfile("owner-a", preferences, true)).toEqual(row);
    expect(query.upsert).toHaveBeenCalledWith(toProfileRecord("owner-a", preferences, true), {
      onConflict: "user_id",
    });
  });
  it("does not report success when database save fails", async () => {
    query.single.mockResolvedValue({ data: null, error: new Error("write failed") });
    await expect(writeProfile("owner-a", preferences, true)).rejects.toThrow("write failed");
  });
  it("deletes only the current owner's profile and surfaces failures", async () => {
    query.eq.mockResolvedValue({ error: new Error("delete failed") });
    await expect(removeProfile("owner-a")).rejects.toThrow("delete failed");
    expect(query.eq).toHaveBeenCalledWith("user_id", "owner-a");
  });
});
