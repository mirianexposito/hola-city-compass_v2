import zaragoza from "@/assets/zaragoza.jpg.asset.json";
import casco from "@/assets/casco.jpg.asset.json";
import parque from "@/assets/parque.jpg.asset.json";
import gancho from "@/assets/gancho.jpg.asset.json";
import historias from "@/assets/historias.jpg.asset.json";
import type { Activity, Resource } from "./city-logic";
export const cityImage = zaragoza.url;
export const interests = [
  "Cultura y museos",
  "Gastronomía y cafeterías",
  "Deporte y actividades al aire libre",
  "Naturaleza y excursiones",
  "Música y conciertos",
  "Ocio y vida social",
  "Talleres y aprendizaje",
  "Mercados y comercio local",
] as const;
// Municipal districts and rural neighborhoods: Zaragoza INSPIRE AU catalog 6042.
// Include familiar neighborhood names within districts so residents need not type a zone.
export const urbanNeighborhoods = [
  "Actur",
  "Actur-Rey Fernando",
  "Arcosur",
  "Barrio de Jesús",
  "Casablanca",
  "Casco Histórico",
  "Centro",
  "Ciudad Jardín",
  "Ciudad Universitaria",
  "Cogullada",
  "Delicias",
  "Distrito Sur",
  "El Arrabal",
  "El Gancho",
  "El Portillo",
  "El Rabal",
  "El Tubo",
  "El Zorongo",
  "La Almozara",
  "La Bombarda",
  "La Bozada",
  "La Jota",
  "La Magdalena",
  "La Paz",
  "La Romareda",
  "Las Fuentes",
  "Miralbueno",
  "Miraflores",
  "Monsalud",
  "Montecanal",
  "Montemolín",
  "Oliver",
  "Oliver-Valdefierro",
  "Parque Goya",
  "Parque Roma",
  "Parque Venecia",
  "Picarral",
  "Pinares de Venecia",
  "Puerto Venecia",
  "Quinta Julieta",
  "Ranillas",
  "Rosales del Canal",
  "Ruiseñores",
  "San Agustín",
  "San Antonio",
  "San José",
  "San Miguel",
  "San Pablo",
  "Santa Isabel",
  "Tenerías",
  "Torrero",
  "Torrero-La Paz",
  "Torre Ramona-Príncipe Felipe",
  "Torres de San Lamberto",
  "Universidad",
  "Vadorrey",
  "Valdefierro",
  "Valdespartera",
  "Zalfonada",
];
export const ruralNeighborhoods = [
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
];
export const neighborhoods = [...urbanNeighborhoods, ...ruralNeighborhoods];
export const budgets = ["Gratuito", "Bajo (menos de 15 €)", "Medio (15-40 €)", "Flexible"];
const initialActivities: Activity[] = [
  {
    id: "ebro",
    name: "Un paseo junto al Ebro",
    description: "Baja el ritmo y descubre la ciudad desde su ribera.",
    category: "Naturaleza",
    interest: interests[3],
    zone: "Centro",
    price: 0,
    duration: "A tu ritmo",
    group: false,
    outdoor: true,
    image: zaragoza.url,
    source: "https://www.zaragoza.es/sede/portal/turismo/",
  },
  {
    id: "casco",
    name: "Piérdete por el Casco Histórico",
    description: "Plazas, callejuelas y rincones con mucho que contar.",
    category: "Barrio",
    interest: interests[0],
    zone: "Casco Histórico",
    price: 0,
    duration: "A tu ritmo",
    group: false,
    outdoor: true,
    image: casco.url,
    source: "https://www.zaragoza.es/sede/portal/turismo/post/casco-historico",
  },
  {
    id: "parque",
    name: "Respira en el Parque Grande",
    description: "Tu próxima pausa verde, entre fuentes y paseos.",
    category: "Aire libre",
    interest: interests[2],
    zone: "Universidad",
    price: 0,
    duration: "A tu ritmo",
    group: false,
    outdoor: true,
    image: parque.url,
    source: "https://www.zaragoza.es/sede/portal/turismo/post/parque-grande-jose-antonio-labordeta",
  },
  {
    id: "historias",
    name: "Una visita al Centro de Historias",
    description: "Una puerta a la cultura y a otras miradas sobre la ciudad.",
    category: "Cultura",
    interest: interests[0],
    zone: "Casco Histórico",
    price: null,
    duration: "Consultar visita",
    group: false,
    outdoor: false,
    image: historias.url,
    source: "https://www.zaragoza.es/sede/portal/turismo/post/centro-de-historias",
  },
  {
    id: "gancho",
    name: "Descubre la vida de El Gancho",
    description: "Calles con identidad y pequeños comercios de barrio.",
    category: "Barrio",
    interest: interests[7],
    zone: "El Gancho",
    price: 0,
    duration: "A tu ritmo",
    group: false,
    outdoor: true,
    image: gancho.url,
    source: "https://www.zaragoza.es/sede/portal/turismo/post/el-gancho",
  },
  {
    id: "taller",
    name: "Encuentra tu próximo taller",
    description: "Consulta propuestas creativas en los centros cívicos.",
    category: "Talleres",
    interest: interests[6],
    zone: "Delicias",
    price: null,
    duration: "Según actividad",
    group: true,
    outdoor: false,
    image: historias.url,
    source: "https://www.zaragoza.es/sede/portal/centros-civicos/",
  },
  {
    id: "paseo-social",
    name: "Un paseo para compartir",
    description: "Una idea para conversar mientras descubres zonas verdes.",
    category: "Aire libre",
    interest: interests[5],
    zone: "Universidad",
    price: 0,
    duration: "A tu ritmo",
    group: true,
    outdoor: true,
    image: parque.url,
    source: "https://www.zaragoza.es/sede/portal/deporte/",
  },
  {
    id: "cafe",
    name: "Una pausa en el Casco",
    description: "Explora cafeterías y encuentra tu rincón de todos los días.",
    category: "Gastronomía",
    interest: interests[1],
    zone: "Casco Histórico",
    price: null,
    duration: "A tu ritmo",
    group: false,
    outdoor: false,
    image: gancho.url,
    source: "https://www.zaragoza.es/sede/portal/turismo/gastronomia/",
  },
];
const initialResources = [
  {
    name: "Moverte por Zaragoza",
    category: "Transporte",
    description: "Autobuses urbanos, tranvía y opciones para tus desplazamientos.",
    url: "https://www.zaragoza.es/sede/portal/movilidad/",
    label: "Movilidad municipal",
  },
  {
    name: "Tu centro de salud",
    category: "Salud",
    description: "Información sobre centros sanitarios y acceso a la atención primaria.",
    url: "https://www.saludinforma.es/",
    label: "Salud Informa Aragón",
  },
  {
    name: "Bibliotecas municipales",
    category: "Bibliotecas",
    description: "Encuentra tu biblioteca y consulta sus servicios y programación.",
    url: "https://www.zaragoza.es/sede/portal/bibliotecas/",
    label: "Red de bibliotecas",
  },
  {
    name: "Tu centro cívico",
    category: "Comunidad",
    description: "Espacios de barrio donde explorar talleres y actividades culturales.",
    url: "https://www.zaragoza.es/sede/portal/centros-civicos/",
    label: "Centros cívicos",
  },
  {
    name: "Deporte cerca de ti",
    category: "Deporte",
    description: "Instalaciones municipales, actividades y servicios deportivos.",
    url: "https://www.zaragoza.es/sede/portal/deporte/",
    label: "Deporte municipal",
  },
  {
    name: "Trámites sin dar vueltas",
    category: "Trámites",
    description: "Padrón, gestiones y servicios para empezar tu nueva etapa.",
    url: "https://www.zaragoza.es/sede/",
    label: "Sede del Ayuntamiento",
  },
  {
    name: "Mercados y comercio local",
    category: "Comercio",
    description: "Recursos para descubrir el comercio y los mercados de la ciudad.",
    url: "https://www.zaragoza.es/sede/portal/comercio/",
    label: "Comercio municipal",
  },
  {
    name: "Conoce los barrios",
    category: "Barrios",
    description: "Distritos, juntas de barrio e información de tu entorno.",
    url: "https://www.zaragoza.es/sede/portal/participacion/",
    label: "Participación ciudadana",
  },
  {
    name: "El tranvía de Zaragoza",
    category: "Transporte",
    description: "Consulta las paradas, tarifas y avisos del operador.",
    url: "https://www.tranviasdezaragoza.es/",
    label: "Tranvías de Zaragoza",
  },
];

export const desiredActivities = [
  "Pasear y descubrir barrios",
  "Visitar museos",
  "Practicar deporte",
  "Hacer senderismo",
  "Participar en talleres",
  "Intercambiar idiomas",
  "Disfrutar de la música",
  "Explorar mercados y cafeterías",
];
export const availabilitySlots = ["Mañanas", "Tardes", "Noches", "Fines de semana"];
export const timeBudgets = ["Hasta 1 hora", "Hasta 2 horas", "Sin límite"];
const metadata: Record<string, { minutes: number; timeSlots: string[]; tags: string[] }> = {
  ebro: { minutes: 60, timeSlots: availabilitySlots, tags: [desiredActivities[0] ?? ""] },
  casco: { minutes: 90, timeSlots: availabilitySlots, tags: [desiredActivities[0] ?? ""] },
  parque: {
    minutes: 60,
    timeSlots: availabilitySlots,
    tags: [desiredActivities[2] ?? "", desiredActivities[3] ?? ""],
  },
  historias: { minutes: 90, timeSlots: [], tags: [desiredActivities[1] ?? ""] },
  gancho: {
    minutes: 45,
    timeSlots: availabilitySlots,
    tags: [desiredActivities[0] ?? "", desiredActivities[7] ?? ""],
  },
  taller: { minutes: 30, timeSlots: availabilitySlots, tags: [desiredActivities[4] ?? ""] },
  "paseo-social": { minutes: 60, timeSlots: availabilitySlots, tags: [desiredActivities[0] ?? ""] },
  cafe: { minutes: 45, timeSlots: [], tags: [desiredActivities[7] ?? ""] },
};
export const activities: Activity[] = initialActivities.map((a) => ({
  ...a,
  ...metadata[a.id],
  kind: a.id === "taller" ? "exploration" : "visit",
}));
const suggestions: Array<{
  id: string;
  name: string;
  description: string;
  category: string;
  interest: string;
  zone: string;
  source: string;
  tags: string[];
}> = [
  {
    id: "idiomas",
    name: "Explora intercambios de idiomas",
    description: "Busca programación de idiomas en bibliotecas y centros cívicos.",
    category: "Aprendizaje",
    interest: interests[6],
    zone: "Centro",
    source: "https://www.zaragoza.es/sede/portal/bibliotecas/",
    tags: ["Intercambiar idiomas"],
  },
  {
    id: "senderismo",
    name: "Encuentra una comunidad de senderismo",
    description: "Explora clubes aragoneses de montaña y sus condiciones de participación.",
    category: "Naturaleza",
    interest: interests[3],
    zone: "Zaragoza y entorno",
    source: "https://www.fam.es/",
    tags: ["Hacer senderismo"],
  },
  {
    id: "deporte-grupal",
    name: "Descubre el deporte en compañía",
    description: "Consulta propuestas y condiciones de las instalaciones deportivas municipales.",
    category: "Deporte",
    interest: interests[2],
    zone: "Universidad",
    source: "https://www.zaragoza.es/sede/portal/deporte/",
    tags: ["Practicar deporte"],
  },
  {
    id: "encuentro-cultural",
    name: "Busca una actividad cultural compartida",
    description: "Revisa la agenda cultural y elige una propuesta que te interese.",
    category: "Cultura",
    interest: interests[0],
    zone: "Casco Histórico",
    source: "https://www.zaragoza.es/sede/portal/cultura/",
    tags: ["Visitar museos"],
  },
  {
    id: "musica",
    name: "Explora la música de la ciudad",
    description: "Consulta la programación cultural para descubrir música y conciertos.",
    category: "Ocio",
    interest: interests[4],
    zone: "Centro",
    source: "https://www.zaragoza.es/sede/portal/cultura/",
    tags: ["Disfrutar de la música"],
  },
  {
    id: "comunidad",
    name: "Acércate a la vida de tu barrio",
    description: "Explora asociaciones y espacios municipales de participación.",
    category: "Actividades sociales",
    interest: interests[5],
    zone: "El Gancho",
    source: "https://www.zaragoza.es/sede/portal/participacion/",
    tags: ["Participar en talleres"],
  },
  {
    id: "servicios",
    name: "Localiza tus servicios de referencia",
    description: "Dedica un rato a encontrar recursos oficiales para instalarte.",
    category: "Servicios prácticos",
    interest: interests[7],
    zone: "Centro",
    source: "https://www.zaragoza.es/sede/",
    tags: ["Pasear y descubrir barrios"],
  },
];
activities.push(
  ...suggestions.map((a) => ({
    ...a,
    price: 0,
    duration: "30 min para explorar recursos",
    minutes: 30,
    timeSlots: availabilitySlots,
    group: a.id !== "servicios",
    outdoor: false,
    kind: "exploration" as const,
    image:
      a.id === "senderismo" || a.id === "deporte-grupal"
        ? parque.url
        : a.id === "comunidad"
          ? gancho.url
          : historias.url,
  })),
);
const resourceDetails: Array<{ id: string; keywords: string[]; answer: string }> = [
  {
    id: "movilidad",
    keywords: ["transporte", "autobus", "moverme", "movilidad"],
    answer:
      "El Ayuntamiento reúne opciones de movilidad y enlaces a operadores. Consulta rutas y avisos para tu desplazamiento; no puedo confirmar tiempos ni tarifas.",
  },
  {
    id: "salud",
    keywords: ["salud", "medico", "sanitari", "tarjeta sanitaria"],
    answer:
      "Salud Informa Aragón permite consultar servicios sanitarios. Revisa el centro que te corresponde y los requisitos de tarjeta sanitaria en su información oficial.",
  },
  {
    id: "bibliotecas",
    keywords: ["biblioteca", "leer", "libros"],
    answer:
      "La red municipal publica sus bibliotecas, servicios y programación. Consulta allí cómo hacerte el carné y las condiciones de préstamo.",
  },
  {
    id: "civicos",
    keywords: ["centro civico", "taller", "idioma"],
    answer:
      "Los centros cívicos son espacios de barrio con propuestas culturales y comunitarias. Consulta la programación y las condiciones de inscripción de tu centro.",
  },
  {
    id: "deporte",
    keywords: ["deporte", "piscina", "gimnasio"],
    answer:
      "El portal municipal de deporte reúne instalaciones y servicios. Comprueba la actividad, el precio y la inscripción antes de acudir.",
  },
  {
    id: "tramites",
    keywords: ["tramite", "empadron", "padron"],
    answer:
      "La sede municipal es el punto de consulta para el padrón y otros trámites. Revisa la documentación y la necesidad de cita en la ficha vigente del trámite.",
  },
  {
    id: "comercio",
    keywords: ["mercado", "comercio"],
    answer:
      "El portal municipal de comercio ofrece información sobre el comercio local. Usa la fuente oficial para identificar mercados y servicios.",
  },
  {
    id: "barrios",
    keywords: ["barrio", "distrito"],
    answer:
      "Participación ciudadana ofrece información de los distritos y juntas de barrio. Puedes identificar tu junta y sus recursos de proximidad.",
  },
  {
    id: "tranvia",
    keywords: ["tranvia"],
    answer:
      "El operador del tranvía publica paradas, tarifas y avisos. Confirma allí el recorrido y el estado del servicio antes de viajar.",
  },
];
export const resources: Resource[] = initialResources.map((r, i) => ({
  ...r,
  ...(resourceDetails[i] ?? { id: String(i), keywords: [], answer: r.description }),
}));
