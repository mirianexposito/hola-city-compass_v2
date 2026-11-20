import { setLanguage, useLanguage, type Language } from "@/lib/language";
import { cn } from "@/lib/utils";

const options: Language[] = ["es", "en"];

export function LanguageSwitcher() {
  const lang = useLanguage();
  return (
    <div
      role="group"
      aria-label={lang === "en" ? "Language" : "Idioma"}
      className="flex items-center rounded-full border border-border p-0.5 text-xs font-semibold"
    >
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={lang === o}
          onClick={() => setLanguage(o)}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            lang === o ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
