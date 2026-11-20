export type Preferences = {
  origin: string;
  arrival: string;
  neighborhood: string;
  interests: string[];
  goals: string[];
  budget: string;
  company: string;
  desiredActivities: string[];
  availability: string[];
  ageRange: string;
  timeBudget: string;
};
export const defaultPreferences: Preferences = {
  origin: "",
  arrival: "",
  neighborhood: "",
  interests: [],
  goals: [],
  budget: "",
  company: "",
  desiredActivities: [],
  availability: [],
  ageRange: "",
  timeBudget: "",
};
export type Activity = {
  id: string;
  name: string;
  description: string;
  category: string;
  interest: string;
  zone: string;
  price: number | null;
  duration: string;
  group: boolean;
  outdoor: boolean;
  image: string;
  source: string;
  minutes?: number;
  timeSlots?: string[];
  kind?: "visit" | "exploration";
  tags?: string[];
};
export type Resource = {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  label: string;
  keywords: string[];
  answer: string;
};
export type Filters = {
  search: string;
  category: string;
  price: string;
  zone: string;
  company: string;
  setting: string;
  favoritesOnly?: boolean;
  interest?: string;
  freeOnly?: boolean;
  groupOnly?: boolean;
};
export const emptyFilters: Filters = {
  search: "",
  category: "",
  price: "",
  zone: "",
  company: "",
  setting: "",
};
export function normalize(text: string) {
  return text
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
export function matchesBudget(price: number | null, budget: string) {
  if (!budget || budget === "Flexible") return true;
  if (price === null) return false;
  if (budget === "Gratuito") return price === 0;
  if (budget === "Bajo (menos de 15 €)") return price < 15;
  if (budget === "Medio (15-40 €)") return price >= 15 && price <= 40;
  return true;
}
export function filterActivities(activities: Activity[], f: Filters, favorites: string[] = []) {
  return activities.filter(
    (a) =>
      (!f.search ||
        normalize(`${a.name} ${a.description} ${a.zone} ${a.category}`).includes(
          normalize(f.search),
        )) &&
      (!f.category || a.category === f.category) &&
      matchesBudget(a.price, f.price) &&
      (!f.zone || a.zone === f.zone) &&
      (!f.company || a.group === (f.company === "Grupales")) &&
      (!f.setting || a.outdoor === (f.setting === "Exterior")) &&
      (!f.favoritesOnly || favorites.includes(a.id)) &&
      (!f.interest || a.interest === f.interest) &&
      (!f.freeOnly || a.price === 0) &&
      (!f.groupOnly || a.group),
  );
}
export type RecommendationMemory = {
  discarded?: string[];
  completedActivities?: string[];
  viewed?: string[];
  favorites?: string[];
  learnedInterests?: string[];
  round?: number;
};
export function availableMinutes(p: Preferences) {
  return p.timeBudget === "Hasta 1 hora" ? 60 : p.timeBudget === "Hasta 2 horas" ? 120 : Infinity;
}
export function fitsAvailability(a: Activity, p: Preferences) {
  if (
    Number.isFinite(availableMinutes(p)) &&
    (a.minutes === undefined || a.minutes > availableMinutes(p))
  )
    return false;
  if (!p.availability.length || !a.timeSlots?.length) return true;
  return p.availability.some((slot) => a.timeSlots?.includes(slot));
}
export function recommendActivities(
  activities: Activity[],
  p: Preferences,
  memory: RecommendationMemory = {},
) {
  const pool = activities.filter(
    (a) =>
      matchesBudget(a.price, p.budget) &&
      fitsAvailability(a, p) &&
      !memory.discarded?.includes(a.id) &&
      !memory.completedActivities?.includes(a.id),
  );
  const social =
    p.company === "Con otras personas" ||
    p.company === "Me gustaría conocer gente nueva" ||
    p.goals.some((g) => /gente|integrad/i.test(g));
  const scored = pool
    .map((a) => ({
      a,
      score:
        (p.interests.includes(a.interest) ? 6 : 0) +
        (memory.learnedInterests?.includes(a.interest) ? 4 : 0) +
        (a.zone === p.neighborhood ? 4 : 0) +
        (social && a.group ? 5 : 0) +
        ((p.company === "Por mi cuenta" || p.company === "En pareja") && !a.group ? 3 : 0) +
        (p.desiredActivities.some((d) => a.tags?.includes(d)) ? 4 : 0) +
        (p.goals.includes("Descubrir la ciudad") && a.category === "Barrio" ? 2 : 0) +
        (p.goals.includes("Conocer servicios y recursos útiles") &&
        a.category === "Servicios prácticos"
          ? 5
          : 0) +
        (memory.favorites?.includes(a.id) ? 1 : 0) -
        (memory.viewed?.includes(a.id) ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ a }) => a);
  const round = memory.round ?? 0;
  if (!round || scored.length < 2) return scored;
  const offset = round % scored.length;
  return [...scored.slice(offset), ...scored.slice(0, offset)];
}
export function recommendationReason(a: Activity, p: Preferences, m: RecommendationMemory = {}) {
  const reasons = [];
  if (a.zone === p.neighborhood) reasons.push("En tu barrio");
  if (p.interests.includes(a.interest) || m.learnedInterests?.includes(a.interest))
    reasons.push("Encaja con tus intereses");
  if (a.group && (p.goals.includes("Conocer gente") || p.company.includes("gente")))
    reasons.push("Para conectar");
  if (a.minutes && Number.isFinite(availableMinutes(p))) reasons.push("Encaja con tu tiempo");
  return reasons.join(" · ") || "Un nuevo descubrimiento";
}
export type ConversationTurn = {
  role: "user" | "assistant";
  text: string;
  activityIds?: string[] | undefined;
};
export type ChatReply = {
  text: string;
  activityIds: string[];
  resource?: boolean;
  resourceIds?: string[];
  itinerary?: boolean;
  learnedInterests?: string[];
  preferences?: Preferences;
  quickQuestions?: string[];
};
const quickActivityQuestions = [
  "Otra propuesta",
  "Cuéntame más sobre la primera",
  "¿Qué puedo hacer este fin de semana?",
];
const quickResourceQuestions = [
  "¿Cómo me muevo por la ciudad?",
  "¿Qué trámites debo hacer al llegar?",
  "¿Dónde está mi centro de salud?",
];
const interestRules: [RegExp, string][] = [
  [/naturaleza|senderismo|excurs|bosque/, "Naturaleza y excursiones"],
  [/deporte|correr|running/, "Deporte y actividades al aire libre"],
  [/cultura|museo|exposicion/, "Cultura y museos"],
  [/gastronom|cafe|comer|tapas/, "Gastronomía y cafeterías"],
  [/musica|concierto/, "Música y conciertos"],
  [/taller|aprender|idioma/, "Talleres y aprendizaje"],
  [/mercado|comercio/, "Mercados y comercio local"],
  [/gente|social|amig/, "Ocio y vida social"],
];
export function extractInterests(question: string) {
  const q = normalize(question);
  if (/no me gusta|no quiero|no me interesa/.test(q)) return [];
  return interestRules.filter(([re]) => re.test(q)).map(([, interest]) => interest);
}
export function simulateReply(
  question: string,
  p: Preferences,
  activities: Activity[],
  history: ConversationTurn[] = [],
  memory: RecommendationMemory = {},
  resources: Resource[] = [],
): ChatReply {
  const q = normalize(question);
  const previousUser = history
    .filter((m) => m.role === "user")
    .map((m) => m.text)
    .join(" ");
  const lastReply = history.filter((m) => m.role === "assistant").at(-1);
  const followup =
    /^(otra|otro|mas|y |si|no,|mejor|esas|esos|la primera|el primero|cuentame)/.test(q) ||
    /alternativa|otra propuesta/.test(q);
  const context = followup ? `${normalize(previousUser)} ${q}` : q;
  const learnedInterests = extractInterests(question);
  const effective = {
    ...p,
    interests: [
      ...new Set([...p.interests, ...(memory.learnedInterests ?? []), ...learnedInterests]),
    ],
  };
  const hours = context.match(/(\d+)\s*horas?/);
  const wordHours = /dos horas/.test(context) ? 2 : /una hora/.test(context) ? 1 : undefined;
  const minuteMatch = context.match(/(\d+)\s*minutos?/);
  const minutes = minuteMatch
    ? Number(minuteMatch[1])
    : hours
      ? Number(hours[1]) * 60
      : wordHours
        ? wordHours * 60
        : undefined;
  const free = /gratis|gratuit|sin gastar/.test(context);
  if (free) effective.budget = "Gratuito";
  if (minutes !== undefined)
    effective.timeBudget =
      minutes <= 60 ? "Hasta 1 hora" : minutes <= 120 ? "Hasta 2 horas" : "Sin límite";
  if (/esta tarde/.test(context)) effective.availability = ["Tardes"];
  let pool = recommendActivities(activities, effective, { ...memory, round: 0 });
  if (minutes !== undefined)
    pool = pool.filter((a) => a.minutes !== undefined && a.minutes <= minutes);
  const near = p.neighborhood ? ` Tengo presente que vives en ${p.neighborhood}.` : "";
  const slot = /esta tarde/.test(q)
    ? " esta tarde"
    : p.availability.length
      ? ` en tus ratos de ${p.availability.join(", ").toLocaleLowerCase("es")}`
      : "";
  const disclaimer =
    "Son ideas de demostración: confirma las condiciones de cada actividad en su fuente oficial.";
  const resourceHits = resources.filter((r) =>
    r.keywords.some((k) => context.includes(normalize(k))),
  );
  // Regla: si acaba de llegar, empezar por lo práctico (transporte, salud, trámites).
  if (/acabo de llegar|recien llegad|me acabo de mudar|soy nuev[oa] en/.test(context)) {
    const practical = resources.filter((r) =>
      r.keywords.some((k) => /transporte|autobus|tranvia|salud|medic|empadron|tramite/.test(normalize(k))),
    );
    if (practical.length)
      return {
        text: `¡Bienvenida a Zaragoza!${near} Empecemos por lo práctico, que es lo que más aprieta al principio.\n\n${practical
          .slice(0, 2)
          .map((r) => `**${r.name}.** ${r.answer}`)
          .join("\n\n")}\n\nCuando lo tengas listo, me cuentas qué te apetece y buscamos planes.`,
        activityIds: [],
        resource: true,
        resourceIds: practical.slice(0, 2).map((r) => r.id),
        learnedInterests,
        quickQuestions: quickResourceQuestions,
      };
  }
  if (
    /transporte|autobus|tranvia|salud|medic|tramite|biblioteca|empadron|servicio|mercado|centro civico/.test(
      context,
    ) &&
    resourceHits.length
  ) {
    return {
      text: `¡Vamos a resolverlo!${near}\n\n${resourceHits
        .slice(0, 2)
        .map((r) => `**${r.name}.** ${r.answer}`)
        .join(
          "\n\n",
        )}\n\nConsulta los requisitos, tarifas y horarios vigentes en los enlaces oficiales de abajo.`,
      activityIds: [],
      resource: true,
      resourceIds: resourceHits.slice(0, 2).map((r) => r.id),
      learnedInterests,
      quickQuestions: quickResourceQuestions,
    };
  }
  if (/primera semana|siete dias|7 dias|itinerario|adaptar.*plan|plan.*dias/.test(context)) {
    return {
      text: `¡Vamos a preparar tus primeros siete días!${near}${minutes !== undefined ? ` Lo adaptaré a ${minutes} minutos por propuesta.` : ""} Tengo en cuenta tus intereses, presupuesto y disponibilidad${slot}.\n\nEl plan combina pequeños descubrimientos, recursos prácticos y oportunidades de conexión. Si no hay una actividad que encaje, encontrarás una tarea práctica sin coste en lugar de una propuesta incompatible. Puedes cambiar cada día y marcar tus avances.`,
      activityIds: pool.slice(0, 2).map((a) => a.id),
      itinerary: true,
      preferences: effective,
      learnedInterests,
      quickQuestions: ["¿Qué hago este fin de semana?", "¿Hay actividades gratuitas?"],
    };
  }
  if (
    /la primera|el primero|mas sobre|cuentame sobre|como llego/.test(q) &&
    lastReply?.activityIds?.length
  ) {
    const a = activities.find((a) => a.id === lastReply.activityIds?.[0]);
    if (a)
      return {
        text: `**${a.name}** está en ${a.zone}. ${a.description}\n\n${a.minutes ? `Puedes dedicarle unos ${a.minutes} minutos como propuesta orientativa; no es un horario real.` : "La duración depende de la programación."} ${a.price === 0 ? "La propuesta no requiere gasto; no incluye compras ni consumiciones." : "Su precio no está confirmado: revísalo antes de decidir."}\n\n${disclaimer}`,
        activityIds: [a.id],
        learnedInterests,
        quickQuestions: ["Otra propuesta", "¿Qué más hay cerca de mi barrio?"],
      };
  }
  const social = /gente|nadie|amig|social|idioma|taller/.test(context);
  const outdoors = /deporte|correr|naturaleza|senderismo|aire libre/.test(context);
  if (social) pool = pool.filter((a) => a.group);
  if (outdoors)
    pool = pool.filter(
      (a) => a.outdoor || a.interest.includes("Naturaleza") || a.interest.includes("Deporte"),
    );
  if (/barrio|cerca|zona/.test(context) && p.neighborhood) {
    const nearby = pool.filter((a) => a.zone === p.neighborhood);
    if (nearby.length) pool = nearby;
  }
  if (/otra|otro|alternativa|no me convence|mas opciones/.test(q)) {
    const previousIds = new Set(history.flatMap((h) => h.activityIds ?? []));
    pool = pool.filter((a) => !previousIds.has(a.id));
  }
  if (!pool.length)
    return {
      text: `Aquí me pillas: no tengo una propuesta que cumpla tus preferencias${minutes !== undefined ? ` y el límite de ${minutes} minutos` : ""}, y prefiero no inventarme nada.${near} Puedes ampliar el presupuesto o el tiempo en tu perfil, o preguntar en tu centro cívico más cercano o en el 010 del Ayuntamiento, que te dirán qué se mueve por tu zona.`,
      activityIds: [],
      resource: true,
      resourceIds: ["civicos"],
      learnedInterests,
      quickQuestions: ["¿Hay actividades gratuitas?", "¿Dónde puedo conocer gente?"],
    };
  let opening = social
    ? "¡Pues vamos a ponerle remedio! 😊 Conocer personas haciendo algo que te gusta es un buen comienzo."
    : outdoors
      ? "¡Un poco de aire libre siempre sienta bien!"
      : free
        ? "¡Claro! Podemos descubrir Zaragoza sin gastar."
        : "¡Vamos a encontrar un plan para ti!";
  if (followup) opening = "¡Seguimos! He tenido en cuenta lo que acabamos de hablar.";
  const fit =
    minutes !== undefined
      ? `Caben en tus ${minutes} minutos${slot}.`
      : p.timeBudget
        ? `Respetan tu tiempo disponible (${p.timeBudget.toLocaleLowerCase("es")}).`
        : "";
  return {
    text: `${opening}${near}${learnedInterests.length ? ` También recordaré tu interés por ${learnedInterests.join(" y ").toLocaleLowerCase("es")}.` : ""}\n\n${fit ? `${fit} ` : ""}${disclaimer}`,
    activityIds: pool.slice(0, 2).map((a) => a.id),
    learnedInterests,
    quickQuestions: quickActivityQuestions,
  };
}
