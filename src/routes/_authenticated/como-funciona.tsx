import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, MessageCircle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/como-funciona")({
  head: () =>
    pageHead(
      "Una ciudad que empieza contigo",
      "Descubre el recorrido de Hola Zaragoza: tus preferencias, una conversación con Pilar y tus primeros descubrimientos en Zaragoza.",
    ),
  component: How,
});
function How() {
  return (
    <div className="page-width fade-in py-12">
      <span className="eyebrow text-primary">UN NUEVO COMIENZO, A TU MANERA</span>
      <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-snug">
        No hace falta conocerlo todo.
        <br />
        Solo dar el primer paso<span className="text-primary">.</span>
      </h1>
      <div className="resource-grid mt-10">
        {[
          {
            icon: SlidersHorizontal,
            title: "Primero, tú",
            text: "Tu barrio, tus intereses, tu ritmo. Cada nueva etapa es diferente.",
          },
          {
            icon: MessageCircle,
            title: "Después, una conversación",
            text: "Pilar te acompaña con ideas para lo que te apetece hoy.",
          },
          {
            icon: Compass,
            title: "Y luego, tu Zaragoza",
            text: "Un rincón nuevo, una afición compartida, un lugar que ya sientes tuyo.",
          },
        ].map((x, i) => (
          <article className="resource-card" key={x.title}>
            <span className={`icon-tile ${i === 1 ? "sage" : ""}`}>
              <x.icon />
            </span>
            <span className="eyebrow mt-5 block text-primary">0{i + 1}</span>
            <h2 className="mt-2 text-xl font-bold">{x.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{x.text}</p>
          </article>
        ))}
      </div>
      <Button asChild size="roomy" className="mt-9">
        <Link to="/onboarding">
          Descubrir mi Zaragoza
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
