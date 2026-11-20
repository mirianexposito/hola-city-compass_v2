import { ArrowUpRight, MessageCircle, Send, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { HolaFace } from "./hola-face";
import { useLanguage } from "@/lib/language";
import { useCity } from "./city-provider";
import { usePilarChat } from "@/hooks/use-pilar-chat";
import { activities, resources } from "@/lib/city-data";
import { Conversation, ConversationContent, ConversationScrollButton } from "./ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "./ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "./ai-elements/prompt-input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function AssistantPanel() {
  const { state, ready, setMessages } = useCity();
  const lang = useLanguage();
  const tr = (es: string, en: string) => (lang === "en" ? en : es);
  const welcome = `${tr("¡Qué bien tenerte por aquí! 👋", "So glad to have you here! 👋")} ${
    state.completed
      ? lang === "en"
        ? `Let's explore ${state.preferences.neighborhood || "Zaragoza"} and find plans that suit you.`
        : `Vamos a descubrir ${state.preferences.neighborhood || "Zaragoza"} y encontrar planes que encajen contigo.`
      : tr("Cuéntame qué te gusta y te ayudo a encontrar tu sitio en Zaragoza.", "Tell me what you like and I'll help you find your place in Zaragoza.")
  } ${tr("¿Por dónde empezamos?", "Where shall we start?")}`;
  const { messages, input, setInput, pending, error, composer, send } = usePilarChat(welcome);
  const quickQuestions = state.messages.length
    ? messages.filter((message) => message.role === "assistant").at(-1)?.quickQuestions ?? []
    : ["¿Qué puedo hacer este fin de semana?"];

  return (
    <aside className="assistant-panel" aria-label={tr("Chat con Pilar", "Chat with Pilar")}>
      <div className="mb-4 flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <HolaFace />
          <span className="eyebrow text-secondary-foreground">{tr("Tu amiga mañica", "Your local friend from Zaragoza")}</span>
        </div>
        <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={tr("Nueva conversación", "New conversation")}
              disabled={pending || !ready || !state.messages.length}
              onClick={() => {
                setMessages([]);
                setInput("");
                composer.current?.focus({ preventScroll: true });
              }}
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tr("Nueva conversación", "New conversation")}</TooltipContent>
        </Tooltip>
        </TooltipProvider>
      </div>
      <h2>
        {tr("Hola, soy Pilar", "Hi, I'm Pilar")}<span className="text-primary">.</span>
      </h2>
      <p className="mt-2 text-muted-foreground">
        {tr("La ciudad es nueva. Pero no tienes que descubrirla a solas.", "The city is new. But you don't have to discover it alone.")}
      </p>
      <Conversation className="home-chat-conversation mt-5" aria-label={tr("Conversación con Pilar", "Conversation with Pilar")} aria-live="polite" aria-busy={pending}>
        <ConversationContent className="home-chat-transcript">
          {messages.map((message) => (
            <Message key={message.id} from={message.role} className="home-chat-message">
              <span className="sr-only">{message.role === "assistant" ? "Pilar" : tr("Tú", "You")}</span>
              <MessageContent className="home-chat-message-content">
                <MessageResponse>{message.text}</MessageResponse>
              </MessageContent>
              {message.activityIds?.map((id) => {
                const activity = activities.find((item) => item.id === id);
                return activity ? (
                  <Button key={id} asChild variant="link" className="h-auto justify-start whitespace-normal px-0 text-left text-xs">
                    <a href={activity.source} target="_blank" rel="noreferrer">{activity.name}<ArrowUpRight /></a>
                  </Button>
                ) : null;
              })}
              {message.resourceIds?.map((id) => {
                const resource = resources.find((item) => item.id === id);
                return resource ? (
                  <Button key={id} asChild variant="link" className="h-auto justify-start whitespace-normal px-0 text-left text-xs">
                    <a href={resource.url} target="_blank" rel="noreferrer">{resource.label}<ArrowUpRight /></a>
                  </Button>
                ) : null;
              })}
            </Message>
          ))}
          {pending && <p role="status" className="text-muted-foreground">{tr("Pilar está preparando tu respuesta…", "Pilar is preparing your reply…")}</p>}
          {!pending && quickQuestions.length > 0 && (
            <div className="flex flex-col gap-2">
              {quickQuestions.map((question) => (
                <Button key={question} variant="suggestion" className="h-auto w-full py-2" disabled={!ready} onClick={() => void send(question)}>
                  <MessageCircle className="shrink-0 text-primary" />
                  {question === "¿Qué puedo hacer este fin de semana?" ? tr("¿Qué hago este fin de semana?", "What should I do this weekend?") : question}
                </Button>
              ))}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton aria-label={tr("Ir al último mensaje", "Go to the latest message")} />
      </Conversation>
      <div className="mt-3 w-full">
        {error && <p role="alert" className="mb-2 text-destructive">{error}</p>}
        <PromptInput onSubmit={({ text }) => send(text)}>
          <PromptInputTextarea
            ref={composer}
            aria-label={tr("Tu mensaje para Pilar", "Your message for Pilar")}
            placeholder={tr("Cuéntame, ¿qué te apetece descubrir?", "What would you like to discover?")}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={2000}
            disabled={!ready || pending}
            className="min-h-16 text-xs"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit aria-label={tr("Enviar mensaje", "Send message")} title={tr("Enviar mensaje", "Send message")} status={pending ? "submitted" : "ready"} disabled={!input.trim() || pending || !ready}>
              {!pending && <Send />}
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>
      </div>
      <span className="mt-3 self-center text-[9px] text-muted-foreground">
        {tr("Conversación de demostración", "Demo conversation")}
      </span>
    </aside>
  );
}
