import { useState } from "react";
import { Check, RotateCcw, Save } from "lucide-react";
import { Button } from "./ui/button";
import { useCity } from "./city-provider";
import { useAccount } from "./account-provider";
import { NeighborhoodSelect } from "./neighborhood-select";
import { CustomAnswerChoice } from "./custom-answer-choice";
import { ageRanges, goalOptions } from "@/lib/questionnaire";
import { availabilitySlots, budgets, desiredActivities, interests } from "@/lib/city-data";
import type { Preferences } from "@/lib/city-logic";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
export function ProfileEditor() {
  const { state, ready, saveProfile, resetProfile, profileError, retryProfile } = useCity();
  const { user } = useAccount();
  const [draft, setDraft] = useState(state.preferences);
  const [saved, setSaved] = useState(false);
  const [reset, setReset] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  function change<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setDraft((p) => ({ ...p, [key]: value }));
    setSaved(false);
    setError("");
  }
  const fields = [
    {
      key: "origin",
      label: "Procedencia",
      options: ["Otra ciudad de España", "Otro país", "Prefiero no decirlo"],
    },
    {
      key: "arrival",
      label: "Tiempo en Zaragoza",
      options: [
        "Acabo de llegar",
        "Menos de un mes",
        "Entre uno y seis meses",
        "Más de seis meses",
      ],
    },
    { key: "budget", label: "Presupuesto", options: budgets },
    { key: "ageRange", label: "Franja de edad", options: ageRanges },
    {
      key: "company",
      label: "Preferencia social",
      options: [
        "Por mi cuenta",
        "En pareja",
        "Con otras personas",
        "Me gustaría conocer gente nueva",
      ],
    },
  ] as const;
  return (
    <section className="page-width pb-12">
      <header className="page-heading">
        <span className="eyebrow text-primary">TU CIUDAD, A TU MANERA</span>
        <h1 className="mt-3">
          Tu perfil de Zaragoza<span className="text-primary">.</span>
        </h1>
        <p>Una nueva etapa cambia contigo.</p>
      </header>
      {profileError && <div role="alert" className="mb-5 text-sm text-destructive">{profileError}<Button variant="link" onClick={retryProfile}>Volver a intentar</Button></div>}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setSaved(false);
          setError("");
          try {
            await saveProfile(draft, true);
            setSaved(true);
          } catch (failure) {
            setError(failure instanceof Error ? failure.message : "No se pudo guardar el perfil.");
          } finally {
            setSaving(false);
          }
        }}
      >
        <fieldset disabled={saving || !ready} className="min-w-0 border-0 p-0">
          <div className="profile-fields">
            <div>
              <label htmlFor="profile-neighborhood" className="filter-label">
                Barrio
              </label>
              <NeighborhoodSelect
                id="profile-neighborhood"
                value={draft.neighborhood}
                onChange={(value) => change("neighborhood", value)}
              />
            </div>
            {fields.map((f) => (
              <label key={f.key}>
                <span className="filter-label">{f.label}</span>
                <select
                  className="form-field"
                  value={draft[f.key]}
                  onChange={(e) => change(f.key, e.target.value)}
                >
                  <option value="">Sin especificar</option>
                  {f.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          {(
            [
              { key: "interests", title: "Intereses y aficiones", options: interests },
              {
                key: "desiredActivities",
                title: "Actividades que te apetecen",
                options: desiredActivities,
              },
              {
                key: "goals",
                title: "Tus objetivos",
                options: goalOptions,
              },
              { key: "availability", title: "Tus ratos libres", options: availabilitySlots },
            ] as const
          ).map((f) => (
            <fieldset className="profile-section" key={f.key}>
              <legend className="text-lg font-bold">{f.title}</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {f.options.map((o) => {
                  const key = f.key;
                  const selected = draft[key].includes(o);
                  return (
                    <Button
                      key={o}
                      variant={selected ? "selected" : "choice"}
                      aria-pressed={selected}
                      onClick={() =>
                        change(
                          key,
                          selected ? draft[key].filter((x) => x !== o) : [...draft[key], o],
                        )
                      }
                      type="button"
                    >
                      {selected && <Check />}
                      {o}
                    </Button>
                  );
                })}
              </div>
              {(f.key === "goals" || f.key === "desiredActivities") && (
                <CustomAnswerChoice
                  id={`profile-other-${f.key}`}
                  values={draft[f.key]}
                  options={f.options}
                  label={
                    f.key === "goals" ? "¿Qué más buscas?" : "¿Qué otras actividades te apetecen?"
                  }
                  onChange={(values) => change(f.key, values)}
                />
              )}
            </fieldset>
          ))}
          {state.learnedInterests.length > 0 && (
            <section className="profile-section">
              <h2 className="text-lg font-bold">Intereses de nuestras conversaciones</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {state.learnedInterests.map((i) => (
                  <span
                    className="rounded-md bg-secondary px-3 py-2 text-xs text-secondary-foreground"
                    key={i}
                  >
                    {i}
                  </span>
                ))}
              </div>
            </section>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button type="submit" size="roomy" disabled={saving || !ready}>
              <Save />
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
            {saved && (
              <span role="status" className="text-sm text-secondary-foreground">
                {user ? "Preferencias guardadas en tu cuenta" : "Preferencias guardadas en este navegador"}
              </span>
            )}
            <Button type="button" variant="ghost" onClick={() => setReset(true)}>
              <RotateCcw />
              Reiniciar perfil
            </Button>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </fieldset>
      </form>
      <Dialog open={reset} onOpenChange={setReset}>
        <DialogContent>
          <DialogTitle>¿Empezamos de nuevo?</DialogTitle>
          <DialogDescription>
            {user ? "Se borrarán las respuestas guardadas en tu cuenta y tus conversaciones, favoritos y progreso de este navegador. No se puede deshacer." : "Se borrarán tus respuestas de perfil de este navegador y tus conversaciones, favoritos, descartados y progreso de este navegador. No se puede deshacer."}
          </DialogDescription>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              disabled={saving || !ready}
              onClick={async () => {
                setSaving(true);
                setError("");
                try {
                  await resetProfile();
                  setReset(false);
                } catch (failure) {
                  setError(
                    failure instanceof Error ? failure.message : "No se pudo reiniciar el perfil.",
                  );
                  setReset(false);
                } finally {
                  setSaving(false);
                }
              }}
            >
              Reiniciar todo
            </Button>
            <Button variant="outline" onClick={() => setReset(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
