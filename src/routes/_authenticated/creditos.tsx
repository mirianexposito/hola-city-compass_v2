import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/creditos")({
  head: () =>
    pageHead(
      "Créditos y demostración",
      "Fuentes fotográficas y alcance del prototipo de Hola Zaragoza para Zaragoza.",
    ),
  component: Credits,
});
function Credits() {
  return (
    <section className="page-width max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold">Créditos y demostración</h1>
      <h2 className="mt-7 text-lg font-bold">Fotografías de Zaragoza</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Imágenes procedentes del portal de Zaragoza Turismo, Ayuntamiento de Zaragoza: Pilar y Ebro,
        Casco Histórico, Parque Grande José Antonio Labordeta, El Gancho y Centro de Historias. Se
        muestran recortadas para ajustarse a la presentación.
      </p>
      <a
        href="https://www.zaragoza.es/sede/portal/turismo/"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm text-primary underline"
      >
        Zaragoza Turismo · Fuente original
      </a>
      <h2 className="mt-7 text-lg font-bold">Sobre este prototipo</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Hola Zaragoza es una demostración navegable. Las conversaciones de Pilar son simuladas, no
        respuestas de una inteligencia artificial conectada. Las propuestas no representan eventos
        reales ni confirman horarios, tarifas, grupos o disponibilidad. Consulta las fuentes
        oficiales antes de organizar una actividad.
      </p>
      <h2 className="mt-7 text-lg font-bold">El tiempo en Zaragoza</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        La temperatura, el viento y la previsión de cuatro días se consultan en Open-Meteo. Son
        previsiones meteorológicas, no avisos oficiales ni garantías de tiempo. Solo se envían las
        coordenadas de Zaragoza, nunca tus respuestas ni tu ubicación personal.
      </p>
      <a
        href="https://open-meteo.com/"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm text-primary underline"
      >
        Open-Meteo · Datos meteorológicos (CC BY 4.0)
      </a>
      <h2 className="mt-7 text-lg font-bold">Directorio del Ayuntamiento</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Las bibliotecas y los centros cívicos de «Información útil» proceden de la API de datos
        abiertos del Ayuntamiento de Zaragoza. Se muestran direcciones, teléfonos y horarios
        publicados, junto a la fecha de actualización de cada ficha cuando está disponible. Su
        consulta no confirma la apertura ni las condiciones de acceso. No se envían tus respuestas,
        tu cuenta ni tu ubicación personal al Ayuntamiento.
      </p>
      <a
        href="https://www.zaragoza.es/sede/portal/datos-abiertos/api"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm text-primary underline"
      >
        Ayuntamiento de Zaragoza · API y datos abiertos
      </a>
      <h2 className="mt-7 text-lg font-bold">Tus datos</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        El acceso requiere una cuenta. Puedes guardar las respuestas de «Mi perfil» en tu cuenta
        privada y recuperarlas en otro dispositivo. Los favoritos, conversaciones y progreso
        permanecen en este navegador, separados para cada cuenta. «Reiniciar perfil» elimina tus
        respuestas guardadas y el progreso local correspondiente.
      </p>
    </section>
  );
}
