import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroQuestionCard } from "@/components/hero-question-card";
import { useCity } from "@/components/city-provider";
import { ActivityCard } from "@/components/activity-card";
import { AssistantPanel } from "@/components/assistant-panel";
import { useLanguage } from "@/lib/language";
import { activities, cityImage } from "@/lib/city-data";

export function HomePage() {
  const lang = useLanguage();
  const { state } = useCity();
  const tr = (es: string, en: string) => (lang === "en" ? en : es);
  const essentials = [
    {
      title: tr("Empadrónate", "Register your address"),
      text: tr(
        "Consulta cómo registrar tu domicilio y qué documentación necesitas.",
        "Check how to register your address and which documents you need.",
      ),
      source: tr("Ayuntamiento de Zaragoza", "Zaragoza City Council"),
      url: "https://www.zaragoza.es/sede/",
    },
    {
      title: tr("Tarjeta sanitaria y centro de salud", "Health card and health centre"),
      text: tr(
        "Infórmate sobre el acceso a la atención sanitaria y localiza tu centro de salud.",
        "Find out about healthcare access and locate your health centre.",
      ),
      source: "Salud Informa · Gobierno de Aragón",
      url: "https://www.saludinforma.es/",
    },
    {
      title: tr("Muévete por tu nueva ciudad", "Get around your new city"),
      text: tr(
        "Autobús, tranvía y recorridos cotidianos: encuentra la opción que te encaja.",
        "Buses, trams and everyday journeys: find what works for you.",
      ),
      source: tr("Movilidad · Ayuntamiento de Zaragoza", "Mobility · Zaragoza City Council"),
      url: "https://www.zaragoza.es/sede/portal/movilidad/",
    },
    {
      title: tr("Tu barrio, a mano", "Your neighbourhood essentials"),
      text: tr(
        "Localiza bibliotecas y centros cívicos: tus primeros puntos de referencia.",
        "Locate libraries and civic centres: your first familiar places.",
      ),
      source: tr("Servicios municipales", "Municipal services"),
      url: "https://www.zaragoza.es/sede/portal/centros-civicos/",
    },
  ];
  return (
    <div className="arrival-home fade-in">
      <section className="hero">
        <div className="hero-inner page-width">
          <div className="hero-copy">
            <span className="eyebrow text-primary">
              {tr("Para quien acaba de llegar a Zaragoza", "For anyone new to Zaragoza")}
            </span>
            <h1>
              {tr("Tu nueva ciudad", "Your new city")}
              <br />
              {tr("empieza aquí.", "starts here.")}
            </h1>
            <p>
              {tr(
                "Crea tu perfil con Pilar, tu amiga mañica, y empieza por lo que necesitas: orientarte con los trámites, conocer tu barrio y encontrar gente con quien compartir esta nueva etapa.",
                "Create your profile with Pilar, your local friend from Zaragoza. Start with what you need: paperwork, getting to know your neighbourhood and people to share this new chapter with.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="roomy">
                <Link to={state.completed ? "/mi-zaragoza" : "/onboarding"}>
                  {state.completed
                    ? tr("Mi Zaragoza", "My Zaragoza")
                    : tr("Crear mi perfil", "Create my profile")}
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="roomy">
                <a href="#como-te-acompana">{tr("Cómo te acompaña", "How Pilar helps")}</a>
              </Button>
            </div>
            <span className="arrival-note mt-5 flex items-start gap-2">
              <Check className="mt-0.5 size-3 shrink-0" />
              {tr(
                "Información práctica y enlaces a fuentes oficiales. A tu ritmo, sin tener que resolverlo todo hoy.",
                "Practical information and official sources. At your pace — you don't have to figure it all out today.",
              )}
            </span>
          </div>
          <div className="hero-visual">
            <span className="hero-photo-outline" aria-hidden="true" />
            <span className="hero-photo-accent" aria-hidden="true" />
            <img
              className="hero-photo"
              src={cityImage}
              alt={tr(
                "Basílica del Pilar y río Ebro en Zaragoza",
                "Basilica del Pilar and the Ebro river in Zaragoza",
              )}
              fetchPriority="high"
            />
            <div className="hero-card-wrap">
              {state.completed ? <AssistantPanel /> : <HeroQuestionCard />}
            </div>
          </div>
        </div>
      </section>

      <section id="como-te-acompana" className="arrival-section page-width">
        <div className="arrival-heading">
          <div>
            <span className="eyebrow text-primary">{tr("Cómo te acompaña", "By your side")}</span>
            <h2 className="section-title mt-2">
              {tr(
                "No es una guía. Es alguien que va contigo.",
                "Not a guide. Someone by your side.",
              )}
            </h2>
          </div>
          <p>
            {tr(
              "Una duda que resolver. Un lugar al que volver. Una pequeña rutina. Pilar te acompaña en el momento en el que estás.",
              "A question answered. A place to return to. A small routine. Pilar meets you where you are.",
            )}
          </p>
        </div>
        <div className="arrival-stages">
          {[
            [
              tr("01 · Acabo de llegar", "01 · Just arrived"),
              tr("Lo práctico, primero", "Practical things first"),
              tr(
                "Transporte, tu centro de salud, el centro cívico del barrio y las primeras dudas resueltas.",
                "Transport, your health centre, the local civic centre and your first questions answered.",
              ),
            ],
            [
              tr("02 · Estoy descubriendo", "02 · Finding my bearings"),
              tr("Tu Zaragoza, a tu medida", "Your Zaragoza, your way"),
              tr(
                "Barrios, cultura, naturaleza y pequeños descubrimientos según tus gustos, tu presupuesto y tu tiempo.",
                "Neighbourhoods, culture, nature and small discoveries for your interests, budget and time.",
              ),
            ],
            [
              tr("03 · Quiero sentirme parte", "03 · Finding my place"),
              tr("Gente y rutinas", "People and routines"),
              tr(
                "Talleres, espacios de barrio y ocasiones para repetir, conectar y empezar a sentirte de aquí.",
                "Workshops, local spaces and opportunities to return, connect and start feeling at home.",
              ),
            ],
          ].map(([label, title, text]) => (
            <article className="arrival-stage" key={label}>
              <span className="eyebrow text-primary">{label}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="arrival-week">
        <div className="page-width arrival-week-layout">
          <div>
            <span className="eyebrow">{tr("Tu primera semana", "Your first week")}</span>
            <h2 className="section-title mt-3">
              {tr(
                "Siete días para empezar a sentirte en casa.",
                "Seven days to start feeling at home.",
              )}
            </h2>
            <p className="mt-3">
              {tr(
                "Un primer paso cada día. Pilar lo adapta a tu barrio, tu tiempo y tus ganas de conocer gente.",
                "One small step each day. Pilar adapts it to your neighbourhood, time and desire to meet people.",
              )}
            </p>
            <Button asChild variant="favorite" className="mt-5">
              <Link to="/primeros-dias">
                {state.itinerary.length
                  ? tr("Ver mi primera semana", "See my first week")
                  : tr("Crear mi primera semana", "Create my first week")}
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="arrival-week-days">
            {[
              [
                tr("Días 1–2", "Days 1–2"),
                tr("Empieza por tu barrio", "Start with your neighbourhood"),
                tr(
                  "Un paseo, un café y tus primeros lugares de referencia.",
                  "A walk, a coffee and your first familiar places.",
                ),
              ],
              [
                tr("Días 3–4", "Days 3–4"),
                tr("Encuentra tu rutina", "Find your routine"),
                tr(
                  "Un rincón que encaje contigo, cerca de casa.",
                  "A place that feels right, close to home.",
                ),
              ],
              [
                tr("Días 5–7", "Days 5–7"),
                tr("Da un paso para conectar", "Take a step towards connection"),
                tr(
                  "Consulta qué ofrece tu biblioteca o centro cívico.",
                  "Explore what your library or civic centre has to offer.",
                ),
              ],
            ].map(([label, title, text]) => (
              <article key={label}>
                <span className="eyebrow">{label}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="arrival-essentials">
        <div className="page-width arrival-section">
          <div className="arrival-heading">
            <div>
              <span className="eyebrow text-primary">
                {tr("Papeleo sin perderte", "Paperwork without the confusion")}
              </span>
              <h2 className="section-title mt-2">
                {tr(
                  "Tus primeros pasos, con menos vueltas.",
                  "Your first steps, with less running around.",
                )}
              </h2>
            </div>
            <p>
              {tr(
                "Lo importante para empezar. Consulta qué necesitas y dónde hacer cada gestión, siempre en la fuente oficial.",
                "The essentials to get started. Check what you need and where to go, always with official sources.",
              )}
            </p>
          </div>
          <div className="arrival-essentials-layout">
            <div className="arrival-resource-grid">
              {essentials.map((item, i) => (
                <Button key={item.title} asChild variant="choice" className="arrival-resource">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    <span className="arrival-resource-number">
                      0{i + 1}
                      <ArrowUpRight className="size-4" />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <span className="arrival-source">{item.source}</span>
                  </a>
                </Button>
              ))}
            </div>
            <aside className="arrival-help">
              <MessageCircle className="size-6 text-secondary-foreground" />
              <h3>{tr("Pregúntale lo que no entiendas", "Ask what you don't understand")}</h3>
              <blockquote>
                {tr(
                  "“¿Por dónde empiezo si acabo de llegar?”",
                  "“Where do I start if I've just arrived?”",
                )}
              </blockquote>
              <p>
                {tr(
                  "Pilar te orienta con información de demostración y enlaces oficiales. No sustituye el asesoramiento profesional.",
                  "Pilar offers demo guidance and official links. She does not replace professional advice.",
                )}
              </p>
              <Button asChild variant="secondary" className="mt-auto w-full">
                <Link to="/informacion">
                  {tr("Ver información útil", "See useful information")}
                  <ArrowRight />
                </Link>
              </Button>
            </aside>
          </div>
          <p className="arrival-note mt-5">
            {tr(
              "Información orientativa. Los requisitos dependen de tu situación: consulta la fuente oficial antes de hacer un trámite.",
              "General guidance. Requirements depend on your circumstances: check the official source before completing any paperwork.",
            )}
          </p>
        </div>
      </section>

      <section className="arrival-section page-width">
        <div className="arrival-heading">
          <div>
            <span className="eyebrow text-primary">
              {tr("Después, a tu ritmo", "Then, at your pace")}
            </span>
            <h2 className="section-title mt-2">
              {tr("Un poquito más de tu Zaragoza", "A little more of your Zaragoza")}
            </h2>
            <p className="mt-2">
              {tr(
                "Pequeños descubrimientos para hacer tuya la ciudad. No una agenda que llenar.",
                "Small discoveries to make the city your own. Not a calendar to fill.",
              )}
            </p>
          </div>
          <Button asChild variant="link" className="justify-end px-0 text-xs">
            <Link to="/planes">
              {tr("Ver todos los planes", "See all ideas")}
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <div className="activity-grid">
          {activities.slice(0, 3).map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
        </div>
        <p className="arrival-note mt-5">
          {tr(
            "Ideas de demostración. Consulta las fuentes oficiales antes de tu visita.",
            "Demo ideas. Check official sources before your visit.",
          )}
        </p>
      </section>

      <section className="arrival-local">
        <div className="page-width arrival-section">
          <span className="eyebrow text-primary">{tr("Cosas de aquí", "Local life")}</span>
          <h2 className="section-title mt-2">
            {tr(
              "Lo que nadie te explica cuando llegas.",
              "The things nobody tells you when you arrive.",
            )}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {tr(
              "También hay pequeñas cosas que hacen que una ciudad deje de ser nueva.",
              "It's also the little things that make a new city feel familiar.",
            )}
          </p>
          <div className="arrival-local-grid">
            <article className="arrival-local-photo">
              <img
                src={activities[1]?.image ?? cityImage}
                alt={tr("Calles del Casco Histórico de Zaragoza", "Streets of Zaragoza's old town")}
                loading="lazy"
              />
              <div>
                <h3>{tr("La vida de barrio", "Neighbourhood life")}</h3>
                <p>
                  {tr(
                    "La tienda de la esquina, la plaza de siempre y ese saludo que ya te resulta familiar.",
                    "The corner shop, your usual square and a greeting that starts to feel familiar.",
                  )}
                </p>
              </div>
            </article>
            <article>
              <span className="arrival-local-symbol" aria-hidden="true">
                ↝
              </span>
              <h3>{tr("El cierzo", "The cierzo wind")}</h3>
              <p>
                {tr(
                  "El viento del noroeste que sopla con fuerza muchos días. Mejor llevar algo de abrigo, aunque haga sol.",
                  "The northwesterly wind that blows strongly on many days. Bring an extra layer, even when it's sunny.",
                )}
              </p>
            </article>
            <article>
              <span className="arrival-local-symbol" aria-hidden="true">
                ¡Hola!
              </span>
              <h3>{tr("Ir de tapas por El Tubo", "Tapas in El Tubo")}</h3>
              <p>
                {tr(
                  "Callejuelas del centro llenas de bares. Un buen lugar para quedar con alguien y empezar a sentirte de aquí.",
                  "Central streets full of bars. A place to meet someone and begin to feel at home.",
                )}
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
