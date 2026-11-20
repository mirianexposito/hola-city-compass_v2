import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Heart, RefreshCw, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { useCity } from "@/components/city-provider";
import { activities, resources } from "@/lib/city-data";
import { alternateDay, createItinerary } from "@/lib/itinerary";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/primeros-dias")({
  head: () =>
    pageHead(
      "Mis primeros siete días",
      "Tu plan personalizado de siete días en Zaragoza: descubrimientos, recursos prácticos y oportunidades para conectar a tu ritmo.",
    ),
  component: FirstDays,
});
function FirstDays() {
  const { state, ready, setItinerary, toggleDay, toggleFavorite } = useCity();
  const plan = state.itinerary;
  const done = plan.filter((d) => d.done).length;
  return (
    <div className="page-width fade-in pb-12">
      <header className="page-heading">
        <span className="eyebrow text-primary">UN PEQUEÑO PASO CADA DÍA</span>
        <h1 className="mt-3">
          Mis primeros siete días<span className="text-primary">.</span>
        </h1>
        <p>
          {state.preferences.neighborhood
            ? `Desde ${state.preferences.neighborhood}, a tu ritmo.`
            : "Un primer recorrido para empezar a sentirte en casa."}{" "}
          {state.preferences.timeBudget &&
            `Propuestas de ${state.preferences.timeBudget.toLocaleLowerCase("es")}.`}
        </p>
      </header>
      <div className="plan-toolbar">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() =>
              setItinerary(createItinerary(activities, resources, state.preferences, state, plan))
            }
            disabled={!ready}
          >
            <RefreshCw />
            {plan.length ? "Actualizar con mi perfil" : "Generar mis siete días"}
          </Button>
          <Button asChild variant="outline">
            <Link
              to="/compañero"
              search={{ pregunta: "Adapta mi itinerario de siete días a mis preferencias" }}
            >
              Adaptar con Pilar
              <ArrowRight />
            </Link>
          </Button>
        </div>
        {plan.length > 0 && (
          <span className="text-sm text-secondary-foreground">
            <Check size={16} className="mr-1 inline" />
            {done} de 7 días realizados
          </span>
        )}
      </div>
      {plan.length === 0 ? (
        <section className="plan-empty">
          <CalendarDays className="mb-5 size-10 text-sage" />
          <h2 className="section-title">Tu primera semana, sin prisas</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Un nuevo rincón, tus recursos de referencia y una oportunidad para conectar. Cada día es
            una propuesta, no una reserva.
          </p>
          <Button asChild variant="link" className="mt-4 px-0">
            <Link to="/onboarding">
              {state.completed ? "Revisar mis preferencias" : "Personalizar mi perfil"}
            </Link>
          </Button>
        </section>
      ) : (
        <div className="days-grid">
          {plan.map((d) => {
            const a = activities.find((a) => a.id === d.activityId);
            const r = resources.find((r) => r.id === d.resourceId);
            return (
              <section className="day-section" key={d.day}>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="day-label">Día {String(d.day).padStart(2, "0")}</span>
                  <Button
                    variant={d.done ? "selected" : "outline"}
                    size="sm"
                    aria-pressed={d.done}
                    aria-label={`${d.done ? "Desmarcar" : "Completar"} día ${d.day}`}
                    onClick={() => toggleDay(d.day)}
                  >
                    <Check />
                    {d.done ? "Realizado" : "Completar"}
                  </Button>
                </div>
                {a ? (
                  <ActivityCard activity={a} />
                ) : (
                  <article className="resource-card">
                    <span className="icon-tile sage">
                      <MapPin size={22} />
                    </span>
                    <span className="eyebrow mt-4 block text-primary">TU VIDA EN EL BARRIO</span>
                    <h2 className="mt-2 text-lg font-bold">{r?.name ?? d.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {r?.description ?? "Explora tu entorno con calma."}
                    </p>
                    <p className="mt-3 text-xs text-secondary-foreground">
                      Consulta gratuita · A tu ritmo
                    </p>
                    {r && (
                      <Button asChild variant="link" className="mt-4 px-0">
                        <a href={r.url} target="_blank" rel="noreferrer">
                          Consultar recurso
                          <ArrowRight />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => toggleFavorite(`resource:${r?.id ?? d.day}`)}
                      aria-pressed={state.favorites.includes(`resource:${r?.id ?? d.day}`)}
                    >
                      <Heart
                        className={
                          state.favorites.includes(`resource:${r?.id ?? d.day}`)
                            ? "fill-primary text-primary"
                            : ""
                        }
                      />
                      {state.favorites.includes(`resource:${r?.id ?? d.day}`)
                        ? "Recurso guardado"
                        : "Guardar recurso"}
                    </Button>
                  </article>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 px-0"
                  disabled={d.done}
                  onClick={() =>
                    setItinerary(
                      alternateDay(plan, d.day, activities, resources, state.preferences, state),
                    )
                  }
                >
                  <RefreshCw />
                  Otra propuesta para el día {d.day}
                </Button>
              </section>
            );
          })}
        </div>
      )}
      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Plan de demostración sin fechas ni reservas. Los tiempos son sugeridos; las exploraciones de
        recursos no equivalen a una actividad confirmada. Al actualizar se conservan tus días
        realizados.
      </p>
    </div>
  );
}
