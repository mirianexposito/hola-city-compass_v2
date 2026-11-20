import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/lib/language";
import { useCity } from "./city-provider";
import { activities } from "@/lib/city-data";
import { recommendActivities } from "@/lib/city-logic";
export function WeekSection() {
  const { state } = useCity();
  const lang = useLanguage();
  const tr = (es: string, en: string) => (lang === "en" ? en : es);
  const recommended = recommendActivities(activities, state.preferences, state);
  const steps = [
    {
      title: state.preferences.neighborhood
        ? lang === "en" ? `Find your place in ${state.preferences.neighborhood}` : `Encuentra tu sitio en ${state.preferences.neighborhood}`
        : tr("Empieza por tu barrio", "Start with your neighbourhood"),
      text: tr("Un paseo, un café y tus primeros lugares de referencia.", "A walk, a coffee and your first familiar places."),
    },
    {
      title: recommended[0]?.name || tr("Descubre un nuevo rincón", "Discover a new corner"),
      text: tr("Sal de la rutina y deja que la ciudad te sorprenda.", "Break the routine and let the city surprise you."),
    },
    {
      title: state.preferences.goals.includes("Conocer gente")
        ? tr("Da el primer paso para conectar", "Take the first step to connect")
        : tr("Haz algo que te guste", "Do something you enjoy"),
      text: tr("Consulta talleres y actividades de tu centro cívico.", "Check workshops and activities at your civic centre."),
    },
  ];
  return (
    <section className="week-band">
      <div className="page-width">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="eyebrow mb-2 flex items-center gap-1 text-primary">
              <Sparkles size={12} />
              {tr("Poco a poco, a tu ritmo", "Step by step, at your pace")}
            </span>
            <h2 className="section-title">{tr("Tu primera semana en Zaragoza", "Your first week in Zaragoza")}</h2>
          </div>
          <Button asChild variant="link" className="px-0 text-xs">
            <Link to="/primeros-dias">
              {state.itinerary.length ? tr("Ver mis siete días", "See my seven days") : tr("Crear mi itinerario", "Create my itinerary")}
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <div className="week-grid">
          {steps.map((s, i) => (
            <div className="week-item" key={i}>
              <span className="week-number">0{i + 1}</span>
              <div>
                <span className="eyebrow text-muted-foreground">
                  {tr("Días", "Days")} {i * 2 + 1}–{i === 2 ? 7 : i * 2 + 2}
                </span>
                <h3 className="mt-1 mb-1 text-sm font-bold">{s.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
