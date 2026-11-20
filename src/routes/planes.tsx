import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { useCity } from "@/components/city-provider";
import { activities, budgets, resources } from "@/lib/city-data";
import {
  emptyFilters,
  filterActivities,
  recommendActivities,
  type Filters,
} from "@/lib/city-logic";
import { pageHead } from "@/lib/metadata";
import { PublicShell } from "@/components/public-shell";
export const Route = createFileRoute("/planes")({
  ssr: false,
  validateSearch: (
    search: Record<string, unknown>,
  ): { guardados?: boolean; zona?: string | undefined } => ({
    guardados: search["guardados"] === true || search["guardados"] === "true",
    zona: typeof search["zona"] === "string" ? search["zona"] : undefined,
  }),
  head: () =>
    pageHead(
      "Descubre planes",
      "Explora planes de Zaragoza por barrio, categoría, presupuesto y compañía. Guarda tus favoritos y descubre nuevos rincones.",
    ),
  component: PlansPage,
});
function Plans() {
  const { state, toggleFavorite } = useCity();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [personal, setPersonal] = useState(false);
  const actual = {
    ...filters,
    zone: filters.zone || search.zona || "",
    favoritesOnly: search.guardados ?? false,
  };
  const pool = personal ? recommendActivities(activities, state.preferences, state) : activities;
  const rows = filterActivities(pool, actual, state.favorites);
  const savedResources = search.guardados
    ? resources.filter((r) => state.favorites.includes(`resource:${r.id}`))
    : [];
  const change = (key: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    if (key === "zone" && search.zona)
      void navigate({ to: "/planes", search: { ...search, zona: undefined }, replace: true });
  };
  return (
    <div className="page-width fade-in pb-12">
      <header className="page-heading">
        <span className="eyebrow text-primary">LA CIUDAD ESTÁ LLENA DE POSIBILIDADES</span>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h1>
            {search.guardados ? "Tus planes guardados" : "Encuentra tu próximo plan"}
            <span className="text-primary">.</span>
          </h1>
          <Button
            variant={search.guardados ? "selected" : "outline"}
            onClick={() =>
              void navigate({ to: "/planes", search: { ...search, guardados: !search.guardados } })
            }
          >
            <Heart />
            Favoritos ({state.favorites.length})
          </Button>
        </div>
        <p>Un paseo, un nuevo rincón o una excusa para salir. Tú eliges.</p>
      </header>
      <div className="filter-grid">
        <label className="filter-search">
          <span className="filter-label">Buscar un plan</span>
          <div className="relative">
            <Search size={16} className="absolute top-3.5 left-3 text-muted-foreground" />
            <input
              className="form-field search-field"
              placeholder="¿Qué te apetece descubrir?"
              aria-label="Buscar planes"
              value={filters.search}
              onChange={(e) => change("search", e.target.value)}
            />
          </div>
        </label>
        {[
          {
            key: "category",
            label: "Categoría",
            options: [...new Set(activities.map((a) => a.category))],
          },
          { key: "price", label: "Presupuesto", options: budgets },
          { key: "zone", label: "Zona", options: [...new Set(activities.map((a) => a.zone))] },
          { key: "company", label: "Compañía", options: ["Individuales", "Grupales"] },
          { key: "setting", label: "Entorno", options: ["Interior", "Exterior"] },
        ].map((f) => (
          <label key={f.key}>
            <span className="filter-label">{f.label}</span>
            <select
              className="form-field"
              aria-label={f.label}
              value={String(actual[f.key as keyof Filters] || "")}
              onChange={(e) => change(f.key as keyof Filters, e.target.value)}
            >
              <option value="">{f.key === "price" ? "Cualquiera" : "Todos"}</option>
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={personal}
            onChange={(e) => setPersonal(e.target.checked)}
          />
          Según mi perfil
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={Boolean(filters.freeOnly)}
            onChange={(e) => setFilters((f) => ({ ...f, freeOnly: e.target.checked }))}
          />
          Solo gratuitas
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={Boolean(filters.groupOnly)}
            onChange={(e) => setFilters((f) => ({ ...f, groupOnly: e.target.checked }))}
          />
          Para conocer gente
        </label>
      </div>
      <div className="my-6 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal size={14} />
          {rows.length} propuestas de demostración
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFilters(emptyFilters);
            void navigate({ to: "/planes", search: { guardados: false, zona: undefined } });
          }}
        >
          <X />
          Limpiar filtros
        </Button>
      </div>
      {savedResources.length > 0 && (
        <section className="mb-7">
          <h2 className="section-title mb-4">Recursos guardados</h2>
          <div className="resource-grid">
            {savedResources.map((r) => (
              <article className="resource-card" key={r.id}>
                <h3 className="font-bold">{r.name}</h3>
                <p className="mt-2 mb-3 text-sm text-muted-foreground">{r.description}</p>
                <Button asChild variant="link" className="px-0">
                  <a href={r.url} target="_blank" rel="noreferrer">
                    Consultar recurso
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Quitar recurso guardado"
                  onClick={() => toggleFavorite(`resource:${r.id}`)}
                >
                  <Heart className="fill-primary text-primary" />
                </Button>
              </article>
            ))}
          </div>
        </section>
      )}
      {rows.length ? (
        <div className="activity-grid">
          {rows.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <CompassEmpty />
          <h2 className="mt-4 text-xl font-bold">Todavía no hay planes aquí</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {search.guardados
              ? "Guarda tus favoritos para volver a ellos."
              : "Prueba otra combinación de filtros. No mostramos precios sin confirmar."}
          </p>
          <Button
            variant="link"
            onClick={() => {
              setFilters(emptyFilters);
              void navigate({ to: "/planes", search: { guardados: false, zona: undefined } });
            }}
          >
            Explorar todos los planes
          </Button>
        </div>
      )}
      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Ideas ilustrativas, no una agenda de eventos. Los paseos por espacios públicos son
        gratuitos; cualquier otro precio, horario o disponibilidad debe consultarse en la fuente
        oficial.
      </p>
    </div>
  );
}
function CompassEmpty() {
  return <Search className="mx-auto size-9 text-sage" />;
}

function PlansPage() {
  return (
    <PublicShell>
      <Plans />
    </PublicShell>
  );
}
