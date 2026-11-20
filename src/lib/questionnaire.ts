import {
  availabilitySlots,
  budgets,
  desiredActivities,
  interests,
  neighborhoods,
} from "./city-data";

export const goalOptions = [
  "Conocer gente",
  "Descubrir la ciudad",
  "Encontrar actividades y aficiones",
  "Sentirme más integrado/a",
  "Conocer servicios y recursos útiles",
];

export const ageRanges = [
  "18–24",
  "25–34",
  "35–44",
  "45–54",
  "55–64",
  "65 o más",
  "Prefiero no decirlo",
];

export const questionnaireSteps = [
  {
    key: "origin",
    title: "¿De dónde vienes?",
    subtitle: "Cada nueva etapa tiene su punto de partida.",
    options: ["Otra ciudad de España", "Otro país", "Prefiero no decirlo"],
  },
  {
    key: "arrival",
    title: "¿Cuánto tiempo llevas en Zaragoza?",
    subtitle: "Sea tu primer día o tu sexto mes, estamos contigo.",
    options: ["Acabo de llegar", "Menos de un mes", "Entre uno y seis meses", "Más de seis meses"],
  },
  {
    key: "neighborhood",
    title: "¿En qué zona vives?",
    subtitle: "Empecemos por lo que tienes cerca.",
    options: neighborhoods,
  },
  {
    key: "interests",
    title: "¿Qué te gusta hacer?",
    subtitle: "Elige todas las cosas que te hacen disfrutar.",
    options: interests,
  },
  {
    key: "goals",
    title: "¿Qué buscas en esta nueva etapa?",
    subtitle: "Puedes elegir más de una. Aquí no hay respuestas incorrectas.",
    options: goalOptions,
  },
  {
    key: "desiredActivities",
    title: "¿Qué actividades te apetecen?",
    subtitle: "Un paseo, una afición o un nuevo aprendizaje.",
    options: desiredActivities,
  },
  {
    key: "budget",
    title: "¿Qué presupuesto tienes para tus planes?",
    subtitle: "Los mejores descubrimientos no siempre cuestan dinero.",
    options: budgets,
  },
  {
    key: "company",
    title: "¿Cómo prefieres disfrutar de la ciudad?",
    subtitle: "Hay un Zaragoza para cada manera de vivirlo.",
    options: [
      "Por mi cuenta",
      "En pareja",
      "Con otras personas",
      "Me gustaría conocer gente nueva",
    ],
  },
  {
    key: "availability",
    title: "¿Cuándo tienes tiempo para ti?",
    subtitle: "Elige todos los momentos que te encajen.",
    options: availabilitySlots,
  },
  {
    key: "ageRange",
    title: "¿Qué edad tienes?",
    subtitle: "Solo una franja, para proponerte planes que encajen contigo.",
    options: ageRanges,
  },
] as const;

export function customAnswers(values: readonly string[], options: readonly string[]) {
  return values.filter((value) => !options.includes(value));
}

export function withCustomAnswer(
  values: readonly string[],
  options: readonly string[],
  text: string,
) {
  const selected = values.filter((value) => options.includes(value));
  const answer = text.trim();
  return [...new Set(answer ? [...selected, answer] : selected)];
}
