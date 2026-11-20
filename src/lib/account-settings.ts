import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export async function changeAccountEmail(email: string, origin: string) {
  const validated = z.string().trim().email().parse(email);
  const { error } = await supabase.auth.updateUser(
    { email: validated },
    { emailRedirectTo: `${origin}/auth` },
  );
  if (error) throw error;
}

export async function changeAccountPassword(currentPassword: string, password: string) {
  z.string().min(8).max(128).parse(password);
  if (!currentPassword) throw new Error("Introduce tu contraseña actual.");
  const { error } = await supabase.auth.updateUser({ password, current_password: currentPassword });
  if (error) throw error;
}
