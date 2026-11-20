import { useState } from "react";
import { ArrowUpRight, Check, Clock, Heart, MapPin, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/lib/language";
import { useCity } from "./city-provider";
import type { Activity } from "@/lib/city-logic";
export function ActivityCard({
  activity: a,
  compact = false,
  onDiscard,
}: {
  activity: Activity;
  compact?: boolean;
  onDiscard?: (() => void) | undefined;
}) {
  const [open, setOpen] = useState(false);
  const { state, toggleFavorite, markViewed, toggleCompleted } = useCity();
  const lang = useLanguage();
  const tr = (es: string, en: string) => (lang === "en" ? en : es);
  const saved = state.favorites.includes(a.id);
  return (
    <>
      <article className="activity-card">
        <div className="activity-photo">
          <img src={a.image} alt={a.name} loading="lazy" />
          <span className="photo-category">{a.category}</span>
          <Button
            size="icon"
            variant="favorite"
            className="absolute right-3 top-3 size-8"
            onClick={() => toggleFavorite(a.id)}
            title={saved ? tr("Quitar de favoritos", "Remove from favourites") : tr("Guardar en favoritos", "Save to favourites")}
            aria-label={`${saved ? "Quitar" : "Guardar"} ${a.name}`}
            aria-pressed={saved}
          >
            <Heart className={saved ? "fill-primary text-primary" : ""} />
          </Button>
        </div>
        <div className="activity-body">
          <h3>{a.name}</h3>
          {a.kind === "exploration" && (
            <span className="mt-1 block text-[10px] text-muted-foreground">
              {tr("Explorar recurso · no asistir a un evento", "Explore the resource · not an event")}
            </span>
          )}
          {!compact && <p className="mt-1 mb-3">{a.description}</p>}
          <span className="activity-meta mt-1">
            <MapPin size={12} />
            {a.zone}
          </span>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
            <span
              className={`text-[10px] font-semibold ${a.price === 0 ? "text-secondary-foreground" : "text-muted-foreground"}`}
            >
              {a.price === 0
                ? a.kind === "exploration"
                  ? tr("Consulta gratuita", "Free to visit")
                  : tr("Paseo gratuito", "Free walk")
                : tr("Precio: consultar", "Price: check")}
            </span>
            <Button
              variant="link"
              size="sm"
              className="h-auto px-0 py-0 text-[10px]"
              onClick={() => {
                markViewed(a.id);
                setOpen(true);
              }}
            >
              {tr("Ver actividad", "View activity")}
              <ArrowUpRight className="size-3" />
            </Button>
          </div>
          {!compact && (
            <span className="activity-meta mt-2">
              <Clock size={12} />
              {a.minutes ? `${tr("Propuesta", "Suggested")}: ${a.minutes} min` : a.duration}
            </span>
          )}
          {a.group && (
            <span className="mt-3 flex items-center gap-1 text-[10px] text-secondary-foreground">
              <Users size={12} />
              {tr("Ideal para conocer gente", "Great for meeting people")}
            </span>
          )}
          {onDiscard && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 px-0 text-xs"
              title="Descartar recomendación"
              onClick={onDiscard}
            >
              <X />
              {tr("No me encaja", "Not for me")}
            </Button>
          )}
        </div>
      </article>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-32px)] overflow-y-auto rounded-lg">
          <img src={a.image} alt={a.name} className="h-48 w-full rounded-md object-cover" />
          <span className="eyebrow text-primary">{a.category}</span>
          <DialogTitle className="leading-snug">{a.name}</DialogTitle>
          <DialogDescription>{a.description}</DialogDescription>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {a.zone}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {a.minutes ? `${tr("Duración sugerida", "Suggested length")}: ${a.minutes} min` : a.duration}
            </span>
            <span>{a.outdoor ? tr("Al aire libre", "Outdoors") : tr("Interior", "Indoors")}</span>
          </div>
          <p className="rounded-md bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Propuesta de demostración.</strong>{" "}
            {a.kind === "exploration"
              ? "La duración indica tiempo para explorar el recurso y la consulta es gratuita. No se confirma el precio ni la duración de la actividad final."
              : a.price === 0
                ? "El paseo por el espacio público no tiene coste; no incluye consumiciones ni actividades organizadas."
                : "Consulta el precio en la fuente oficial."}{" "}
            {a.group ? "No existe un grupo ni encuentro confirmado en este prototipo. " : ""}No se
            confirman horarios, fechas, plazas ni disponibilidad.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href={a.source} target="_blank" rel="noreferrer">
                {tr("Consultar fuente oficial", "Check official source")}
                <ArrowUpRight />
              </a>
            </Button>
            <Button variant="outline" onClick={() => toggleFavorite(a.id)}>
              <Heart className={saved ? "fill-primary text-primary" : ""} />
              {saved ? "Guardado" : "Guardar"}
            </Button>
            <Button
              variant={state.completedActivities.includes(a.id) ? "selected" : "outline"}
              onClick={() => toggleCompleted(a.id)}
              aria-pressed={state.completedActivities.includes(a.id)}
            >
              <Check />
              {state.completedActivities.includes(a.id) ? "Realizada" : "Marcar realizada"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
