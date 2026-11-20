import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Bus,
  Dumbbell,
  HeartPulse,
  Landmark,
  MapPin,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { resources } from "@/lib/city-data";
import { pageHead } from "@/lib/metadata";
import { PublicShell } from "@/components/public-shell";
import { MunicipalDirectory } from "@/components/municipal-directory";
import { municipalQueryOptions } from "@/lib/municipal-query";
export const Route = createFileRoute("/informacion")({
  ssr: false,
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    centro?: string | undefined;
    tipo?: string | undefined;
    distrito?: string | undefined;
    pagina?: number | undefined;
  } => ({
    centro: typeof search["centro"] === "string" ? search["centro"].slice(0, 150) : undefined,
    tipo:
      search["tipo"] === "bibliotecas" || search["tipo"] === "centros-civicos"
        ? search["tipo"]
        : undefined,
    distrito: typeof search["distrito"] === "string" ? search["distrito"].slice(0, 80) : undefined,
    pagina:
      Number.isSafeInteger(Number(search["pagina"])) && Number(search["pagina"]) > 0
        ? Number(search["pagina"])
        : undefined,
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(municipalQueryOptions());
  },
  head: () =>
    pageHead(
      "Información útil",
      "Consulta bibliotecas y centros cívicos con datos abiertos del Ayuntamiento de Zaragoza, direcciones y horarios publicados, además de recursos de transporte, salud y trámites.",
    ),
  errorComponent: InformationError,
  notFoundComponent: () => (
    <div className="page-width py-12">
      <h1 className="text-2xl font-bold">Información no encontrada</h1>
    </div>
  ),
  component: InformationPage,
});
function InformationError() {
  const router = useRouter();
  return (
    <div className="page-width py-12" role="alert">
      <h1 className="text-2xl font-bold">No se pudo cargar la información</h1>
      <Button className="mt-4" onClick={() => void router.invalidate()}>
        Reintentar
      </Button>
    </div>
  );
}
const icons = [Bus, HeartPulse, BookOpen, Users, Dumbbell, Landmark, ShoppingBag, MapPin, Bus];
function Information() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const rows = resources.filter(
    (r) =>
      (!category || r.category === category) &&
      `${r.name} ${r.description} ${r.category}`
        .toLocaleLowerCase("es")
        .includes(search.toLocaleLowerCase("es")),
  );
  return (
    <div className="page-width fade-in pb-12">
      <header className="page-heading">
        <span className="eyebrow text-primary">LO PRÁCTICO, UN POCO MÁS FÁCIL</span>
        <h1 className="mt-3">
          Instalarte sin dar tantas vueltas<span className="text-primary">.</span>
        </h1>
        <p>Los recursos que necesitas para empezar, en un mismo lugar.</p>
      </header>
      <MunicipalDirectory />
      <h2 className="mb-5 text-xl font-bold">Otros recursos para instalarte</h2>
      <div className="mb-7 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
        <label>
          <span className="filter-label">Buscar un recurso</span>
          <div className="relative">
            <Search className="absolute top-3.5 left-3 size-4 text-muted-foreground" />
            <input
              className="form-field search-field"
              aria-label="Buscar un recurso"
              placeholder="Transporte, salud, bibliotecas…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </label>
        <label>
          <span className="filter-label">Categoría</span>
          <select
            className="form-field"
            aria-label="Categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {[...new Set(resources.map((r) => r.category))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="resource-grid">
        {rows.map((r) => {
          const Icon = icons[resources.indexOf(r)] ?? MapPin;
          return (
            <article className="resource-card" key={r.name}>
              <span className="icon-tile sage">
                <Icon size={21} />
              </span>
              <span className="eyebrow mt-5 block text-primary">{r.category}</span>
              <h2 className="mt-2 text-lg font-bold">{r.name}</h2>
              <p className="mt-2 mb-5 text-sm leading-relaxed text-muted-foreground">
                {r.description}
              </p>
              <Button
                asChild
                variant="link"
                className="h-auto whitespace-normal px-0 text-left text-xs"
              >
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.label}
                  <ArrowUpRight />
                </a>
              </Button>
            </article>
          );
        })}
      </div>
      {!rows.length && (
        <div className="empty-state">
          <p>No encontramos recursos con estos filtros.</p>
          <Button
            variant="link"
            onClick={() => {
              setSearch("");
              setCategory("");
            }}
          >
            Ver todos los recursos
          </Button>
        </div>
      )}
      <p className="mt-8 text-xs text-muted-foreground">
        Consulta los requisitos, tarifas y horarios vigentes directamente en cada fuente oficial.
      </p>
    </div>
  );
}

function InformationPage() {
  return (
    <PublicShell>
      <Information />
    </PublicShell>
  );
}
