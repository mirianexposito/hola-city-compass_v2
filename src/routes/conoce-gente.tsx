import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Dumbbell,
  GraduationCap,
  Landmark,
  Languages,
  Trees,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { activities, interests, budgets } from "@/lib/city-data";
import { filterActivities, emptyFilters, recommendActivities } from "@/lib/city-logic";
import { useCity } from "@/components/city-provider";
import { ActivityCard } from "@/components/activity-card";
import { pageHead } from "@/lib/metadata";
import { PublicShell } from "@/components/public-shell";
export const Route = createFileRoute("/conoce-gente")({
  ssr: false,
  head: () =>
    pageHead(
      "Conoce gente",
      "Encuentra espacios culturales, talleres, deporte y comunidades para empezar a conectar con personas en Zaragoza.",
    ),
  component: PeoplePage,
});
const ideas = [
  {
    icon: GraduationCap,
    name: "Crear algo juntos",
    text: "Explora talleres y propuestas creativas en centros cívicos.",
    url: "https://www.zaragoza.es/sede/portal/centros-civicos/",
  },
  {
    icon: Dumbbell,
    name: "Compartir movimiento",
    text: "Consulta las actividades deportivas municipales y sus grupos.",
    url: "https://www.zaragoza.es/sede/portal/deporte/",
  },
  {
    icon: Trees,
    name: "Salir a la naturaleza",
    text: "Busca clubes y actividades de montaña en la federación aragonesa.",
    url: "https://www.fam.es/",
  },
  {
    icon: Languages,
    name: "Intercambiar idiomas",
    text: "Revisa la programación de bibliotecas y centros cívicos.",
    url: "https://www.zaragoza.es/sede/portal/bibliotecas/",
  },
  {
    icon: Landmark,
    name: "Encontrarse con la cultura",
    text: "Una exposición o una actividad cultural puede ser el primer paso.",
    url: "https://www.zaragoza.es/sede/portal/cultura/",
  },
  {
    icon: Users,
    name: "Formar parte del barrio",
    text: "Descubre asociaciones y espacios de participación local.",
    url: "https://www.zaragoza.es/sede/portal/participacion/",
  },
];
function People() {
  const { state, discardActivity } = useCity();
  const [interest, setInterest] = useState("");
  const [price, setPrice] = useState("");
  const [setting, setSetting] = useState("");
  const [personal, setPersonal] = useState(true);
  const pool = personal
    ? recommendActivities(activities, state.preferences, state)
    : activities.filter((a) => !state.discarded.includes(a.id));
  const rows = filterActivities(pool, {
    ...emptyFilters,
    interest,
    price,
    setting,
    groupOnly: true,
  });
  return (
    <div className="page-width fade-in pb-12">
      <header className="page-heading">
        <span className="eyebrow text-primary">LAS PERSONAS TAMBIÉN SON TU CIUDAD</span>
        <h1 className="mt-3">
          Nuevos lugares. Nuevas conexiones<span className="text-primary">.</span>
        </h1>
        <p>Encuentra espacios donde compartir lo que te gusta.</p>
      </header>
      <div className="community-quote border-t border-border">
        «Las mejores formas de conocer una ciudad son también las personas con las que la
        compartes».
      </div>
      <div className="resource-grid">
        {ideas.map((x, i) => (
          <article key={x.name} className="resource-card">
            <span className={`icon-tile ${i % 2 ? "sage" : ""}`}>
              <x.icon size={22} />
            </span>
            <h2 className="mt-5 text-lg font-bold">{x.name}</h2>
            <p className="mt-2 mb-4 text-sm leading-relaxed text-muted-foreground">{x.text}</p>
            <Button asChild variant="link" className="px-0 text-xs">
              <a href={x.url} target="_blank" rel="noreferrer">
                Consultar propuestas
                <ArrowUpRight />
              </a>
            </Button>
          </article>
        ))}
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        No hay grupos ni encuentros confirmados en esta demo. Consulta la programación y condiciones
        de cada entidad.
      </p>
      <div className="mt-10 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">Una excusa para dar el primer paso</h2>
        <Button asChild variant="link" className="px-0 text-xs">
          <Link to="/compañero" search={{ pregunta: "Acabo de llegar y quiero conocer gente" }}>
            Pedir ideas a Pilar
            <ArrowUpRight />
          </Link>
        </Button>
      </div>
      <div className="social-filters">
        <label>
          <span className="filter-label">Interés</span>
          <select
            className="form-field"
            aria-label="Interés"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
          >
            <option value="">Todos los intereses</option>
            {interests.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="filter-label">Presupuesto social</span>
          <select
            aria-label="Presupuesto social"
            className="form-field"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          >
            <option value="">Cualquiera</option>
            {budgets.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="filter-label">Entorno social</span>
          <select
            className="form-field"
            aria-label="Entorno social"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
          >
            <option value="">Todos</option>
            <option>Interior</option>
            <option>Exterior</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={personal}
            onChange={(e) => setPersonal(e.target.checked)}
          />
          Según mi perfil
        </label>
      </div>
      <div className="activity-grid">
        {rows.map((a) => (
          <ActivityCard key={a.id} activity={a} onDiscard={() => discardActivity(a.id)} />
        ))}
      </div>
      {!rows.length && (
        <p className="empty-state text-sm text-muted-foreground">
          Aún no hay propuestas que encajen. Prueba otros filtros o desactiva «Según mi perfil».
        </p>
      )}
    </div>
  );
}

function PeoplePage() {
  return (
    <PublicShell>
      <People />
    </PublicShell>
  );
}
