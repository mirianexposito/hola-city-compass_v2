import { z } from "zod";

export const municipalSources = [
  { id: "bibliotecas", label: "Bibliotecas" },
  { id: "centros-civicos", label: "Centros cívicos" },
] as const;

export type MunicipalKind = (typeof municipalSources)[number]["id"];
export const municipalFields =
  "id,title,streetAddress,postalCode,telephone,openingHours,distritoId,lastUpdated";

const optionalText = z.string().nullish();
export const municipalPageSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  result: z.array(
    z.object({
      id: z.union([z.string(), z.number()]).transform(String).pipe(z.string().regex(/^\d+$/)),
      title: z.string().trim().min(1),
      streetAddress: optionalText,
      postalCode: optionalText,
      telephone: optionalText,
      openingHours: optionalText,
      distritoId: optionalText,
      lastUpdated: optionalText,
    }),
  ),
});

// Treat municipal HTML as text, never markup. This also runs without a browser DOM.
export function municipalText(value: string | null | undefined): string {
  const entities: Record<string, string> = {
    amp: "&",
    nbsp: " ",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    aacute: "á",
    eacute: "é",
    iacute: "í",
    oacute: "ó",
    uacute: "ú",
    ntilde: "ñ",
    uuml: "ü",
  };
  return (value ?? "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (!entity.startsWith("#")) return entities[entity.toLowerCase()] ?? match;
      const code = entity.toLowerCase().startsWith("#x")
        ? Number.parseInt(entity.slice(2), 16)
        : Number.parseInt(entity.slice(1), 10);
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
        ? String.fromCodePoint(code)
        : " ";
    })
    .replace(/\s+/g, " ")
    .trim();
}

export type MunicipalPlace = {
  id: string;
  kind: MunicipalKind;
  name: string;
  address: string;
  postalCode: string;
  phone: string;
  hours: string;
  district: string;
  updatedAt: string | null;
  url: string;
};

export function parseMunicipalPage(input: unknown, kind: MunicipalKind) {
  const page = municipalPageSchema.parse(input);
  const items: MunicipalPlace[] = page.result.map((row) => ({
    id: `${kind}:${row.id}`,
    kind,
    name: municipalText(row.title),
    address: municipalText(row.streetAddress),
    postalCode: municipalText(row.postalCode),
    phone: municipalText(row.telephone),
    hours: municipalText(row.openingHours),
    district: municipalText(row.distritoId).replace(
      /^Actur\s*-\s*Rey Fernando$/i,
      "Actur-Rey Fernando",
    ),
    updatedAt:
      row.lastUpdated &&
      /^\d{4}-\d{2}-\d{2}T/.test(row.lastUpdated) &&
      Number.isFinite(Date.parse(row.lastUpdated))
        ? row.lastUpdated
        : null,
    url: `https://www.zaragoza.es/sede/servicio/equipamiento/${row.id}`,
  }));
  return { total: page.totalCount, items };
}

export function normalizeMunicipalSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

export function filterMunicipalPlaces(
  items: MunicipalPlace[],
  search: string,
  kind: string,
  district: string,
) {
  const term = normalizeMunicipalSearch(search);
  return items.filter(
    (item) =>
      (!kind || item.kind === kind) &&
      (!district || item.district === district) &&
      normalizeMunicipalSearch(
        `${item.name} ${item.address} ${item.postalCode} ${item.district}`,
      ).includes(term),
  );
}
