import { describe, expect, it } from "vitest";
import {
  customAnswers,
  goalOptions,
  questionnaireSteps,
  withCustomAnswer,
} from "@/lib/questionnaire";
import { desiredActivities } from "@/lib/city-data";
import { decodeCityState, newCityState } from "@/lib/city-session";

describe("Questionnaire preferences", () => {
  it("stores a free goal alongside the existing selections", () => {
    const goals = withCustomAnswer(["Conocer gente"], goalOptions, "  Encontrar voluntariado  ");
    expect(goals).toEqual(["Conocer gente", "Encontrar voluntariado"]);
    const state = { ...newCityState(), preferences: { ...newCityState().preferences, goals } };
    expect(decodeCityState(JSON.stringify(state)).preferences.goals).toEqual(goals);
  });

  it("stores and edits a free activity without losing preset selections", () => {
    const selected = withCustomAnswer(
      ["Practicar deporte"],
      desiredActivities,
      "Aprender cerámica",
    );
    const edited = withCustomAnswer(selected, desiredActivities, "Hacer teatro");
    expect(edited).toEqual(["Practicar deporte", "Hacer teatro"]);
    expect(customAnswers(edited, desiredActivities)).toEqual(["Hacer teatro"]);
    const state = {
      ...newCityState(),
      preferences: { ...newCityState().preferences, desiredActivities: edited },
    };
    expect(decodeCityState(JSON.stringify(state)).preferences.desiredActivities).toEqual(edited);
  });

  it("removes the custom answer without clearing other selected choices", () => {
    expect(withCustomAnswer(["Conocer gente", "Hacer voluntariado"], goalOptions, "  ")).toEqual([
      "Conocer gente",
    ]);
    expect(withCustomAnswer([], goalOptions, "  ")).toEqual([]);
  });

  it("finishes with the age range as the last question, without asking for time per plan", () => {
    expect(questionnaireSteps.map((step) => step.key)).toEqual([
      "origin",
      "arrival",
      "neighborhood",
      "interests",
      "goals",
      "desiredActivities",
      "budget",
      "company",
      "availability",
      "ageRange",
    ]);
    expect(questionnaireSteps.at(-1)?.options).toContain("Prefiero no decirlo");
  });
});
