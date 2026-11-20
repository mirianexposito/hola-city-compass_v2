import { supabase } from "@/integrations/supabase/client";
import type { Preferences } from "./city-logic";
import { toProfileRecord } from "./profile-record";

export async function readProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function writeProfile(userId: string, preferences: Preferences, completed: boolean) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(toProfileRecord(userId, preferences, completed), { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function removeProfile(userId: string) {
  const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
  if (error) throw error;
}
