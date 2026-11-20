import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { pageHead } from "@/lib/metadata";

export const Route = createFileRoute("/privacidad")({
  head: () =>
    pageHead(
      "Protección de datos",
      "Cómo trata Hola Zaragoza tus datos personales según el RGPD y la LOPDGDD.",
    ),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="auth-layout">
      <header className="site-header">
        <div className="page-width flex h-full items-center">
          <Link to="/" className="brand" aria-label="Hola Zaragoza, inicio">
            <MapPin className="brand-mark" strokeWidth={2.4} />
            <span>
              hola<span className="text-primary">Zaragoza</span>
            </span>
          </Link>
        </div>
      </header>
      <main>
        <section className="page-width max-w-3xl py-12">
          <h1 className="text-3xl font-extrabold">Protección de datos</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Este aviso explica qué datos trata Hola Zaragoza, con qué finalidad y qué derechos te
            reconocen el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
          </p>

          <h2 className="mt-7 text-lg font-bold">Responsable del tratamiento</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Hola Zaragoza es un prototipo de demostración para personas recién llegadas a Zaragoza.
            Para cualquier consulta sobre tus datos puedes escribir a la persona responsable del
            proyecto a través del correo de contacto indicado en la aplicación.
          </p>

          <h2 className="mt-7 text-lg font-bold">Datos de tu cuenta</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Para usar la aplicación necesitas una cuenta con correo electrónico y contraseña, o
            acceso mediante Google o Lovable. La verificación del correo y la recuperación de la
            contraseña se gestionan a través de la infraestructura de acceso de Lovable Cloud.
            Guardamos tu correo y, si lo completas, tu nombre y las respuestas de «Mi perfil»
            (barrio, etapa, intereses y actividades) para personalizar tu experiencia y
            recuperarlas en otro dispositivo. Estas respuestas son privadas: solo tú puedes
            leerlas o modificarlas con tu sesión, y la administración no tiene acceso a su
            contenido. La base legal es la ejecución del servicio que solicitas al registrarte.
          </p>

          <h2 className="mt-7 text-lg font-bold">Datos que se quedan en tu navegador</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Los favoritos, las conversaciones con Pilar y el progreso de tus planes se guardan
            únicamente en el almacenamiento local de este navegador, separados para cada cuenta.
            No se envían a ningún servidor y puedes eliminarlos con «Reiniciar perfil» o borrando
            los datos del sitio en tu navegador.
          </p>

          <h2 className="mt-7 text-lg font-bold">Estadísticas de visita</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Este sitio utiliza las estadísticas de visita de Lovable, que no usan cookies, no
            guardan nada en tu dispositivo, no conservan direcciones IP y no identifican a las
            personas visitantes. Lovable recoge estos datos por nosotros.{" "}
            <a
              href="https://lovable.dev/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              La política de privacidad de Lovable
            </a>{" "}
            explica cómo los trata.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Para cada visita se registran las páginas visitadas, el sitio de origen, el país, el
            navegador, el sistema operativo y el tipo de dispositivo, cuánto tiempo permanece la
            visita, la velocidad de carga de las páginas, los errores y los clics en botones y
            enlaces. Los datos detallados se conservan 90 días y los resúmenes diarios, un año.
          </p>

          <h2 className="mt-7 text-lg font-bold">Servicios de terceros</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            El tiempo de Zaragoza se consulta en Open-Meteo enviando solo las coordenadas de la
            ciudad. El directorio de bibliotecas y centros cívicos procede de la API de datos
            abiertos del Ayuntamiento de Zaragoza. Ninguno de los dos recibe tus respuestas, tu
            cuenta ni tu ubicación personal. Las tipografías se cargan desde Google Fonts, que
            recibe la petición de descarga de las fuentes como cualquier visita a un recurso web.
          </p>

          <h2 className="mt-7 text-lg font-bold">Tus derechos</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación
            del tratamiento y portabilidad escribiendo a la persona responsable del proyecto.
            Desde «Mi cuenta» puedes corregir tu nombre y tus respuestas en cualquier momento. Si
            consideras que el tratamiento no se ajusta a la normativa, puedes reclamar ante la
            Agencia Española de Protección de Datos (
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              www.aepd.es
            </a>
            ).
          </p>
        </section>
      </main>
      <footer className="page-width site-footer">
        <span>Hola Zaragoza. Tu nueva ciudad empieza aquí.</span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span>Hecho con cariño para Zaragoza</span>
          <Link to="/privacidad" className="underline underline-offset-4">
            Protección de datos
          </Link>
        </div>
      </footer>
    </div>
  );
}
