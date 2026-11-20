import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  LockKeyhole,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { useAccount } from "@/components/account-provider";
import { accountDetailsOptions } from "@/lib/user-management-query";
import { updateAccountName } from "@/lib/user-management.functions";
import { changeAccountEmail, changeAccountPassword } from "@/lib/account-settings";
import { authError } from "@/lib/auth-flow";
import { pageHead } from "@/lib/metadata";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/cuenta")({
  head: () =>
    pageHead(
      "Mi cuenta",
      "Gestiona tu nombre, correo verificado y contraseña de Hola Zaragoza de forma privada.",
    ),
  loader: async ({ context }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error("No se pudo validar tu cuenta.");
    await context.queryClient.ensureQueryData(accountDetailsOptions(data.user.id));
    return { userId: data.user.id };
  },
  errorComponent: ({ reset }) => (
    <section className="page-width py-12">
      <h1>Mi cuenta</h1>
      <p role="alert" className="my-5 text-destructive">
        No se pudo cargar tu cuenta.
      </p>
      <Button onClick={reset}>Volver a intentar</Button>
    </section>
  ),
  component: AccountPage,
});

function AccountPage() {
  const { userId } = Route.useLoaderData();
  const { data: details } = useSuspenseQuery(accountDetailsOptions(userId));
  const { user, signOut } = useAccount();
  const queryClient = useQueryClient();
  const saveName = useServerFn(updateAccountName);
  const [name, setName] = useState(details.displayName);
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState<{ area: string; message: string; error: boolean } | null>(
    null,
  );
  useEffect(() => {
    setEmail(user?.email ?? "");
  }, [user?.email]);
  const feedback = (area: string) =>
    notice?.area === area && (
      <p
        role={notice.error ? "alert" : "status"}
        className={`mt-3 text-sm ${notice.error ? "text-destructive" : "text-secondary-foreground"}`}
      >
        {notice.message}
      </p>
    );

  return (
    <section className="page-width pb-12">
      <header className="page-heading">
        <span className="eyebrow text-primary">TU ESPACIO PERSONAL</span>
        <h1 className="mt-3">
          Mi cuenta<span className="text-primary">.</span>
        </h1>
        <p className="break-all">{user?.email}</p>
        <span className="mt-3 inline-flex items-center gap-2 text-sm text-secondary-foreground">
          <ShieldCheck className="size-4" />
          {details.isAdmin ? "Administradora" : "Cuenta personal"}
          <span aria-hidden="true">·</span>
          <Check className="size-4" />
          Correo verificado
        </span>
      </header>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <form
            className="border-b border-border pb-8"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy("name");
              setNotice(null);
              try {
                const result = await saveName({ data: { displayName: name } });
                queryClient.setQueryData(accountDetailsOptions(userId).queryKey, {
                  ...details,
                  displayName: result.displayName,
                });
                setName(result.displayName);
                await queryClient.invalidateQueries({ queryKey: ["city-users"] });
                setNotice({ area: "name", message: "Nombre guardado en tu cuenta.", error: false });
              } catch {
                setNotice({
                  area: "name",
                  message: "No se pudo guardar tu nombre. Vuelve a intentarlo.",
                  error: true,
                });
              } finally {
                setBusy("");
              }
            }}
          >
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
              <UserRound className="size-5 text-primary" />
              Datos personales
            </h2>
            <label htmlFor="account-name" className="filter-label">
              Nombre
            </label>
            <Input
              id="account-name"
              value={name}
              maxLength={80}
              autoComplete="nickname"
              onChange={(event) => setName(event.target.value)}
              disabled={Boolean(busy)}
              className="h-12"
            />
            <Button type="submit" className="mt-4" disabled={Boolean(busy)}>
              <Save />
              {busy === "name" ? "Guardando…" : "Guardar nombre"}
            </Button>
            {feedback("name")}
          </form>
          <form
            className="mt-8"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy("email");
              setNotice(null);
              try {
                await changeAccountEmail(email, window.location.origin);
                setNotice({
                  area: "email",
                  message:
                    "Revisa los mensajes de confirmación en tu correo actual y en el nuevo. El cambio no se completa hasta confirmarlo.",
                  error: false,
                });
              } catch (error) {
                setNotice({ area: "email", message: authError(error), error: true });
              } finally {
                setBusy("");
              }
            }}
          >
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
              <Mail className="size-5 text-primary" />
              Correo electrónico
            </h2>
            <label htmlFor="account-email" className="filter-label">
              Nuevo correo
            </label>
            <Input
              id="account-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={Boolean(busy)}
              className="h-12"
            />
            <Button
              type="submit"
              variant="outline"
              className="mt-4"
              disabled={Boolean(busy) || email.trim() === user?.email}
            >
              <Mail />
              {busy === "email" ? "Enviando…" : "Cambiar correo"}
            </Button>
            {feedback("email")}
          </form>
        </div>
        <div className="min-w-0">
          <form
            className="border-b border-border pb-8"
            onSubmit={async (event) => {
              event.preventDefault();
              setNotice(null);
              if (password !== confirmation) {
                setNotice({
                  area: "password",
                  message: "Las contraseñas nuevas no coinciden.",
                  error: true,
                });
                return;
              }
              setBusy("password");
              try {
                await changeAccountPassword(currentPassword, password);
                setCurrentPassword("");
                setPassword("");
                setConfirmation("");
                setNotice({ area: "password", message: "Contraseña actualizada.", error: false });
              } catch (error) {
                setNotice({ area: "password", message: authError(error), error: true });
              } finally {
                setBusy("");
              }
            }}
          >
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
              <LockKeyhole className="size-5 text-primary" />
              Seguridad
            </h2>
            <div className="space-y-4">
              <PasswordInput
                id="current-password"
                label="Contraseña actual"
                value={currentPassword}
                onChange={setCurrentPassword}
                disabled={Boolean(busy)}
              />
              <PasswordInput
                id="account-password"
                label="Nueva contraseña"
                value={password}
                onChange={setPassword}
                newPassword
                disabled={Boolean(busy)}
              />
              <PasswordInput
                id="confirm-password"
                label="Repetir nueva contraseña"
                value={confirmation}
                onChange={setConfirmation}
                newPassword
                disabled={Boolean(busy)}
              />
            </div>
            <Button type="submit" variant="outline" className="mt-4" disabled={Boolean(busy)}>
              <LockKeyhole />
              {busy === "password" ? "Guardando…" : "Actualizar contraseña"}
            </Button>
            <Button asChild variant="link" className="mt-2">
              <Link to="/forgot-password">He olvidado mi contraseña</Link>
            </Button>
            {feedback("password")}
          </form>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="default">
              <Link to="/onboarding">
                Mis preferencias
                <ArrowUpRight />
              </Link>
            </Button>
            {details.isAdmin && (
              <Button asChild variant="outline">
                <Link to="/usuarios">
                  <ShieldCheck />
                  Administrar usuarios
                </Link>
              </Button>
            )}
            <Button variant="ghost" disabled={Boolean(busy)} onClick={() => void signOut()}>
              <LogOut />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
