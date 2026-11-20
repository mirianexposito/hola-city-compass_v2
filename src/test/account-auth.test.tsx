import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AccountProvider, useAccount } from "@/components/account-provider";
import { storageKey } from "@/lib/city-session";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), signOut: vi.fn(), onAuthStateChange: vi.fn(), cancelQueries: vi.fn(), clear: vi.fn(), invalidateQueries: vi.fn(), invalidate: vi.fn(), navigate: vi.fn(), unsubscribe: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: mocks } }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => mocks }));
const router = { invalidate: mocks.invalidate, state: { location: { pathname: "/auth" } } };
vi.mock("@tanstack/react-router", () => ({ useRouter: () => router, useNavigate: () => mocks.navigate }));
let listener: (event: string, session?: { user: { id: string } }) => void;
beforeEach(() => {
  vi.resetAllMocks(); localStorage.clear(); sessionStorage.clear();
  window.history.replaceState(null, "", "/auth");
  mocks.getUser.mockResolvedValue({ data: { user: { id: "account-a", email_confirmed_at: "2026-11-13" } }, error: null });
  mocks.signOut.mockResolvedValue({ error: null });
  mocks.cancelQueries.mockResolvedValue(undefined);
  mocks.navigate.mockResolvedValue(undefined);
  mocks.onAuthStateChange.mockImplementation((callback) => { listener = callback; return { data: { subscription: { unsubscribe: mocks.unsubscribe } } }; });
});
function wrapper({ children }: { children: ReactNode }) { return <AccountProvider>{children}</AccountProvider>; }
describe("Persistent account and recovery lifecycle", () => {
  it("restores only an identity revalidated by Cloud Auth", async () => {
    const hook = renderHook(useAccount, { wrapper });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(hook.result.current.user?.id).toBe("account-a");
    expect(mocks.getUser).toHaveBeenCalledOnce();
    hook.unmount();
  });
  it("does not accept a stale or invalid persisted session", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error("invalid token") });
    const hook = renderHook(useAccount, { wrapper });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(hook.result.current.user).toBeNull(); hook.unmount();
  });
  it("cancels queries, clears private cache, signs out and replaces the protected history entry", async () => {
    localStorage.setItem(`${storageKey}:user:account-a`, "private-state");
    const hook = renderHook(useAccount, { wrapper });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    await act(async () => { await hook.result.current.signOut(); });
    expect(mocks.cancelQueries.mock.invocationCallOrder[0]).toBeLessThan(mocks.clear.mock.invocationCallOrder[0] ?? 0);
    expect(mocks.clear.mock.invocationCallOrder[0]).toBeLessThan(mocks.signOut.mock.invocationCallOrder[0] ?? 0);
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/auth", replace: true });
    expect(hook.result.current.user).toBeNull();
    expect(localStorage.getItem(`${storageKey}:user:account-a`)).toBeNull(); hook.unmount();
  });
  it("never promotes a forged recovery hash to password recovery", async () => {
    window.history.replaceState(null, "", "/reset-password#type=recovery");
    const hook = renderHook(useAccount, { wrapper });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(hook.result.current.recovering).toBe(false);
    expect(sessionStorage.getItem("hola-ciudad-recovery")).toBeNull(); hook.unmount();
  });
  it("accepts recovery only after the SDK validates the real recovery session", async () => {
    const hook = renderHook(useAccount, { wrapper });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    act(() => listener("PASSWORD_RECOVERY", { user: { id: "account-a" } }));
    await waitFor(() => expect(hook.result.current.recovering).toBe(true));
    expect(sessionStorage.getItem("hola-ciudad-recovery")).toBe("account-a");
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/reset-password", replace: true }); hook.unmount();
  });
  it("ignores token refresh events rather than refetching private data", async () => {
    const hook = renderHook(useAccount, { wrapper });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    act(() => listener("TOKEN_REFRESHED"));
    expect(mocks.getUser).toHaveBeenCalledOnce();
    expect(mocks.invalidateQueries).not.toHaveBeenCalled(); hook.unmount();
  });
});