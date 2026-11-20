import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
  listUsers: vi.fn(),
  adminFrom: vi.fn(),
  adminLoaded: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  upsert: vi.fn(),
  single: vi.fn(),
  in: vi.fn(),
}));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    let validator: ((value: unknown) => unknown) | undefined;
    const chain = {
      middleware: () => chain,
      inputValidator: (value: (input: unknown) => unknown) => {
        validator = value;
        return chain;
      },
      handler:
        (handler: (input: unknown) => Promise<unknown>) =>
        (input: { data?: unknown; context: unknown }) =>
          handler({ ...input, data: validator ? validator(input.data) : input.data }),
    };
    return chain;
  },
}));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
vi.mock("@/integrations/supabase/client.server", () => {
  mocks.adminLoaded();
  return {
    supabaseAdmin: { auth: { admin: { listUsers: mocks.listUsers } }, from: mocks.adminFrom },
  };
});
import {
  getAccountDetails,
  listCityUsers,
  setAdministrator,
  updateAccountName,
} from "@/lib/user-management.functions";

const userId = "11111111-1111-4111-8111-111111111111";
const otherId = "22222222-2222-4222-8222-222222222222";
const context = { userId, supabase: { rpc: mocks.rpc, from: mocks.from } };
const invoke = (fn: unknown, data?: unknown) =>
  (fn as (input: unknown) => Promise<unknown>)({ context, data });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.rpc.mockResolvedValue({ data: false, error: null });
  mocks.from.mockReturnValue(mocks);
  mocks.adminFrom.mockReturnValue(mocks);
  mocks.select.mockReturnValue(mocks);
  mocks.eq.mockReturnValue(mocks);
  mocks.upsert.mockReturnValue(mocks);
});

describe("Personal accounts and administration permissions", () => {
  it("reads the name and role only for the authenticated caller", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { display_name: "Pilar" }, error: null });
    expect(await invoke(getAccountDetails)).toEqual({ displayName: "Pilar", isAdmin: false });
    expect(mocks.eq).toHaveBeenCalledWith("user_id", userId);
    expect(mocks.rpc).toHaveBeenCalledWith("has_role", { _user_id: userId, _role: "admin" });
  });
  it("ignores a supplied owner and role when a person changes their own name", async () => {
    mocks.single.mockResolvedValue({ data: { display_name: "Pilar" }, error: null });
    await invoke(updateAccountName, { displayName: " Pilar ", userId: otherId, role: "admin" });
    expect(mocks.upsert).toHaveBeenCalledWith(
      { user_id: userId, display_name: "Pilar" },
      { onConflict: "user_id" },
    );
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("rejects ordinary users before loading the privileged directory client", async () => {
    await expect(invoke(listCityUsers, { page: 1 })).rejects.toThrow("solo para administradores");
    expect(mocks.adminLoaded).not.toHaveBeenCalled();
    expect(mocks.listUsers).not.toHaveBeenCalled();
    expect(mocks.adminFrom).not.toHaveBeenCalled();
  });
  it("fails closed when the administrator role lookup fails", async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: new Error("role unavailable") });
    await expect(invoke(listCityUsers, { page: 1 })).rejects.toThrow();
    expect(mocks.listUsers).not.toHaveBeenCalled();
  });
  it("lets an administrator list accounts without exposing tokens or questionnaire answers", async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    mocks.listUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: otherId,
            email: "test@example.com",
            created_at: "2026-11-14",
            email_confirmed_at: "2026-11-14",
            user_metadata: { secret: "not-returned" },
          },
        ],
        nextPage: 2,
      },
      error: null,
    });
    mocks.in.mockResolvedValue({
      data: [{ user_id: otherId, display_name: "Prueba" }],
      error: null,
    });
    expect(await invoke(listCityUsers, { page: 1 })).toEqual({
      users: [
        {
          id: otherId,
          email: "test@example.com",
          createdAt: "2026-11-14",
          displayName: "Prueba",
          verified: true,
          isAdmin: true,
          isSelf: false,
        },
      ],
      hasNext: true,
      page: 1,
    });
    expect(mocks.listUsers).toHaveBeenCalledWith({ page: 1, perPage: 20 });
    expect(mocks.select).toHaveBeenCalledWith("user_id, display_name");
  });
  it("does not let an ordinary account change permissions", async () => {
    await expect(invoke(setAdministrator, { userId: otherId, enabled: true })).rejects.toThrow(
      "Solo una persona administradora",
    );
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });
  it("does not let the administrator demote their own account", async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    await expect(invoke(setAdministrator, { userId, enabled: false })).rejects.toThrow(
      "propio permiso",
    );
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });
  it("changes another account's permission only through the transactional role function", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    expect(await invoke(setAdministrator, { userId: otherId, enabled: true })).toEqual({
      updated: true,
    });
    expect(mocks.rpc).toHaveBeenLastCalledWith("set_city_administrator", {
      target_user: otherId,
      enabled: true,
    });
    expect(mocks.adminFrom).not.toHaveBeenCalled();
  });
  it("surfaces database rejection instead of reporting a forbidden role change as saved", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: null, error: new Error("last administrator") });
    await expect(invoke(setAdministrator, { userId: otherId, enabled: false })).rejects.toThrow(
      "debe quedar una persona administradora",
    );
  });
});
