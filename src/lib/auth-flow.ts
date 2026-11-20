import { supabase } from "@/integrations/supabase/client";

export const appPaths = [
  "/",
  "/mi-zaragoza",
  "/onboarding",
  "/planes",
  "/compañero",
  "/conoce-gente",
  "/informacion",
  "/como-funciona",
  "/creditos",
  "/primeros-dias",
  "/cuenta",
  "/usuarios",
] as const;
export function safeDestination(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\x00-\x20]/.test(value)
  )
    return "/mi-zaragoza";
  try {
    const url = new URL(value, "https://app.local");
    if (
      url.origin !== "https://app.local" ||
      !appPaths.some((path) => path === decodeURIComponent(url.pathname))
    )
      return "/mi-zaragoza";
    return `${url.pathname}${url.search}`;
  } catch {
    return "/mi-zaragoza";
  }
}

export function authError(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code === "invalid_credentials") return "El correo o la contraseña no son correctos.";
  if (code === "email_not_confirmed")
    return "Confirma tu correo antes de iniciar sesión. Puedes reenviar el mensaje desde Crear cuenta.";
  if (["over_email_send_rate_limit", "over_request_rate_limit"].includes(code))
    return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
  if (["otp_expired", "otp_disabled"].includes(code))
    return "El enlace ha caducado o ya se ha utilizado. Solicita uno nuevo.";
  if (code === "same_password") return "Elige una contraseña distinta a la anterior.";
  if (["weak_password", "validation_failed"].includes(code))
    return "Revisa el correo y usa una contraseña más segura.";
  return "No se ha podido completar la operación. Vuelve a intentarlo.";
}

export async function registerAccount(
  email: string,
  password: string,
  origin: string,
  displayName = "",
) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: `${origin}/auth`,
      data: { display_name: displayName.trim().slice(0, 100) },
    },
  });
  if (error) throw error;
  return data;
}
export async function loginAccount(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  const { data, error: validationError } = await supabase.auth.getUser();
  if (validationError || !data.user?.email_confirmed_at)
    throw validationError ?? new Error("Unverified account");
  return data.user;
}
export async function sendRecovery(email: string, origin: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/reset-password`,
  });
  // Do not reveal whether an address is registered.
  if (error) throw error;
}
export async function resendVerification(email: string, origin: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
    options: { emailRedirectTo: `${origin}/auth` },
  });
  if (error) throw error;
}
export async function resetRecoveryPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
