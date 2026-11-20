import { beforeEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ signUp: vi.fn(), signInWithPassword: vi.fn(), getUser: vi.fn(), resetPasswordForEmail: vi.fn(), resend: vi.fn(), updateUser: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth } }));
import { loginAccount, registerAccount, resendVerification, resetRecoveryPassword, safeDestination, sendRecovery } from "@/lib/auth-flow";
beforeEach(() => vi.resetAllMocks());
describe("Cloud authentication contracts", () => {
  it("registers using email/password and waits for required email verification", async () => {
    auth.signUp.mockResolvedValue({ data: { user: { id: "new-user" }, session: null }, error: null });
    expect((await registerAccount(" person@example.com ", "unique-password", "https://hola.example")).session).toBeNull();
    expect(auth.signUp).toHaveBeenCalledWith({ email: "person@example.com", password: "unique-password", options: { emailRedirectTo: "https://hola.example/auth", data: { display_name: "" } } });
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });
  it("sends the trimmed display name with the registration", async () => {
    auth.signUp.mockResolvedValue({ data: { user: { id: "new-user" }, session: null }, error: null });
    await registerAccount("person@example.com", "unique-password", "https://hola.example", "  Pilar  ");
    expect(auth.signUp).toHaveBeenCalledWith({ email: "person@example.com", password: "unique-password", options: { emailRedirectTo: "https://hola.example/auth", data: { display_name: "Pilar" } } });
  });
  it("validates identity with Auth before accepting password sign-in", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    auth.getUser.mockResolvedValue({ data: { user: { id: "verified-user", email_confirmed_at: "2026-11-13" } }, error: null });
    expect((await loginAccount("person@example.com", "unique-password")).id).toBe("verified-user");
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: "person@example.com", password: "unique-password" });
    expect(auth.getUser).toHaveBeenCalledOnce();
  });
  it("does not accept an unverified email account", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    auth.getUser.mockResolvedValue({ data: { user: { id: "pending-user", email_confirmed_at: null } }, error: null });
    await expect(loginAccount("person@example.com", "unique-password")).rejects.toThrow("Unverified account");
  });
  it("does not accept rejected credentials", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: new Error("Invalid credentials") });
    await expect(loginAccount("person@example.com", "wrong-password")).rejects.toThrow("Invalid credentials");
    expect(auth.getUser).not.toHaveBeenCalled();
  });
  it("sends recovery to the public reset-password page on the current origin", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    await sendRecovery("person@example.com", "https://hola.example");
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("person@example.com", { redirectTo: "https://hola.example/reset-password" });
  });
  it("resends the real Cloud signup confirmation, without confirming the user locally", async () => {
    auth.resend.mockResolvedValue({ error: null });
    await resendVerification("person@example.com", "https://hola.example");
    expect(auth.resend).toHaveBeenCalledWith({ type: "signup", email: "person@example.com", options: { emailRedirectTo: "https://hola.example/auth" } });
  });
  it("uses recovery password update without a current-password requirement", async () => {
    auth.updateUser.mockResolvedValue({ error: null });
    await resetRecoveryPassword("new-unique-password");
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "new-unique-password" });
  });
  it("preserves the requested protected page and its search filters", () => {
    expect(safeDestination("/planes?guardados=true&zona=Centro")).toBe("/planes?guardados=true&zona=Centro");
    expect(safeDestination("/compa%C3%B1ero?pregunta=Hola")).toBe("/compa%C3%B1ero?pregunta=Hola");
    expect(safeDestination("/")).toBe("/");
  });
  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "/%2f%2fevil.example", "/auth", "/reset-password", "/unknown", undefined])("rejects unsafe or non-app redirect %s", (path) => {
    expect(safeDestination(path)).toBe("/mi-zaragoza");
  });
});