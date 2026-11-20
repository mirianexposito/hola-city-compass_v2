import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { filterMunicipalPlaces, municipalSources } from "@/lib/municipal-data";
import { municipalQueryOptions } from "@/lib/municipal-query";

const informationRoute = getRouteApi("/informacion");
const pageSize = 9;
const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(new Date(value));

export function MunicipalDirectory() {
  const { data, refetch, isFetching, isRefetchError } = useSuspenseQuery(municipalQueryOptions());
  const filters = informationRoute.useSearch();
  const navigate = informationRoute.useNavigate();
  const rows = filterMunicipalPlaces(
    data.items,
    filters.centro ?? "",
    filters.tipo ?? "",
    filters.distrito ?? "",
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(filters.pagina ?? 1, pageCount);
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);
  const districts = [...new Set(data.items.map((item) => item.district).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "es"),
  );
  const change = (key: "centro" | "tipo" | "distrito", value: string) => {
    void navigate({
      search: (previous) => ({ ...previous, [key]: value || undefined, pagina: undefined }),
      replace: true,
      resetScroll: false,
    });
  };
  const clear = () =>
    void navigate({
      search: (previous) => ({
        ...previous,
        centro: undefined,
        tipo: undefined,
        distrito: undefined,
        pagina: undefined,
      }),
      replace: true,
      resetScroll: false,
    });

  return (
    <section className="mb-10 border-b border-border pb-9" aria-labelledby="municipal-title">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="eyebrow text-secondary-foreground">
            AYUNTAMIENTO DE ZARAGOZA · DATOS ABIERTOS
          </span>
          <h2 id="municipal-title" className="mt-2 text-xl font-bold">
            Bibliotecas y centros cívicos
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Encuentra un espacio en tu distrito.</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          title="Actualizar centros municipales"
          aria-label="Actualizar centros municipales"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          <RefreshCw className={isFetching ? "animate-spin motion-reduce:animate-none" : ""} />
        </Button>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <label className="sm:col-span-2 lg:col-span-1">
          <span className="filter-label">Buscar un centro</span>
          <div className="relative">
            <Search className="absolute top-3.5 left-3 size-4 text-muted-foreground" />
            <input
              className="form-field search-field"
              aria-label="Buscar un centro"
              placeholder="Nombre, calle o código postal…"
              value={filters.centro ?? ""}
              onChange={(event) => change("centro", event.target.value)}
            />
          </div>
        </label>
        <label>
          <span className="filter-label">Tipo de centro</span>
          <select
            className="form-field"
            aria-label="Tipo de centro"
            value={filters.tipo ?? ""}
            onChange={(event) => change("tipo", event.target.value)}
          >
            <option value="">Todos los centros</option>
            {municipalSources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="filter-label">Distrito o barrio</span>
          <select
            className="form-field"
            aria-label="Distrito o barrio"
            value={filters.distrito ?? ""}
            onChange={(event) => change("distrito", event.target.value)}
          >
            <option value="">Todos los distritos</option>
            {districts.map((district) => (
              <option key={district}>{district}</option>
            ))}
          </select>
        </label>
      </div>
      {(data.failures.length > 0 || isRefetchError) && (
        <div
          role="alert"
          className="mb-5 flex flex-wrap items-center gap-3 border-l-2 border-primary bg-accent px-4 py-3 text-sm"
        >
          <p className="min-w-0 flex-1">
            {data.failures.length === municipalSources.length || isRefetchError
              ? "No se pudo consultar el directorio municipal. Los recursos útiles siguen disponibles más abajo."
              : `No se pudieron consultar: ${municipalSources
                  .filter((source) => data.failures.includes(source.id))
                  .map((source) => source.label)
                  .join(", ")}. Se muestran los otros centros disponibles.`}
          </p>
          <Button variant="outline" size="sm" disabled={isFetching} onClick={() => void refetch()}>
            Reintentar
          </Button>
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-xs text-muted-foreground">
          {rows.length} centros{isFetching ? " · Actualizando…" : ""}
        </p>
        {(filters.centro || filters.tipo || filters.distrito) && (
          <Button variant="link" size="sm" onClick={clear}>
            Quitar filtros
          </Button>
        )}
      </div>
      <div className="resource-grid">
        {visible.map((place) => {
          const Icon = place.kind === "bibliotecas" ? BookOpen : Users;
          const callNumber = place.phone.split(/[\/;]/)[0]?.replace(/\D/g, "") ?? "";
          return (
            <article
              key={place.id}
              className="resource-card flex min-w-0 flex-col"
              aria-label={place.name}
            >
              <div className="flex items-center gap-3">
                <span className="icon-tile sage shrink-0">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <span className="eyebrow text-primary">
                  {place.kind === "bibliotecas" ? "Biblioteca" : "Centro cívico"}
                </span>
              </div>
              <h3 className="mt-4 text-base leading-snug font-bold break-words">{place.name}</h3>
              {place.district && (
                <p className="mt-2 text-xs font-medium text-secondary-foreground">
                  {place.district}
                </p>
              )}
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-words">
                    {place.address || "Dirección no publicada"}
                    {place.postalCode ? ` · ${place.postalCode}` : ""}
                  </span>
                </p>
                {place.phone && (
                  <p className="flex items-start gap-2">
                    <Phone size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span className="break-words">{place.phone}</span>
                  </p>
                )}
                {place.hours ? (
                  <details>
                    <summary className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
                      <Clock size={15} aria-hidden="true" />
                      Horario publicado <ArrowRight size={13} />
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed break-words">{place.hours}</p>
                  </details>
                ) : (
                  <p className="text-xs">Horario no publicado. Consulta la ficha oficial.</p>
                )}
              </div>
              <div className="mt-auto pt-5">
                <div className="flex items-center justify-between gap-2">
                  <Button
                    asChild
                    variant="link"
                    className="h-auto whitespace-normal px-0 text-left text-xs"
                  >
                    <a href={place.url} target="_blank" rel="noreferrer">
                      Ficha del Ayuntamiento
                      <ArrowUpRight />
                    </a>
                  </Button>
                  {/^[0-9]{9}$/.test(callNumber) && (
                    <Button asChild variant="ghost" size="icon-sm">
                      <a
                        href={`tel:${callNumber}`}
                        aria-label={`Llamar a ${place.name}`}
                        title={`Llamar a ${place.name}`}
                      >
                        <Phone />
                      </a>
                    </Button>
                  )}
                </div>
                {place.updatedAt && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Ficha actualizada: {dateLabel(place.updatedAt)}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!rows.length && data.failures.length < municipalSources.length && (
        <div className="empty-state">
          <p>No hay centros con estos filtros.</p>
          <Button variant="link" onClick={clear}>
            Ver todos los centros
          </Button>
        </div>
      )}
      {pageCount > 1 && (
        <nav
          className="mt-6 flex items-center justify-center gap-4"
          aria-label="Páginas de centros"
        >
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            title="Página anterior"
            aria-label="Página anterior"
            onClick={() =>
              void navigate({
                search: (previous) => ({ ...previous, pagina: page - 1 }),
                resetScroll: false,
              })
            }
          >
            <ArrowLeft />
          </Button>
          <span className="text-xs tabular-nums">
            {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= pageCount}
            title="Página siguiente"
            aria-label="Página siguiente"
            onClick={() =>
              void navigate({
                search: (previous) => ({ ...previous, pagina: page + 1 }),
                resetScroll: false,
              })
            }
          >
            <ArrowRight />
          </Button>
        </nav>
      )}
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Fuente:{" "}
        <a
          href="https://www.zaragoza.es/sede/portal/datos-abiertos/api"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline"
        >
          Datos abiertos del Ayuntamiento de Zaragoza
        </a>
        . Consulta: {dateLabel(data.fetchedAt)}. Los horarios y las condiciones de acceso pueden
        cambiar; confírmalos antes de acudir.
      </p>
    </section>
  );
}
