import {
  recommendActivities,
  type Activity,
  type Preferences,
  type RecommendationMemory,
  type Resource,
} from "./city-logic";
export type PlanDay = {
  day: number;
  activityId: string | null;
  resourceId: string | null;
  title: string;
  done: boolean;
};
const practical = [
  "movilidad",
  "salud",
  "bibliotecas",
  "civicos",
  "tramites",
  "barrios",
  "comercio",
];
export function createItinerary(
  activities: Activity[],
  resources: Resource[],
  p: Preferences,
  memory: RecommendationMemory = {},
  old: PlanDay[] = [],
): PlanDay[] {
  const pool = recommendActivities(activities, p, memory);
  const used = new Set<string>();
  const result: PlanDay[] = [];
  for (let day = 1; day <= 7; day++) {
    const previous = old.find((d) => d.day === day);
    if (previous?.done) {
      result.push(previous);
      if (previous.activityId) used.add(previous.activityId);
      continue;
    }
    const practicalDay = day === 1 || day === 4;
    const socialDay = day === 6 || day === 7;
    const candidate = practicalDay
      ? undefined
      : pool.find((a) => !used.has(a.id) && (socialDay ? a.group : true));
    if (candidate) {
      used.add(candidate.id);
      result.push({
        day,
        activityId: candidate.id,
        resourceId: null,
        title: candidate.name,
        done: false,
      });
    } else {
      const preferred = practical[day - 1];
      const resource = resources.find((r) => r.id === preferred) ?? resources[0];
      result.push({
        day,
        activityId: null,
        resourceId: resource?.id ?? null,
        title: resource?.name ?? "Explora tu barrio a tu ritmo",
        done: false,
      });
    }
  }
  return result;
}
export function alternateDay(
  plan: PlanDay[],
  day: number,
  activities: Activity[],
  resources: Resource[],
  p: Preferences,
  memory: RecommendationMemory = {},
): PlanDay[] {
  const current = plan.find((d) => d.day === day);
  if (!current || current.done) return plan;
  const used = new Set(plan.flatMap((d) => (d.activityId ? [d.activityId] : [])));
  const candidate = recommendActivities(activities, p, memory).find((a) => !used.has(a.id));
  const resource =
    resources.find(
      (r) => r.id !== current.resourceId && !plan.some((d) => d.resourceId === r.id),
    ) ?? resources.find((r) => r.id !== current.resourceId);
  return plan.map((d) =>
    d.day !== day
      ? d
      : {
          ...d,
          activityId: candidate?.id ?? null,
          resourceId: candidate ? null : (resource?.id ?? null),
          title: candidate?.name ?? resource?.name ?? "Un paseo por tu barrio",
          done: false,
        },
  );
}
