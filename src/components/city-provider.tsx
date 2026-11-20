import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAccount } from "./account-provider";
import { readProfile, writeProfile, removeProfile } from "@/lib/profile-storage";
import { fromProfileRecord } from "@/lib/profile-record";
import { type Preferences } from "@/lib/city-logic";
import {
  decodeCityState,
  newCityState,
  storageKey,
  type CityState,
  type Message,
} from "@/lib/city-session";
import type { PlanDay } from "@/lib/itinerary";
export type { Message } from "@/lib/city-session";
type Context = {
  state: CityState;
  ready: boolean;
  profileError: string;
  retryProfile: () => void;
  updatePreferences: (p: Preferences, completed?: boolean) => void;
  toggleFavorite: (id: string) => void;
  setMessages: (m: Message[]) => void;
  markViewed: (id: string) => void;
  discardActivity: (id: string) => void;
  restoreDiscarded: () => void;
  toggleCompleted: (id: string) => void;
  learnInterests: (interests: string[]) => void;
  nextRecommendations: () => void;
  setItinerary: (plan: PlanDay[]) => void;
  toggleDay: (day: number) => void;
  resetProfile: () => Promise<void>;
  saveProfile: (p: Preferences, completed?: boolean) => Promise<void>;
};
const SessionContext = createContext<Context | null>(null);
export function CityProvider({ children }: { children: ReactNode }) {
  const account = useAccount();
  const userId = account.user?.id;
  const scope = userId ? `${storageKey}:user:${userId}` : storageKey;
  const [state, setState] = useState<CityState>(newCityState);
  const [loaded, setLoaded] = useState(false);
  const [stateScope, setStateScope] = useState("");
  const [profileError, setProfileError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const currentScope = useRef("");
  const ready = account.ready && loaded && stateScope === scope;
  useEffect(() => {
    if (!account.ready) return;
    let active = true;
    currentScope.current = scope;
    setLoaded(false);
    setProfileError("");
    setState(newCityState());
    async function restore() {
      let restored = newCityState();
      let hasAccountCache = false;
      try {
        const local = localStorage.getItem(scope);
        hasAccountCache = Boolean(userId && local);
        const old = userId ? null : sessionStorage.getItem("hola-ciudad-session-v1");
        const hadAccountOwner = Boolean(localStorage.getItem("hola-ciudad-profile-owner"));
        restored = hadAccountOwner ? newCityState() : decodeCityState(local ?? old);
        if (hadAccountOwner) {
          localStorage.removeItem("hola-ciudad-profile-owner");
          localStorage.removeItem(storageKey);
          sessionStorage.removeItem("hola-ciudad-session-v1");
        }
        if (!local && old) {
          localStorage.setItem(scope, JSON.stringify(restored));
          sessionStorage.removeItem("hola-ciudad-session-v1");
        }
      } catch { /* Remain usable without browser storage. */ }
      if (userId) {
        try {
          const row = await readProfile(userId);
          if (row?.onboarding_completed) {
            restored = { ...restored, preferences: fromProfileRecord(row), completed: true };
          } else if (!restored.completed && !hasAccountCache) {
            // A new account can explicitly save this browser's guest answers; never overwrite a saved account profile.
            try {
              const guest = decodeCityState(localStorage.getItem(storageKey));
              restored = { ...restored, preferences: guest.preferences, completed: guest.completed };
              if (guest.completed) await writeProfile(userId, guest.preferences, true);
            } catch { /* Leave a blank questionnaire. */ }
          }
        } catch {
          if (active) setProfileError("No se pudo recuperar tu perfil. Vuelve a intentarlo antes de guardar cambios.");
        }
      }
      if (active) {
        setState(restored);
        setStateScope(scope);
        setLoaded(true);
      }
    }
    void restore();
    return () => { active = false; };
  }, [account.ready, scope, userId, attempt]);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(scope, JSON.stringify(state));
      } catch {
        /* Retain memory when local storage is blocked. */
      }
  }, [state, ready, scope]);
  const saveProfile = async (preferences: Preferences, completed = true) => {
    if (!ready) throw new Error("Espera a recuperar tus respuestas.");
    if (profileError) throw new Error(profileError);
    if (userId) await writeProfile(userId, preferences, completed);
    if (currentScope.current !== scope) return;
    const next = { ...state, preferences, completed, round: 0 };
    try {
      localStorage.setItem(scope, JSON.stringify(next));
    } catch {
      if (!userId) throw new Error(
        "No se pudo guardar en este navegador. Permite el almacenamiento y vuelve a intentarlo.",
      );
    }
    setState((current) => ({ ...current, preferences, completed, round: 0 }));
  };
  const updatePreferences = (preferences: Preferences, completed = state.completed) =>
    setState((s) => ({ ...s, preferences, completed, round: 0 }));
  const toggleFavorite = (id: string) =>
    setState((s) => ({
      ...s,
      favorites: s.favorites.includes(id)
        ? s.favorites.filter((f) => f !== id)
        : [...s.favorites, id],
    }));
  const setMessages = (messages: Message[]) => setState((s) => ({ ...s, messages }));
  const markViewed = (id: string) =>
    setState((s) => (s.viewed.includes(id) ? s : { ...s, viewed: [...s.viewed, id] }));
  const discardActivity = (id: string) =>
    setState((s) => ({ ...s, discarded: [...new Set([...s.discarded, id])] }));
  const restoreDiscarded = () => setState((s) => ({ ...s, discarded: [] }));
  const toggleCompleted = (id: string) =>
    setState((s) => {
      const done = !s.completedActivities.includes(id);
      return {
        ...s,
        completedActivities: done
          ? [...s.completedActivities, id]
          : s.completedActivities.filter((x) => x !== id),
        itinerary: s.itinerary.map((d) => (d.activityId === id ? { ...d, done } : d)),
      };
    });
  const learnInterests = (interests: string[]) =>
    setState((s) => ({
      ...s,
      learnedInterests: [...new Set([...s.learnedInterests, ...interests])],
    }));
  const nextRecommendations = () => setState((s) => ({ ...s, round: s.round + 1 }));
  const setItinerary = (itinerary: PlanDay[]) => setState((s) => ({ ...s, itinerary }));
  const toggleDay = (day: number) =>
    setState((s) => {
      const target = s.itinerary.find((d) => d.day === day);
      if (!target) return s;
      const done = !target.done;
      return {
        ...s,
        itinerary: s.itinerary.map((d) => (d.day === day ? { ...d, done } : d)),
        completedActivities: target.activityId
          ? done
            ? [...new Set([...s.completedActivities, target.activityId])]
            : s.completedActivities.filter((id) => id !== target.activityId)
          : s.completedActivities,
      };
    });
  const resetProfile = async () => {
    if (!ready) throw new Error("Espera a recuperar tus respuestas.");
    if (userId) await removeProfile(userId);
    if (currentScope.current !== scope) return;
    try {
      localStorage.removeItem(scope);
      if (!userId) sessionStorage.removeItem("hola-ciudad-session-v1");
    } catch {
      if (!userId) throw new Error("No se pudo borrar el perfil de este navegador. Vuelve a intentarlo.");
    }
    setState(newCityState());
  };
  return (
    <SessionContext.Provider
      value={{
        state: stateScope === scope ? state : newCityState(),
        ready,
        profileError,
        retryProfile: () => setAttempt((value) => value + 1),
        updatePreferences,
        toggleFavorite,
        setMessages,
        markViewed,
        discardActivity,
        restoreDiscarded,
        toggleCompleted,
        learnInterests,
        nextRecommendations,
        setItinerary,
        toggleDay,
        resetProfile,
        saveProfile,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
export function useCity() {
  const c = useContext(SessionContext);
  if (!c) throw new Error("CityProvider is required");
  return c;
}
