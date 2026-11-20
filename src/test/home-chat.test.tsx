import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AssistantPanel } from "@/components/assistant-panel";
import { CityProvider, useCity } from "@/components/city-provider";
import { usePilarChat } from "@/hooks/use-pilar-chat";
import { simulatedCompanion } from "@/lib/companion";
import { decodeCityState, storageKey } from "@/lib/city-session";
import type { ChatReply } from "@/lib/city-logic";

const account = vi.hoisted(() => ({ user: null as { id: string } | null, ready: true }));
const cloud = vi.hoisted(() => ({
  readProfile: vi.fn().mockResolvedValue(null),
  writeProfile: vi.fn(),
  removeProfile: vi.fn(),
}));
vi.mock("@/components/account-provider", () => ({ useAccount: () => account }));
vi.mock("@/lib/profile-storage", () => cloud);
vi.mock("@/components/ai-elements/conversation", () => ({
  Conversation: ({ children }: { children: ReactNode }) => <div role="log">{children}</div>,
  ConversationContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ConversationScrollButton: () => null,
}));
vi.mock("@/components/ai-elements/message", () => ({
  Message: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  MessageContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  MessageResponse: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  account.user = null;
  vi.clearAllMocks();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function useConversation() {
  return { ...usePilarChat("Hola, soy Pilar"), city: useCity() };
}

describe("Pilar directly on the public home", () => {
  it("submits a guest message and renders a real simulated reply in the home panel", async () => {
    render(<CityProvider><AssistantPanel /></CityProvider>);
    const input = screen.getByRole("textbox", { name: "Tu mensaje para Pilar" });
    await waitFor(() => expect(input).toBeEnabled());
    fireEvent.change(input, { target: { value: "¿Cómo me muevo por Zaragoza en transporte público?" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    await waitFor(() => {
      const messages = decodeCityState(localStorage.getItem(storageKey)).messages;
      expect(messages).toHaveLength(3);
      expect(messages[1]?.role).toBe("user");
      expect(messages[1]?.text).toBe("¿Cómo me muevo por Zaragoza en transporte público?");
      expect(messages[2]?.role).toBe("assistant");
      expect(messages[2]?.resourceIds).toContain("movilidad");
      expect(screen.getByRole("log").textContent).toContain(messages[2]?.text);
    });
    expect(cloud.readProfile).not.toHaveBeenCalled();
    expect(cloud.writeProfile).not.toHaveBeenCalled();
  });

  it("sends a quick question and keeps the conversation after remounting", async () => {
    const panel = render(<CityProvider><AssistantPanel /></CityProvider>);
    const question = screen.getByRole("button", { name: "¿Qué hago este fin de semana?" });
    await waitFor(() => expect(question).toBeEnabled());
    fireEvent.click(question);
    await waitFor(() => expect(decodeCityState(localStorage.getItem(storageKey)).messages).toHaveLength(3));
    const saved = decodeCityState(localStorage.getItem(storageKey)).messages;
    panel.unmount();
    render(<CityProvider><AssistantPanel /></CityProvider>);
    await waitFor(() => expect(screen.getByRole("log").textContent).toContain(saved[2]?.text));
    expect(decodeCityState(localStorage.getItem(storageKey)).messages).toEqual(saved);
  });

  it("passes the whole conversation to follow-up replies and prevents concurrent sends", async () => {
    const reply = vi.spyOn(simulatedCompanion, "reply");
    const hook = renderHook(useConversation, { wrapper: CityProvider });
    await waitFor(() => expect(hook.result.current.city.ready).toBe(true));
    await act(async () => {
      await Promise.all([hook.result.current.send("Quiero conocer gente"), hook.result.current.send("Mensaje duplicado")]);
    });
    expect(reply).toHaveBeenCalledTimes(1);
    const history = hook.result.current.messages;
    await act(async () => { await hook.result.current.send("Otra propuesta"); });
    expect(reply.mock.calls[1]?.[0].history).toEqual(history);
    expect(hook.result.current.messages).toHaveLength(5);
  });

  it("keeps a failed message and allows a successful retry", async () => {
    vi.spyOn(simulatedCompanion, "reply").mockRejectedValueOnce(new Error("Unavailable"));
    const hook = renderHook(useConversation, { wrapper: CityProvider });
    await waitFor(() => expect(hook.result.current.city.ready).toBe(true));
    await act(async () => { await hook.result.current.send("¿Hay actividades gratuitas?"); });
    expect(hook.result.current.messages.at(-1)?.role).toBe("user");
    expect(hook.result.current.input).toBe("¿Hay actividades gratuitas?");
    expect(hook.result.current.error).not.toBe("");
    expect(hook.result.current.pending).toBe(false);
    await act(async () => { await hook.result.current.send(hook.result.current.input); });
    expect(hook.result.current.messages.at(-1)?.role).toBe("assistant");
    expect(hook.result.current.error).toBe("");
  });

  it("does not copy an in-flight guest reply into a newly signed-in account", async () => {
    let finish: ((reply: ChatReply) => void) | undefined;
    vi.spyOn(simulatedCompanion, "reply").mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const hook = renderHook(useConversation, { wrapper: CityProvider });
    await waitFor(() => expect(hook.result.current.city.ready).toBe(true));
    let pending: Promise<void> | undefined;
    act(() => { pending = hook.result.current.send("Mensaje privado de invitada"); });
    account.user = { id: "new-account" };
    hook.rerender();
    await waitFor(() => expect(hook.result.current.city.ready).toBe(true));
    await act(async () => {
      finish?.({ text: "Respuesta a la invitada", activityIds: [] });
      await pending;
    });
    expect(hook.result.current.city.state.messages).toEqual([]);
    expect(decodeCityState(localStorage.getItem(`${storageKey}:user:new-account`)).messages).toEqual([]);
    expect(decodeCityState(localStorage.getItem(storageKey)).messages.at(-1)?.text).toBe("Mensaje privado de invitada");
  });
});