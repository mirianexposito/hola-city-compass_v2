import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CityProvider, useCity } from "@/components/city-provider";
import { defaultPreferences } from "@/lib/city-logic";
import { decodeCityState, newCityState, storageKey } from "@/lib/city-session";

const cloud = vi.hoisted(() => ({
  readProfile: vi.fn(),
  writeProfile: vi.fn(),
  removeProfile: vi.fn(),
}));
vi.mock("@/components/account-provider", () => ({ useAccount: () => ({ user: null, ready: true }) }));
vi.mock("@/lib/profile-storage", () => cloud);
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe("Profile without sign-in", () => {
  it("saves and restores questionnaire answers without Cloud calls or an account", async () => {
    const preferences = {
      ...defaultPreferences,
      neighborhood: "Casetas",
      goals: ["Encontrar voluntariado"],
      desiredActivities: ["Aprender cerámica"],
    };
    const first = renderHook(() => useCity(), { wrapper: CityProvider });
    await waitFor(() => expect(first.result.current.ready).toBe(true));
    await act(async () => {
      await first.result.current.saveProfile(preferences, true);
    });
    expect(decodeCityState(localStorage.getItem(storageKey)).preferences).toEqual(preferences);
    first.unmount();
    const restored = renderHook(() => useCity(), { wrapper: CityProvider });
    await waitFor(() => expect(restored.result.current.ready).toBe(true));
    expect(restored.result.current.state.preferences).toEqual(preferences);
    expect(restored.result.current.state.completed).toBe(true);
    expect(cloud.readProfile).not.toHaveBeenCalled();
    expect(cloud.writeProfile).not.toHaveBeenCalled();
    restored.unmount();
  });
  it("resets the local profile without deleting any Cloud record", async () => {
    const hook = renderHook(() => useCity(), { wrapper: CityProvider });
    await act(async () => {
      await hook.result.current.saveProfile({ ...defaultPreferences, neighborhood: "San José" });
    });
    await act(async () => {
      await hook.result.current.resetProfile();
    });
    expect(hook.result.current.state.preferences.neighborhood).toBe("");
    expect(decodeCityState(localStorage.getItem(storageKey)).completed).toBe(false);
    expect(cloud.removeProfile).not.toHaveBeenCalled();
    hook.unmount();
  });
  it("does not restore local answers belonging to a previous signed-in account", async () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...newCityState(),
        preferences: { ...defaultPreferences, neighborhood: "Casetas" },
        completed: true,
      }),
    );
    localStorage.setItem("hola-ciudad-profile-owner", "previous-owner");
    const hook = renderHook(() => useCity(), { wrapper: CityProvider });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(hook.result.current.state.preferences.neighborhood).toBe("");
    expect(hook.result.current.state.completed).toBe(false);
    expect(localStorage.getItem("hola-ciudad-profile-owner")).toBeNull();
    hook.unmount();
  });
  it("reports a failed browser save rather than claiming the profile was saved", async () => {
    const hook = renderHook(() => useCity(), { wrapper: CityProvider });
    const storage = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    await expect(
      hook.result.current.saveProfile({ ...defaultPreferences, neighborhood: "Casetas" }),
    ).rejects.toThrow();
    expect(hook.result.current.state.completed).toBe(false);
    storage.mockRestore();
    hook.unmount();
  });
});
