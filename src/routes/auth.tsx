import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, LogOut, Mail, UserRound } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthShell } from "@/components/auth-shell";
import { PasswordInput } from "@/components/password-input";
import { useAccount } from "@/components/account-provider";
import { authError, loginAccount, registerAccount, resendVerification, safeDestination } from "@/lib/auth-flow";
import { pageHead } from "@/lib/metadata";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({ redirect: search["redirect"] ? safeDestination(search["redirect"]) : undefined }),
  head: () => pageHead("Iniciar sesión y crear cuenta", "Accede a Hola Zaragoza con tu correo y contraseña, verifica tu cuenta y recupera tus preferencias privadas de Zaragoza."),
  component: AccountPage,
});
function AccountPage() {
  const { user, ready, error: accountError, recovering, signOut } = useAccount();
  const { redirect: destination } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [afterLogin, setAfterLogin] = useState(false);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.has("error")) setError("El enlace ha caducado o no es válido. Puedes reenviar la confirmación.");
    if (sessionStorage.getItem("hola-ciudad-password-reset-complete")) {
      sessionStorage.removeItem("hola-ciudad-password-reset-complete");
      setNotice("Contraseña actualizada. Inicia sesión con tu nueva contraseña.");
    }
  }, []);
  useEffect(() => {
    if (!ready || !user) return;
    if (recovering) { void navigate({ to: "/reset-password", replace: true }); return; }
    if (destination || afterLogin || sessionStorage.getItem("hola-ciudad-auth-destination")) {
      const path = safeDestination(destination ?? sessionStorage.getItem("hola-ciudad-auth-destination"));
      sessionStorage.removeItem("hola-ciudad-auth-destination");
      void navigate({ to: path, replace: true });
    }
  }, [user, ready, recovering, destination, afterLogin, navigate]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setNotice("");
    if (mode === "register" && password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    setPending("email");
    try {
      sessionStorage.setItem("hola-ciudad-auth-destination", safeDestination(destination));
      if (mode === "register") {
        await registerAccount(email, password, window.location.origin);
        setPassword(""); setConfirm("");
        setNotice("Revisa tu correo y pulsa el enlace para confirmar tu cuenta. Después podrás iniciar sesión. Revisa también la carpeta de spam.");
        setCooldown(60);
      } else {
        await loginAccount(email, password);
        setPassword(""); setAfterLogin(true);
      }
    } catch (failure) { setError(authError(failure)); }
    finally { setPending(null); }
  }
  async function resend() {
    if (!email.trim() || pending || cooldown) return;
    setPending("resend"); setError("");
    try { await resendVerification(email, window.location.origin); setNotice("Si tu cuenta está pendiente de confirmar, recibirás un nuevo enlace en tu correo."); setCooldown(60); }
    catch (failure) { setError(authError(failure)); }
    finally { setPending(null); }
  }
  async function social(provider: "google" | "lovable") {
    setPending(provider); setError("");
    sessionStorage.setItem("hola-ciudad-auth-destination", safeDestination(destination));
    setAfterLogin(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) throw result.error;
      if (result.redirected) return;
    } catch (failure) { setAfterLogin(false); setError(authError(failure)); }
    setPending(null);
  }
  return <AuthShell>
    <h1 className="mt-3 text-3xl font-extrabold">{user ? "Tu cuenta" : mode === "register" ? "Tu nueva etapa empieza aquí" : "Qué bien verte por aquí"}<span className="text-primary">.</span></h1>
    {!ready ? <LoaderCircle aria-label="Comprobando sesión" className="mt-8 animate-spin text-primary" /> : user ? <div className="mt-7 flex flex-col gap-4">
      <p className="break-words text-sm text-muted-foreground">Sesión iniciada{user.email ? ` · ${user.email}` : ""}</p>
      <Button asChild size="roomy"><Link to="/mi-zaragoza"><ArrowRight />Ir a Mi Zaragoza</Link></Button>
      <Button asChild variant="outline" size="roomy"><Link to="/onboarding"><UserRound />Mi perfil</Link></Button>
      <Button variant="outline" size="roomy" onClick={() => void signOut()}><LogOut />Cerrar sesión</Button>
    </div> : <>
      <Tabs value={mode} onValueChange={(value) => { setMode(value); setError(""); setNotice(""); setPassword(""); setConfirm(""); }} className="mt-6">
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="login" disabled={pending !== null}>Iniciar sesión</TabsTrigger><TabsTrigger value="register" disabled={pending !== null}>Crear cuenta</TabsTrigger></TabsList>
      </Tabs>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div><label htmlFor="auth-email" className="filter-label">Correo electrónico</label><Input id="auth-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending !== null} className="h-12" /></div>
        <PasswordInput id="auth-password" value={password} onChange={setPassword} newPassword={mode === "register"} disabled={pending !== null} />
        {mode === "register" ? <><p className="text-xs text-muted-foreground">Mínimo 8 caracteres. Usa una contraseña única.</p><PasswordInput id="auth-confirm" label="Repetir contraseña" value={confirm} onChange={setConfirm} newPassword disabled={pending !== null} /></> : <Button asChild variant="link" className="h-auto px-0 text-xs"><Link to="/forgot-password">¿Has olvidado tu contraseña?</Link></Button>}
        <Button type="submit" size="roomy" className="w-full" disabled={pending !== null}>{pending === "email" ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}{pending === "email" ? "Un momento…" : mode === "register" ? "Crear mi cuenta" : "Entrar"}</Button>
      </form>
      {notice && <p role="status" className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-secondary-foreground"><Mail className="mt-1 size-4 shrink-0" />{notice}</p>}
      {mode === "register" && <Button variant="link" className="mt-2 h-auto whitespace-normal px-0 text-xs" disabled={!email || pending !== null || cooldown > 0} onClick={() => void resend()}>{cooldown > 0 ? `Reenviar confirmación en ${cooldown}s` : "Reenviar correo de confirmación"}</Button>}
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />o continúa con<span className="h-px flex-1 bg-border" /></div>
      <div className="flex flex-col gap-3">
        <Button variant="outline" className="google-auth-button" disabled={pending !== null} onClick={() => void social("google")}>{pending === "google" ? "Conectando…" : "Continuar con Google"}</Button>
        <Button className="lovable-auth-button" disabled={pending !== null} onClick={() => void social("lovable")}>{pending === "lovable" ? "Conectando…" : "Continuar con Lovable"}</Button>
      </div>
    </>}
    {(error || accountError) && <p role="alert" className="mt-4 text-sm text-destructive">{error || accountError}</p>}
  </AuthShell>;
}
