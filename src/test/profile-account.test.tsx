import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CityProvider, useCity } from "@/components/city-provider";
import { defaultPreferences } from "@/lib/city-logic";
import { decodeCityState, newCityState, storageKey } from "@/lib/city-session";
import { toProfileRecord } from "@/lib/profile-record";

const account = vi.hoisted(() => ({ user: { id: "owner-a" } as { id: string } | null, ready: true }));
const cloud = vi.hoisted(() => ({ readProfile: vi.fn(), writeProfile: vi.fn(), removeProfile: vi.fn() }));
vi.mock("@/components/account-provider", () => ({ useAccount: () => account }));
vi.mock("@/lib/profile-storage", () => cloud);
const preferences = { ...defaultPreferences, neighborhood: "Casetas", goals: ["Encontrar voluntariado"], desiredActivities: ["Aprender cerámica"] };
const row = { ...toProfileRecord("owner-a", preferences, true), created_at: "2026-11-13T19:00:00Z", updated_at: "2026-11-13T19:00:00Z" };
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); vi.resetAllMocks();
  account.user = { id: "owner-a" }; account.ready = true;
  cloud.readProfile.mockResolvedValue(row);
  cloud.writeProfile.mockResolvedValue(row);
  cloud.removeProfile.mockResolvedValue(undefined);
});

describe("Profile with an account", () => {
  it("recovers the saved questionnaire in a browser with no local answers", async () => {
    const hook = renderHook(() => useCity(), { wrapper: CityProvider });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(cloud.readProfile).toHaveBeenCalledWith("owner-a");
    expect(hook.result.current.state.preferences).toEqual(preferences);
    expect(hook.result.current.state.completed).toBe(true);
    hook.unmount();
  });
  it("saves free answers only to the signed-in owner's profile and cache", async () => {
    const hook = renderHook(() => useCity(), { wrapper: CityProvider });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    await act(async () => { await hook.result.current.saveProfile(preferences); });
    expect(cloud.writeProfile).toHaveBeenCalledWith("owner-a", preferences, true);
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(decodeCityState(localStorage.getItem(`${storageKey}:user:owner-a`)).preferences).toEqual(preferences);
    hook.unmount();
  });
  it("does not report a successful save when the account write fails", async () => {
    const hook = renderHook(() => useCity(), { wrapper: CityProvider });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    cloud.writeProfile.mockRejectedValue(new Error("save failed"));
    await expect(hook.result.current.saveProfile({ ...preferences, neighborhood: "San José" })).rejects.toThrow("save failed");
    expect(hook.result.current.state.preferences.neighborhood).toBe("Casetas");
    hook.unmount();
  });
  it("restores guest answers on sign-out rather than exposing the account's answers", async () => {
    localStorage.setItem(storageKey, JSON.stringify({ ...newCityState(), preferences: { ...defaultPreferences, neighborhood: "San José" } }));
    const hook = renderHook(() => useCity(), { wrapper: CityProvider });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(hook.result.current.state.preferences.neighborhood).toBe("Casetas");
    account.user = null; hook.rerender();
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(hook.result.current.state.preferences.neighborhood).toBe("San José");
    hook.unmount();
  });
  it("does not overwrite an existing account profile with guest answers", async () => {
    localStorage.setItem(storageKey, JSON.stringify({ ...newCityState(), preferences: { ...defaultPreferences, neighborhood: "San José" }, completed: true }));
    const hook = renderHook(() => useCity(), { wrapper: CityProvider });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(hook.result.current.state.preferences.neighborhood).toBe("Casetas");
    expect(cloud.writeProfile).not.toHaveBeenCalled();
    hook.unmount();
  });
  it("blocks saves after a failed profile read so stored answers cannot be overwritten", async () => {
    cloud.readProfile.mockRejectedValue(new Error("read failed"));
    const hook = renderHook(() => useCity(), { wrapper: CityProvider });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    await expect(hook.result.current.saveProfile(preferences)).rejects.toThrow();
    expect(cloud.writeProfile).not.toHaveBeenCalled();
    hook.unmount();
  });
  it("resets only the current account, preserving the separate guest profile", async () => {
    localStorage.setItem(storageKey, JSON.stringify({ ...newCityState(), preferences, completed: true }));
    const hook = renderHook(() => useCity(), { wrapper: CityProvider });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    await act(async () => { await hook.result.current.resetProfile(); });
    expect(cloud.removeProfile).toHaveBeenCalledWith("owner-a");
    expect(hook.result.current.state.completed).toBe(false);
    expect(decodeCityState(localStorage.getItem(storageKey)).completed).toBe(true);
    hook.unmount();
    cloud.readProfile.mockResolvedValue(null);
    const restored = renderHook(() => useCity(), { wrapper: CityProvider });
    await waitFor(() => expect(restored.result.current.ready).toBe(true));
    expect(restored.result.current.state.completed).toBe(false);
    restored.unmount();
  });
});