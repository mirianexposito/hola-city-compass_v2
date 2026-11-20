import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowUpRight, MapPin, Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HolaFace } from "@/components/hola-face";
import { useCity } from "@/components/city-provider";
import { ActivityCard } from "@/components/activity-card";
import { activities, resources } from "@/lib/city-data";
import { usePilarChat } from "@/hooks/use-pilar-chat";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/compañero")({
  validateSearch: (search: Record<string, unknown>): { pregunta?: string | undefined } => ({
    pregunta: typeof search["pregunta"] === "string" ? search["pregunta"] : undefined,
  }),
  head: () =>
    pageHead(
      "Habla con Pilar",
      "Tu amiga mañica para descubrir Zaragoza. Conversa, encuentra ideas y prepara tu primera semana con recomendaciones personalizadas.",
    ),
  component: Chat,
});
const questions = [
  "¿Qué puedo hacer este fin de semana?",
  "¿Dónde puedo conocer gente?",
  "¿Qué barrios debería descubrir?",
  "¿Hay actividades gratuitas?",
  "¿Dónde puedo practicar deporte?",
  "Tengo dos horas libres esta tarde. ¿Qué me propones?",
];
function Chat() {
  const { state, ready, setMessages, discardActivity } = useCity();
  const { pregunta } = Route.useSearch();
  const p = state.preferences;
  const text = `¡Hola! 👋 Soy Pilar, tu amiga mañica. ${p.neighborhood ? `Tengo presente que vives en ${p.neighborhood}. ` : ""}${p.interests.length ? `Ya conozco tus intereses: ${p.interests.slice(0, 2).join(" y ")}. ` : ""}¿Qué te apetece descubrir hoy?`;
  const { messages, input, setInput, pending, error, composer, send } = usePilarChat(text);
  useEffect(() => {
    setInput(pregunta || "");
  }, [pregunta, setInput]);
  useEffect(() => {
    if (ready && !pending && document.querySelector('[role="dialog"]') === null)
      composer.current?.focus({ preventScroll: true });
  }, [ready, pending]);
  return (
    <div className="page-width chat-page fade-in">
      <header className="page-heading">
        <span className="eyebrow text-primary">UN POCO DE COMPAÑÍA, MUCHOS DESCUBRIMIENTOS</span>
        <h1 className="mt-3">
          Tu amiga mañica<span className="text-primary">.</span>
        </h1>
        <p>A veces, encontrar tu sitio empieza con una conversación.</p>
      </header>
      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="mb-6 flex items-center gap-3">
            <HolaFace />
            <div>
              <h2 className="font-bold">Pilar</h2>
              <span className="text-xs text-muted-foreground">Tu amiga mañica</span>
            </div>
          </div>
          <p className="eyebrow mb-3 text-muted-foreground">¿POR DÓNDE EMPEZAMOS?</p>
          <div className="flex flex-col gap-2">
            {questions.map((q) => (
              <Button
                key={q}
                variant="suggestion"
                className="h-auto py-3"
                disabled={pending || !ready}
                onClick={() => void send(q)}
              >
                <Sparkles className="text-primary" />
                <span>{q}</span>
              </Button>
            ))}
          </div>
          {p.neighborhood && (
            <span className="mt-7 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={14} />
              {p.neighborhood}
            </span>
          )}
          <Button asChild variant="link" className="mt-3 px-0 text-xs">
            <Link to="/onboarding">
              Ajustar mis preferencias
              <ArrowUpRight />
            </Link>
          </Button>
          <Button asChild variant="link" className="px-0 text-xs">
            <Link to="/primeros-dias">
              Mis primeros siete días
              <ArrowUpRight />
            </Link>
          </Button>
        </aside>
        <section className="chat-window" aria-label="Conversación con Pilar">
          <div className="chat-topbar">
            <div className="flex items-center gap-3">
              <HolaFace />
              <div>
                <span className="block text-sm font-bold">Pilar</span>
                <span className="text-[10px] text-secondary-foreground">
                  Aquí para acompañarte · Demo
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              title="Nueva conversación"
              aria-label="Nueva conversación"
              disabled={pending}
              onClick={() => {
                setMessages([]);
                composer.current?.focus({ preventScroll: true });
              }}
            >
              <Trash2 />
            </Button>
          </div>
          <Conversation className="min-h-0" aria-live="polite">
            <ConversationContent className="hola-transcript">
              {messages.map((m) => (
                <Message key={m.id} from={m.role} className="hola-message">
                  <div className="hola-message-row">
                    {m.role === "assistant" && <HolaFace />}
                    <div className="min-w-0 flex-1">
                      <MessageContent className="hola-message-content">
                        {m.parts.map((part, i) =>
                          part.type === "text" ? (
                            <MessageResponse key={i}>{part.text}</MessageResponse>
                          ) : null,
                        )}
                      </MessageContent>
                      {m.resourceIds && (
                        <div className="mt-3 flex flex-col gap-2">
                          {m.resourceIds.map((id) => {
                            const r = resources.find((r) => r.id === id);
                            return r ? (
                              <Button key={id} asChild variant="suggestion" className="h-auto py-3">
                                <a href={r.url} target="_blank" rel="noreferrer">
                                  {r.label}
                                  <ArrowUpRight />
                                </a>
                              </Button>
                            ) : null;
                          })}
                        </div>
                      )}
                      {m.resource && (
                        <Button asChild variant="link" className="mt-2 px-0 text-xs">
                          <Link to="/informacion">Ver información útil</Link>
                        </Button>
                      )}
                      {m.itinerary && (
                        <Button asChild className="mt-3">
                          <Link to="/primeros-dias">
                            Ver mi plan de siete días
                            <ArrowUpRight />
                          </Link>
                        </Button>
                      )}
                      {m.activityIds && m.activityIds.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {m.activityIds.map((id) => {
                            const a = activities.find((a) => a.id === id);
                            return a ? (
                              <ActivityCard
                                key={id}
                                activity={a}
                                compact
                                onDiscard={() => discardActivity(id)}
                              />
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </Message>
              ))}
              {pending && (
                <Message from="assistant">
                  <div className="hola-message-row">
                    <HolaFace />
                    <Shimmer>Pilar está preparando tus propuestas…</Shimmer>
                  </div>
                </Message>
              )}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2">
                  {questions.slice(0, 3).map((q) => (
                    <Button
                      key={q}
                      variant="suggestion"
                      className="h-auto py-2"
                      disabled={!ready || pending}
                      onClick={() => void send(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              )}
              {messages.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {(
                    messages.filter((m) => m.role === "assistant").at(-1)?.quickQuestions ?? [
                      "Otra propuesta",
                      "Cuéntame más sobre la primera",
                    ]
                  ).map((q) => (
                    <Button
                      key={q}
                      variant="suggestion"
                      className="h-auto py-2"
                      disabled={pending}
                      onClick={() => void send(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton aria-label="Ir al último mensaje" />
          </Conversation>
          <div className="hola-composer">
            {error && (
              <p role="alert" className="mb-2 text-xs text-destructive">
                {error}
              </p>
            )}
            <PromptInput onSubmit={({ text }) => send(text)}>
              <PromptInputTextarea
                ref={composer}
                aria-label="Tu mensaje para Pilar"
                placeholder="Cuéntame, ¿qué te apetece descubrir?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={2000}
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit
                  aria-label="Enviar mensaje"
                  status={pending ? "submitted" : "ready"}
                  disabled={!input.trim() || pending || !ready}
                >
                  {!pending && <Send />}
                </PromptInputSubmit>
              </PromptInputFooter>
            </PromptInput>
          </div>
        </section>
      </div>
      <p className="pb-4 text-center text-[10px] text-muted-foreground">
        Respuestas simuladas y personalizadas. No hay IA conectada ni disponibilidad real de
        actividades.
      </p>
    </div>
  );
}
