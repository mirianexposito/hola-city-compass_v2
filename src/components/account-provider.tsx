import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { storageKey } from "@/lib/city-session";

type Account = {
  user: User | null;
  ready: boolean;
  error: string;
  recovering: boolean;
  signOut: () => Promise<void>;
};
const AccountContext = createContext<Account | null>(null);
const guestAccount: Account = { user: null, ready: true, error: "", recovering: false, signOut: async () => {} };

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [recovering, setRecovering] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    let version = 0;
    async function refresh() {
      const current = ++version;
      try {
        const { data, error: failure } = await supabase.auth.getUser();
        if (!active || current !== version) return;
        setUser(failure ? null : data.user);
        if (!failure && data.user && sessionStorage.getItem("hola-ciudad-recovery") === data.user.id) {
          setRecovering(true);
          sessionStorage.setItem("hola-ciudad-recovery", data.user.id);
        }
        setReady(true);
      } catch {
        if (active && current === version) {
          setUser(null);
          setReady(true);
        }
      }
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED", "PASSWORD_RECOVERY"].includes(event)) return;
      // Do not await an Auth operation while the SDK is dispatching its event.
      if (event === "SIGNED_OUT") {
        ++version;
        setUser(null);
        setRecovering(false);
        sessionStorage.removeItem("hola-ciudad-recovery");
        setReady(true);
        setTimeout(() => {
          if (!active) return;
          void queryClient.cancelQueries().then(() => queryClient.clear());
          void router.invalidate();
        }, 0);
      } else setTimeout(() => {
        if (!active) return;
        if (event === "PASSWORD_RECOVERY") {
          // Only the SDK's verified recovery event can establish recovery state;
          // a hand-written URL hash must never promote a normal sign-in session.
          if (!session?.user.id) return;
          sessionStorage.setItem("hola-ciudad-recovery", session.user.id);
          setRecovering(true);
          void refresh().then(() => {
            if (active && router.state.location.pathname !== "/reset-password") void navigate({ to: "/reset-password", replace: true });
          });
        } else void refresh();
        void router.invalidate();
        void queryClient.invalidateQueries();
      }, 0);
    });
    void refresh();
    return () => { active = false; subscription.unsubscribe(); };
  }, [queryClient, router, navigate]);

  async function signOut() {
    setError("");
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      const { error: failure } = await supabase.auth.signOut();
      if (failure) throw failure;
      if (user) {
        try { localStorage.removeItem(`${storageKey}:user:${user.id}`); } catch { /* Scoped cache is never used by a guest. */ }
      }
      setUser(null);
      setRecovering(false);
      sessionStorage.removeItem("hola-ciudad-recovery");
      await navigate({ to: "/auth", replace: true });
    } catch {
      setError("No se pudo cerrar la sesión. Vuelve a intentarlo.");
    }
  }
  return <AccountContext.Provider value={{ user, ready, error, recovering, signOut }}>{children}</AccountContext.Provider>;
}

export function useAccount() { return useContext(AccountContext) ?? guestAccount; }