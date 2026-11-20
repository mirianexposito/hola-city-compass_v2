import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAccountDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, role] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", context.userId)
        .maybeSingle(),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    ]);
    if (profile.error || role.error) throw new Error("No se pudo consultar tu cuenta.");
    return { displayName: profile.data?.display_name ?? "", isAdmin: role.data === true };
  });

export const updateAccountName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ displayName: z.string().trim().max(80) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .upsert(
        { user_id: context.userId, display_name: data.displayName },
        { onConflict: "user_id" },
      )
      .select("display_name")
      .single();
    if (error) throw new Error("No se pudo guardar tu nombre.");
    return { displayName: profile.display_name };
  });

export const listCityUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ page: z.number().int().min(1).max(100000).default(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    // Authorize through the caller's RLS client BEFORE loading the privileged client.
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || allowed !== true) throw new Error("Esta página es solo para administradores.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: accounts, error } = await supabaseAdmin.auth.admin.listUsers({
      page: data.page,
      perPage: 20,
    });
    if (error) throw new Error("No se pudieron consultar los usuarios.");
    const ids = accounts.users.map((user) => user.id);
    if (ids.length === 0) return { users: [], hasNext: false, page: data.page };
    const [profiles, roles] = await Promise.all([
      supabaseAdmin.from("profiles").select("user_id, display_name").in("user_id", ids),
      supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin").in("user_id", ids),
    ]);
    if (profiles.error || roles.error) throw new Error("No se pudieron consultar los usuarios.");
    return {
      users: accounts.users.map((user) => ({
        id: user.id,
        email: user.email ?? "",
        displayName:
          profiles.data?.find((profile) => profile.user_id === user.id)?.display_name ?? "",
        createdAt: user.created_at,
        verified: Boolean(user.email_confirmed_at),
        isAdmin: roles.data?.some((role) => role.user_id === user.id) ?? false,
        isSelf: user.id === context.userId,
      })),
      hasNext:
        "nextPage" in accounts &&
        typeof accounts.nextPage === "number" &&
        accounts.nextPage > data.page,
      page: data.page,
    };
  });

export const setAdministrator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), enabled: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || allowed !== true)
      throw new Error("Solo una persona administradora puede cambiar permisos.");
    if (data.userId === context.userId)
      throw new Error("No puedes cambiar tu propio permiso de administración.");
    // The transactional SQL function checks confirmation and guards the final administrator.
    const { error } = await context.supabase.rpc("set_city_administrator", {
      target_user: data.userId,
      enabled: data.enabled,
    });
    if (error)
      throw new Error(
        "No se pudieron cambiar los permisos. La cuenta debe estar verificada y debe quedar una persona administradora.",
      );
    return { updated: true };
  });
