import { useEffect, useRef, useState } from "react";
import { useAccount } from "@/components/account-provider";
import { useCity, type Message } from "@/components/city-provider";
import { activities, resources } from "@/lib/city-data";
import { simulatedCompanion } from "@/lib/companion";
import { createItinerary } from "@/lib/itinerary";

export function usePilarChat(welcomeText: string) {
  const { state, ready, setMessages, learnInterests, setItinerary } = useCity();
  const { user } = useAccount();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const composer = useRef<HTMLTextAreaElement>(null);
  const busy = useRef(false);
  const requestVersion = useRef(0);
  const welcome: Message = {
    id: "welcome",
    role: "assistant",
    text: welcomeText,
    parts: [{ type: "text", text: welcomeText }],
  };
  const messages = state.messages.length ? state.messages : [welcome];

  useEffect(() => {
    requestVersion.current += 1;
    busy.current = false;
    setPending(false);
    setInput("");
    setError("");
    return () => {
      requestVersion.current += 1;
    };
  }, [user?.id]);

  async function send(value: string) {
    const text = value.trim();
    if (!text || busy.current || !ready) return;
    busy.current = true;
    const version = requestVersion.current;
    const next: Message[] = [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: "user",
        text,
        parts: [{ type: "text", text }],
      },
    ];
    setMessages(next);
    setInput("");
    setError("");
    setPending(true);
    composer.current?.focus({ preventScroll: true });
    try {
      const reply = await simulatedCompanion.reply({
        message: text,
        history: messages,
        profile: state.preferences,
        memory: state,
        activities,
        resources,
      });
      if (version !== requestVersion.current) return;
      learnInterests(reply.learnedInterests ?? []);
      const { learnedInterests: _learned, preferences: _preferences, ...visible } = reply;
      setMessages([
        ...next,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          ...visible,
          parts: [{ type: "text", text: reply.text }],
        },
      ]);
      if (reply.itinerary) {
        setItinerary(
          createItinerary(
            activities,
            resources,
            reply.preferences ?? state.preferences,
            {
              ...state,
              learnedInterests: [...state.learnedInterests, ...(reply.learnedInterests ?? [])],
            },
            state.itinerary,
          ),
        );
      }
    } catch {
      if (version === requestVersion.current) {
        setInput(value);
        setError(
          "No he podido preparar la propuesta. Tu mensaje está guardado; puedes volver a intentarlo.",
        );
      }
    } finally {
      if (version === requestVersion.current) {
        busy.current = false;
        setPending(false);
        composer.current?.focus({ preventScroll: true });
      }
    }
  }

  return { messages, input, setInput, pending, error, composer, send };
}