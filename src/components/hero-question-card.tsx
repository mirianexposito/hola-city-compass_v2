import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HolaFace } from "@/components/hola-face";
import { useCity } from "@/components/city-provider";
import { NeighborhoodSelect } from "@/components/neighborhood-select";
import { neighborhoods } from "@/lib/city-data";
import { questionnaireSteps as steps } from "@/lib/questionnaire";

const multi = ["interests", "goals", "desiredActivities", "availability"];

export function HeroQuestionCard() {
  const { state, ready, updatePreferences } = useCity();
  const [step, setStep] = useState(0);
  const done = step >= steps.length;
  const current = steps[Math.min(step, steps.length - 1)] ?? steps[0];
  const value = state.preferences[current.key];
  const isOn = (v: string) => (Array.isArray(value) ? value.includes(v) : value === v);
  const valid =
    current.key === "neighborhood"
      ? neighborhoods.includes(String(value))
      : Array.isArray(value)
        ? value.length > 0
        : Boolean(value);

  function choose(v: string) {
    const p = { ...state.preferences } as Record<string, unknown>;
    if (multi.includes(current.key)) {
      const prev = (p[current.key] as string[]) ?? [];
      p[current.key] = prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v];
      updatePreferences(p as typeof state.preferences);
    } else {
      p[current.key] = v;
      updatePreferences(p as typeof state.preferences);
      if (current.key !== "neighborhood") setStep((s) => s + 1);
    }
  }

  return (
    <div className="hero-card">
      <div className="flex items-center gap-3">
        <HolaFace />
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-bold">Pilar</span>
          <span className="text-xs text-muted-foreground">Tu amiga mañica</span>
        </div>
        {!done && (
          <span className="text-[11px] text-muted-foreground">
            {step + 1}/{steps.length}
          </span>
        )}
      </div>
      {done ? (
        <>
          <p className="hero-card-bubble">
            ¡Perfecto! Ya tengo una idea de lo que te gusta. Crea tu cuenta y te preparo tu Zaragoza.
          </p>
          <Button asChild className="mt-4 w-full">
            <Link to="/onboarding">
              Crear mi cuenta
              <ArrowRight />
            </Link>
          </Button>
        </>
      ) : (
        <>
          <p className="hero-card-bubble">
            <strong className="block">{current.title}</strong>
            <span className="text-muted-foreground">{current.subtitle}</span>
          </p>
          <div className="hero-card-options">
            {current.key === "neighborhood" ? (
              <NeighborhoodSelect value={state.preferences.neighborhood} onChange={choose} disabled={!ready} />
            ) : (
              current.options.map((v) => (
                <button
                  key={v}
                  type="button"
                  className="hero-chip"
                  aria-pressed={isOn(v)}
                  disabled={!ready}
                  onClick={() => choose(v)}
                >
                  {v}
                </button>
              ))
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft />
              Atrás
            </Button>
            <Button size="icon" aria-label="Siguiente pregunta" disabled={!valid || !ready} onClick={() => setStep((s) => s + 1)}>
              <ArrowRight />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
