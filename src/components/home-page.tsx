import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Compass, Heart, MapPin, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HolaFace } from "@/components/hola-face";
import { ActivityCard } from "@/components/activity-card";
import { AssistantPanel } from "@/components/assistant-panel";
import { WeekSection } from "@/components/week-section";
import { useLanguage } from "@/lib/language";
import { activities, cityImage } from "@/lib/city-data";

export function HomePage() {
  const lang = useLanguage();
  const tr = (es: string, en: string) => (lang === "en" ? en : es);
  return (
    <div className="fade-in">
      <section className="hero">
        <img
          className="hero-image"
          src={cityImage}
          alt={tr("Basílica del Pilar, Puente de Piedra y río Ebro en Zaragoza", "Basilica del Pilar, Stone Bridge and the Ebro river in Zaragoza")}
          fetchPriority="high"
        />
        <div className="hero-inner page-width">
          <div className="hero-copy">
            <span className="hero-eyebrow">
              <MapPin size={13} />
              {tr("ZARAGOZA, TU NUEVO HOGAR", "ZARAGOZA, YOUR NEW HOME")}
            </span>
            <h1>
              {tr("Tu nueva ciudad", "Your new city")}
              <br />
              {tr("empieza aquí", "starts here")}<span className="text-primary">.</span>
            </h1>
            <p>
              {tr("Llegar a una ciudad nueva puede ser emocionante, pero también un poco abrumador. Te ayudamos a encontrar tu sitio.", "Moving to a new city can be exciting, but also a little overwhelming. We help you find your place.")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="roomy">
                <Link to="/onboarding">
                  {tr("Descubrir Zaragoza", "Discover Zaragoza")}
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="heroOutline" size="roomy">
                <Link to="/como-funciona">{tr("Conocer cómo funciona", "See how it works")}</Link>
              </Button>
            </div>
            <span className="mt-5 flex items-center gap-2 text-[11px] text-hero-muted">
              <Heart size={13} />
              {tr("No es solo descubrir una ciudad. Es empezar a sentirte parte de ella.", "It's not just discovering a city. It's starting to feel part of it.")}
            </span>
          </div>
          <div className="hero-welcome">
            <HolaFace />
            <div>
              <span className="block text-[13px] font-bold">{tr("¡Zaragoza te estaba esperando!", "Zaragoza was waiting for you!")}</span>
              <span className="text-[11px] text-muted-foreground">{tr("Vamos a descubrirla juntos.", "Let's discover it together.")}</span>
            </div>
            <Sparkles size={16} className="text-primary" />
          </div>
          <span className="hero-place">
            <MapPin size={12} />
            {tr("Un atardecer junto al Ebro · Zaragoza", "Sunset by the Ebro · Zaragoza")}
          </span>
        </div>
      </section>
      <div className="page-width">
        <section className="benefits">
          {[
            {
              icon: Compass,
              title: tr("Descubre tu entorno", "Explore your surroundings"),
              text: tr("Rincones que pronto sentirás tuyos.", "Corners you'll soon call your own."),
              color: "",
            },
            {
              icon: Sparkles,
              title: tr("Encuentra planes para ti", "Find plans for you"),
              text: tr("Lo que te gusta, cerca de ti.", "What you love, close to you."),
              color: "sage",
            },
            {
              icon: Users,
              title: tr("Conoce gente y conecta", "Meet people and connect"),
              text: tr("Tu ciudad también son sus personas.", "A city is also its people."),
              color: "neutral",
            },
          ].map((b) => (
            <div className="benefit" key={b.title}>
              <span className={`icon-tile ${b.color}`}>
                <b.icon size={21} />
              </span>
              <div>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            </div>
          ))}
        </section>
        <div className="home-content">
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="eyebrow text-primary">{tr("TUS PRIMEROS DESCUBRIMIENTOS", "YOUR FIRST DISCOVERIES")}</span>
                <h2 className="section-title mt-2">{tr("Un poquito más de tu Zaragoza", "A little more of your Zaragoza")}</h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  {tr("Pequeños planes para empezar a sentirte en casa.", "Small plans to start feeling at home.")}
                </p>
              </div>
              <Button asChild variant="link" className="h-auto px-0 text-[11px]">
                <Link to="/planes">
                  {tr("Ver todos los planes", "See all plans")}
                  <ArrowUpRight className="size-3" />
                </Link>
              </Button>
            </div>
            <div className="activity-grid">
              {activities.slice(0, 3).map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
            <p className="mt-4 text-[9px] text-muted-foreground">
              {tr("Ideas de demostración. Consulta las fuentes oficiales antes de tu visita.", "Demo ideas. Check official sources before your visit.")}
            </p>
          </section>
          <AssistantPanel />
        </div>
      </div>
      <WeekSection />
    </div>
  );
}
