import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Compass,
  Info,
  MapPin,
  SlidersHorizontal,
  Users,
  RefreshCw,
} from "lucide-react";
import { useCity } from "@/components/city-provider";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { AssistantPanel } from "@/components/assistant-panel";
import { WeekSection } from "@/components/week-section";
import { activities } from "@/lib/city-data";
import { recommendActivities, recommendationReason } from "@/lib/city-logic";
import { pageHead } from "@/lib/metadata";
import { PublicShell } from "@/components/public-shell";
import { WeatherSection } from "@/components/weather-section";
import { weatherQueryOptions } from "@/lib/weather-query";
export const Route = createFileRoute("/mi-zaragoza")({
  ssr: false,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(weatherQueryOptions());
  },
  head: () =>
    pageHead(
      "Mi Zaragoza",
      "Descubre tu barrio, consulta el tiempo de Zaragoza y organiza tu primera semana con las preferencias privadas de tu cuenta.",
    ),
  component: MiZaragozaPage,
});
function Dashboard() {
  const { state, discardActivity, nextRecommendations, restoreDiscarded } = useCity();
  const p = state.preferences;
  const recommended = recommendActivities(activities, p, state);
  return (
    <div className="fade-in">
      <div className="page-width">
        <header className="page-heading">
          <span className="eyebrow text-primary">YA ESTÁS UN POCO MÁS CERCA DE CASA</span>
          <h1 className="mt-3">
            ¡Hola! Bienvenido/a a Zaragoza<span className="text-primary">.</span>
          </h1>
          <p>Vamos a encontrar tu sitio en la ciudad.</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {[p.neighborhood, ...p.interests, p.budget, ...p.availability, p.timeBudget]
              .filter(Boolean)
              .map((x) => (
                <span
                  className="rounded-md bg-secondary px-3 py-1.5 text-[11px] text-secondary-foreground"
                  key={x}
                >
                  {x}
                </span>
              ))}
            <Button variant="link" asChild className="px-0 text-xs">
              <Link to="/onboarding">
                <SlidersHorizontal />
                {state.completed ? "Editar preferencias" : "Personalizar mi Zaragoza"}
              </Link>
            </Button>
          </div>
        </header>
        <div className="grid grid-cols-2 gap-3 border-b border-border pb-7 md:grid-cols-4">
          {[
            { to: "/planes", icon: MapPin, title: "Descubre tu barrio" },
            { to: "/planes", icon: Compass, title: "Planes para mí" },
            { to: "/conoce-gente", icon: Users, title: "Conoce gente" },
            { to: "/informacion", icon: Info, title: "Información útil" },
          ].map((q, i) => (
            <Button key={i} asChild variant="choice" size="option">
              <Link
                to={q.to}
                search={q.to === "/planes" ? { zona: i === 0 ? p.neighborhood : undefined } : {}}
              >
                <q.icon className="text-primary" />
                <span>{q.title}</span>
                <ArrowRight className="ml-auto" />
              </Link>
            </Button>
          ))}
        </div>
        <WeatherSection />
        <div className="home-content">
          <section>
            <h2 className="section-title">Tu ciudad, a tu manera</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={nextRecommendations}>
                <RefreshCw />
                Otras propuestas
              </Button>
              {state.discarded.length > 0 && (
                <Button variant="ghost" size="sm" onClick={restoreDiscarded}>
                  Recuperar descartados ({state.discarded.length})
                </Button>
              )}
            </div>
            <p className="mt-2 mb-6 text-xs text-muted-foreground">
              {state.completed
                ? "Una primera selección según tus intereses y presupuesto."
                : "Empieza por estos rincones o cuéntanos lo que te gusta."}
            </p>
            {recommended.length ? (
              <div className="activity-grid">
                {recommended.slice(0, 3).map((a) => (
                  <div key={a.id}>
                    <p className="mb-2 text-[10px] text-secondary-foreground">
                      {recommendationReason(a, p, state)}
                    </p>
                    <ActivityCard activity={a} onDiscard={() => discardActivity(a.id)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No hay propuestas con precio confirmado para este presupuesto.</p>
                <Button asChild variant="link">
                  <Link to="/planes">Explorar todos los planes</Link>
                </Button>
              </div>
            )}
          </section>
          <AssistantPanel />
        </div>
      </div>
      <WeekSection />
    </div>
  );
}

function MiZaragozaPage() {
  return (
    <PublicShell>
      <Dashboard />
    </PublicShell>
  );
}
