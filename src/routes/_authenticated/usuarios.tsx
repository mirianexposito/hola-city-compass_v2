import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { accountDetailsOptions, cityUsersOptions } from "@/lib/user-management-query";
import { setAdministrator } from "@/lib/user-management.functions";
import { pageHead } from "@/lib/metadata";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () =>
    pageHead(
      "Administración de usuarios",
      "Gestión privada de cuentas y permisos de Hola Zaragoza, exclusiva para la administración.",
    ),
  loader: async ({ context }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error("No se pudo validar tu cuenta.");
    const details = await context.queryClient.ensureQueryData({
      ...accountDetailsOptions(data.user.id),
      staleTime: 0,
    });
    if (details.isAdmin)
      await context.queryClient.ensureQueryData(cityUsersOptions(data.user.id, 1));
    return { userId: data.user.id, allowed: details.isAdmin };
  },
  errorComponent: ({ reset }) => (
    <section className="page-width py-12">
      <h1>Usuarios</h1>
      <p role="alert" className="my-5 text-destructive">
        No se pudieron consultar los usuarios. Comprueba tus permisos y vuelve a intentarlo.
      </p>
      <Button onClick={reset}>Volver a intentar</Button>
    </section>
  ),
  component: UsersPage,
});

function UsersPage() {
  const { userId, allowed } = Route.useLoaderData();
  if (!allowed)
    return (
      <section className="page-width py-12">
        <ShieldCheck className="mb-5 size-10 text-primary" />
        <h1>
          Acceso reservado<span className="text-primary">.</span>
        </h1>
        <p role="alert" className="my-5 text-muted-foreground">
          Solo la administración puede gestionar los usuarios de Hola Zaragoza.
        </p>
        <Button asChild>
          <Link to="/cuenta">Volver a mi cuenta</Link>
        </Button>
      </section>
    );
  return (
    <Suspense
      fallback={
        <p role="status" className="page-width py-12">
          Consultando usuarios…
        </p>
      }
    >
      <UsersDirectory userId={userId} />
    </Suspense>
  );
}

function UsersDirectory({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data } = useSuspenseQuery(cityUsersOptions(userId, page));
  const queryClient = useQueryClient();
  const changeRole = useServerFn(setAdministrator);
  const [selected, setSelected] = useState<(typeof data.users)[number] | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null);
  const users = data.users.filter((user) =>
    `${user.email} ${user.displayName}`
      .toLocaleLowerCase("es")
      .includes(search.trim().toLocaleLowerCase("es")),
  );
  return (
    <section className="page-width pb-12">
      <header className="page-heading">
        <span className="eyebrow text-primary">ADMINISTRACIÓN</span>
        <h1 className="mt-3">
          Usuarios<span className="text-primary">.</span>
        </h1>
        <p>Cuentas de Hola Zaragoza</p>
      </header>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <label className="relative w-full max-w-md">
          <span className="filter-label">Buscar en esta página</span>
          <Search className="absolute bottom-3.5 left-3 size-4 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Buscar usuarios en esta página"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre o correo"
            className="h-12 pl-10"
          />
        </label>
        <Button
          variant="outline"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setFeedback(null);
            try {
              await queryClient.invalidateQueries(
                { queryKey: ["city-users", userId, page] },
                { throwOnError: true },
              );
            } catch {
              setFeedback({ error: true, message: "No se pudieron actualizar los usuarios." });
            } finally {
              setBusy(false);
            }
          }}
        >
          <RefreshCw />
          Actualizar
        </Button>
      </div>
      {feedback && (
        <p
          role={feedback.error ? "alert" : "status"}
          className={`mb-5 text-sm ${feedback.error ? "text-destructive" : "text-secondary-foreground"}`}
        >
          {feedback.message}
        </p>
      )}
      <div className="divide-y divide-border">
        {users.map((user) => (
          <article
            key={user.id}
            className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
          >
            <div className="min-w-0">
              <h2 className="flex flex-wrap items-center gap-2 text-base font-bold">
                <Users className="size-4 shrink-0 text-primary" />
                <span className="break-words">{user.displayName || "Sin nombre"}</span>
                {user.isSelf && (
                  <span className="text-xs font-normal text-muted-foreground">Tu cuenta</span>
                )}
              </h2>
              <p className="mt-1 break-all text-sm">{user.email || "Sin correo"}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Alta: {new Date(user.createdAt).toLocaleDateString("es-ES")}
                <span aria-hidden="true"> · </span>
                {user.verified ? "Correo verificado" : "Pendiente de verificación"}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 text-sm ${user.isAdmin ? "text-primary" : "text-muted-foreground"}`}
              >
                {user.isAdmin && <ShieldCheck className="size-4" />}
                {user.isAdmin ? "Administración" : "Usuario"}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={busy || user.isSelf || !user.verified}
                onClick={() => {
                  setSelected(user);
                  setFeedback(null);
                }}
              >
                Cambiar permisos
              </Button>
            </div>
          </article>
        ))}
      </div>
      {users.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No hay cuentas que coincidan en esta página.
        </p>
      )}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
        <Button
          variant="outline"
          disabled={page === 1 || busy}
          onClick={() => {
            setPage((value) => value - 1);
            setSearch("");
          }}
        >
          <ChevronLeft />
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">Página {page}</span>
        <Button
          variant="outline"
          disabled={!data.hasNext || busy}
          onClick={() => {
            setPage((value) => value + 1);
            setSearch("");
          }}
        >
          Siguiente
          <ChevronRight />
        </Button>
      </div>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open && !busy) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogTitle>
            {selected?.isAdmin ? "Retirar administración" : "Dar acceso de administración"}
          </DialogTitle>
          <DialogDescription className="break-all">
            {selected?.email}.{" "}
            {selected?.isAdmin
              ? "Esta persona conservará su cuenta personal, pero dejará de gestionar usuarios."
              : "Esta persona podrá consultar los correos de los usuarios y cambiar sus permisos."}
          </DialogDescription>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={busy || !selected}
              onClick={async () => {
                if (!selected) return;
                setBusy(true);
                try {
                  await changeRole({ data: { userId: selected.id, enabled: !selected.isAdmin } });
                  await queryClient.invalidateQueries({ queryKey: ["city-users"] });
                  await queryClient.invalidateQueries({
                    queryKey: ["account-details", selected.id],
                  });
                  setFeedback({ error: false, message: "Permisos actualizados." });
                  setSelected(null);
                } catch (error) {
                  setFeedback({
                    error: true,
                    message:
                      error instanceof Error
                        ? error.message
                        : "No se pudieron cambiar los permisos.",
                  });
                  setSelected(null);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <ShieldCheck />
              {busy ? "Guardando…" : "Confirmar cambio"}
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => setSelected(null)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
