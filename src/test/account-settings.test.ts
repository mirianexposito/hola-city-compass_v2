import { beforeEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ updateUser: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth } }));
import { changeAccountEmail, changeAccountPassword } from "@/lib/account-settings";
beforeEach(() => {
  vi.resetAllMocks();
  auth.updateUser.mockResolvedValue({ error: null });
});
describe("Private account credential changes", () => {
  it("requires the current password on signed-in password changes", async () => {
    await changeAccountPassword("old-password", "new-password");
    expect(auth.updateUser).toHaveBeenCalledWith({
      password: "new-password",
      current_password: "old-password",
    });
    await expect(changeAccountPassword("", "new-password")).rejects.toThrow("contraseña actual");
    expect(auth.updateUser).toHaveBeenCalledTimes(1);
  });
  it("requests Cloud confirmation rather than changing email in a profile record", async () => {
    await changeAccountEmail(" person@example.com ", "https://hola.example");
    expect(auth.updateUser).toHaveBeenCalledWith(
      { email: "person@example.com" },
      { emailRedirectTo: "https://hola.example/auth" },
    );
  });
  it("does not report rejected credential changes as successful", async () => {
    auth.updateUser.mockResolvedValue({ error: new Error("wrong current password") });
    await expect(changeAccountPassword("wrong-password", "new-password")).rejects.toThrow(
      "wrong current password",
    );
  });
});
