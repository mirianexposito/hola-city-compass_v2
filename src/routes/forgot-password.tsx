import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authError, sendRecovery } from "@/lib/auth-flow";
import { pageHead } from "@/lib/metadata";

export const Route = createFileRoute("/forgot-password")({ head: () => pageHead("Recupera tu contraseña", "Recibe un enlace seguro por correo para recuperar el acceso a tu cuenta de Hola Zaragoza."), component: ForgotPassword });
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    try { await sendRecovery(email, window.location.origin); setSent(true); }
    catch (failure) { setError(authError(failure)); }
    finally { setPending(false); }
  }
  return <AuthShell>
    <h1 className="mt-3 text-3xl font-extrabold">Recupera tu contraseña<span className="text-primary">.</span></h1>
    {sent ? <div role="status" className="mt-6 space-y-4"><Mail className="text-primary" /><p className="text-sm leading-relaxed text-muted-foreground">Si hay una cuenta asociada a este correo, recibirás un enlace para elegir una nueva contraseña. Revisa también la carpeta de spam.</p><Button variant="outline" onClick={() => setSent(false)}>Usar otro correo</Button></div> : <form onSubmit={submit} className="mt-6 space-y-5">
      <div><label className="filter-label" htmlFor="recovery-email">Correo electrónico</label><Input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} className="h-12" /></div>
      <Button type="submit" size="roomy" className="w-full" disabled={pending}><Mail />{pending ? "Enviando…" : "Enviar enlace de recuperación"}</Button>
    </form>}
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    <Button asChild variant="link" className="mt-5 px-0"><Link to="/auth"><ArrowLeft />Volver a iniciar sesión</Link></Button>
  </AuthShell>;
}