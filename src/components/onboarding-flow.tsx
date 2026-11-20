import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coffee,
  Dumbbell,
  GraduationCap,
  Landmark,
  LoaderCircle,
  Mail,
  Music,
  ShoppingBag,
  Trees,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HolaFace } from "@/components/hola-face";
import { PasswordInput } from "@/components/password-input";
import { useAccount } from "@/components/account-provider";
import { useCity } from "@/components/city-provider";
import { neighborhoods } from "@/lib/city-data";
import { questionnaireSteps as steps } from "@/lib/questionnaire";
import { CustomAnswerChoice } from "@/components/custom-answer-choice";
import { ProfileEditor } from "@/components/profile-editor";
import { NeighborhoodSelect } from "@/components/neighborhood-select";
import { authError, registerAccount } from "@/lib/auth-flow";

const icons = [Landmark, Coffee, Dumbbell, Trees, Music, Users, GraduationCap, ShoppingBag];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OnboardingFlow() {
  const { state, ready, updatePreferences, saveProfile, profileError, retryProfile } = useCity();
  const { user } = useAccount();
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [customValid, setCustomValid] = useState(true);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();
  const current = steps[step] ?? steps[0];
  const value = state.preferences[current.key];
  const selected = (v: string) => (Array.isArray(value) ? value.includes(v) : value === v);
  const hasCustomAnswer = current.key === "goals" || current.key === "desiredActivities";
  const valid =
    (!hasCustomAnswer || customValid) &&
    (current.key === "neighborhood"
      ? neighborhoods.includes(String(value))
      : Array.isArray(value)
        ? value.length > 0
        : Boolean(value));
  function choose(v: string) {
    const p = { ...state.preferences };
    if (
      current.key === "interests" ||
      current.key === "goals" ||
      current.key === "desiredActivities" ||
      current.key === "availability"
    ) {
      const prev = p[current.key];
      p[current.key] = prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v];
    } else p[current.key] = v;
    updatePreferences(p);
  }
  function next() {
    if (!valid) return;
    if (step === steps.length - 1) {
      setFinished(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setCustomValid(true);
    setFurthestStep((previous) => Math.max(previous, step + 1));
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function returnToQuestion(index: number) {
    setCustomValid(true);
    setStep(index);
    setFinished(false);
    setSaveError("");
    setRegisterError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function register(event: FormEvent) {
    event.preventDefault();
    setRegisterError("");
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setRegisterError("Cuéntanos tu nombre (máximo 100 caracteres).");
      return;
    }
    if (!emailPattern.test(email.trim()) || email.trim().length > 254) {
      setRegisterError("Revisa tu correo electrónico.");
      return;
    }
    if (password.length < 8) {
      setRegisterError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setRegisterError("Las contraseñas no coinciden.");
      return;
    }
    setRegistering(true);
    try {
      // Las respuestas quedan guardadas en este navegador y se vinculan a la
      // cuenta en el primer inicio de sesión tras confirmar el correo.
      updatePreferences(state.preferences, true);
      await registerAccount(email, password, window.location.origin, trimmedName);
      setPassword("");
      setConfirm("");
      setRegistered(true);
    } catch (failure) {
      setRegisterError(authError(failure));
    } finally {
      setRegistering(false);
    }
  }
  if (!ready)
    return (
      <section className="page-width py-12">
        <p role="status" className="text-sm text-muted-foreground">
          Recuperando tus respuestas…
        </p>
      </section>
    );
  if (state.completed && user) return <ProfileEditor />;
  return (
    <section className="onboarding fade-in">
      {profileError && (
        <div role="alert" className="mb-5 text-sm text-destructive">
          {profileError}
          <Button variant="link" onClick={retryProfile}>
            Volver a intentar
          </Button>
        </div>
      )}
      {finished ? (
        <div className="pt-4 text-center">
          {!registered && (
            <div className="mb-6 flex justify-start">
              <Button
                variant="ghost"
                disabled={registering || saving}
                onClick={() => returnToQuestion(steps.length - 1)}
              >
                <ArrowLeft />
                Volver a las preguntas
              </Button>
            </div>
          )}
          <div className="mb-6 flex justify-center">
            <HolaFace />
          </div>
          <span className="eyebrow text-primary">ESTE ES EL PRINCIPIO DE ALGO BONITO</span>
          <h1 className="mt-4 text-3xl font-extrabold leading-snug">
            Vamos a descubrir
            <br />
            tu Zaragoza<span className="text-primary">.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            ¡Perfecto! Ya tenemos una primera idea de lo que te gusta. Vamos a descubrir tu
            Zaragoza.
          </p>
          {user ? (
            <>
              <Button
                size="roomy"
                className="mt-8"
                disabled={saving || !ready}
                onClick={async () => {
                  setSaving(true);
                  setSaveError("");
                  try {
                    await saveProfile(state.preferences, true);
                    void navigate({ to: "/mi-zaragoza" });
                  } catch (failure) {
                    setSaveError(
                      failure instanceof Error ? failure.message : "No se pudo guardar el perfil.",
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Guardando…" : "Crear mi experiencia"}
                <ArrowRight />
              </Button>
              {saveError && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {saveError}
                </p>
              )}
            </>
          ) : registered ? (
            <div className="mx-auto mt-8 max-w-md">
              <div
                role="status"
                className="space-y-3 text-left text-sm leading-relaxed text-secondary-foreground"
              >
                <p className="flex items-center gap-2 font-semibold">
                  <Mail className="size-4 shrink-0" />
                  ¡Ya casi está, {name.trim()}!
                </p>
                <p>
                  Te hemos enviado un correo a <strong>{email.trim()}</strong>.
                </p>
                <p>
                  Pulsa el enlace para confirmar tu cuenta y después inicia sesión: tus respuestas
                  se guardarán en tu perfil automáticamente. Revisa también la carpeta de spam.
                </p>
              </div>
              <Button size="roomy" className="mt-6" onClick={() => void navigate({ to: "/auth" })}>
                Ir a iniciar sesión
                <ArrowRight />
              </Button>
            </div>
          ) : (
            <form onSubmit={register} className="mx-auto mt-8 max-w-md space-y-4 text-left">
              <p className="text-sm font-semibold">
                Para guardar tu experiencia, crea tu cuenta con tu nombre y tu correo.
              </p>
              <div>
                <label htmlFor="onboarding-name" className="filter-label">
                  Tu nombre
                </label>
                <Input
                  id="onboarding-name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={registering}
                  className="h-12"
                />
              </div>
              <div>
                <label htmlFor="onboarding-email" className="filter-label">
                  Correo electrónico
                </label>
                <Input
                  id="onboarding-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={registering}
                  className="h-12"
                />
              </div>
              <PasswordInput
                id="onboarding-password"
                value={password}
                onChange={setPassword}
                newPassword
                disabled={registering}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres. Usa una contraseña única.
              </p>
              <PasswordInput
                id="onboarding-confirm"
                label="Repetir contraseña"
                value={confirm}
                onChange={setConfirm}
                newPassword
                disabled={registering}
              />
              <Button type="submit" size="roomy" className="w-full" disabled={registering}>
                {registering ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
                {registering ? "Creando tu cuenta…" : "Crear mi cuenta y mi experiencia"}
              </Button>
              {registerError && (
                <p role="alert" className="text-sm text-destructive">
                  {registerError}
                </p>
              )}
            </form>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="eyebrow text-primary">TU ZARAGOZA COMIENZA CONTIGO</span>
            <span className="text-xs text-muted-foreground">
              Paso {step + 1} de {steps.length}
            </span>
          </div>
          <nav className="my-6 flex flex-wrap gap-2" aria-label="Preguntas del cuestionario">
            {steps.map((question, index) => (
              <Button
                key={question.key}
                variant={index === step ? "default" : "outline"}
                size="icon"
                className="shrink-0"
                aria-label={`Ir a la pregunta ${index + 1}: ${question.title}`}
                aria-current={index === step ? "step" : undefined}
                title={question.title}
                disabled={!ready || index > furthestStep}
                onClick={() => returnToQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </nav>
          <h1 className="text-[30px] font-extrabold leading-snug">{current.title}</h1>
          <p className="mt-3 mb-7 text-sm text-muted-foreground">{current.subtitle}</p>
          {current.key === "neighborhood" ? (
            <NeighborhoodSelect
              value={state.preferences.neighborhood}
              onChange={choose}
              disabled={!ready}
            />
          ) : (
            <div className="option-grid">
              {current.options.map((v, i) => {
                const Icon = current.key === "interests" ? icons[i] : undefined;
                return (
                  <Button
                    key={v}
                    variant={selected(v) ? "selected" : "choice"}
                    size="option"
                    onClick={() => choose(v)}
                    aria-pressed={selected(v)}
                    disabled={!ready}
                  >
                    {Icon && <Icon className="text-primary" />}
                    <span className="flex-1">{v}</span>
                    {selected(v) && <Check className="text-primary" />}
                  </Button>
                );
              })}
            </div>
          )}
          {(current.key === "goals" || current.key === "desiredActivities") && (
            <CustomAnswerChoice
              key={current.key}
              id={`other-${current.key}`}
              values={state.preferences[current.key]}
              options={current.options}
              label={
                current.key === "goals" ? "¿Qué más buscas?" : "¿Qué otras actividades te apetecen?"
              }
              disabled={!ready}
              onValidityChange={setCustomValid}
              onChange={(values) =>
                updatePreferences({ ...state.preferences, [current.key]: values })
              }
            />
          )}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Button
              variant="ghost"
              disabled={step === 0}
              onClick={() => returnToQuestion(step - 1)}
            >
              <ArrowLeft />
              Atrás
            </Button>
            <Button size="roomy" disabled={!valid || !ready} onClick={next}>
              {step === steps.length - 1 ? "Terminar" : "Continuar"}
              <ArrowRight />
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
