import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/components/account-provider";
import { supabase } from "@/integrations/supabase/client";
import { authError, resetRecoveryPassword } from "@/lib/auth-flow";
import { pageHead } from "@/lib/metadata";

export const Route = createFileRoute("/reset-password")({ head: () => pageHead("Elige una nueva contraseña", "Restablece tu contraseña con el enlace de recuperación seguro de Hola Zaragoza."), component: ResetPassword });
function ResetPassword() {
  const { user, ready, recovering, signOut, error: accountError } = useAccount();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.has("error")) setError("El enlace ha caducado o no es válido. Solicita uno nuevo.");
    // The existing SDK consumes the hash, validates it and emits PASSWORD_RECOVERY.
    // Never accept an ordinary signed-in session as a recovery session.
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!recovering || !user) return;
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    setPending(true); setError("");
    try {
      const { data, error: failure } = await supabase.auth.getUser();
      if (failure || data.user?.id !== user.id) throw failure ?? new Error("Invalid recovery");
      await resetRecoveryPassword(password);
      sessionStorage.setItem("hola-ciudad-password-reset-complete", "true");
      setPassword(""); setConfirm(""); setDone(true);
      await signOut();
    } catch (failure) { setError(authError(failure)); }
    finally { setPending(false); }
  }
  return <AuthShell>
    <h1 className="mt-3 text-3xl font-extrabold">Nueva contraseña<span className="text-primary">.</span></h1>
    {!ready ? <LoaderCircle aria-label="Comprobando enlace" className="mt-6 animate-spin text-primary" /> : done ? <div role="status" className="mt-6"><Check className="text-primary" /><p className="mt-3 text-sm">Contraseña actualizada. Ya puedes iniciar sesión.</p><Button asChild className="mt-5"><Link to="/auth">Iniciar sesión</Link></Button></div> : recovering && user ? <form onSubmit={submit} className="mt-6 space-y-5">
      <PasswordInput id="new-password" label="Nueva contraseña" value={password} onChange={setPassword} newPassword disabled={pending} />
      <p className="text-xs text-muted-foreground">Mínimo 8 caracteres. Usa una contraseña única.</p>
      <PasswordInput id="confirm-password" label="Repetir contraseña" value={confirm} onChange={setConfirm} newPassword disabled={pending} />
      <Button type="submit" size="roomy" className="w-full" disabled={pending}>{pending ? "Guardando…" : "Guardar contraseña"}</Button>
    </form> : <div className="mt-6"><p className="text-sm text-muted-foreground">Abre el enlace que has recibido por correo para cambiar tu contraseña.</p><Button asChild className="mt-5"><Link to="/forgot-password">Solicitar un nuevo enlace</Link></Button></div>}
    {(error || accountError) && <p role="alert" className="mt-4 text-sm text-destructive">{error || accountError}</p>}
  </AuthShell>;
}