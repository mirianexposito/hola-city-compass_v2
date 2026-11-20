import { createFileRoute } from "@tanstack/react-router";
import { CityProvider } from "@/components/city-provider";
import { HomePage } from "@/components/home-page";
import { SiteHeader, SiteFooter, MobileNav } from "@/components/site-layout";
import { cityImage } from "@/lib/city-data";
import { pageHead } from "@/lib/metadata";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => {
    const metadata = pageHead(
      "Tu nueva ciudad empieza aquí",
      "Bienvenido a Hola Zaragoza, tu amiga mañica para descubrir Zaragoza, encontrar planes y sentirte parte de la ciudad.",
    );
    return {
      ...metadata,
      meta: [
        ...metadata.meta,
        ...(cityImage.startsWith("https://")
          ? [
              { property: "og:image", content: cityImage },
              { name: "twitter:image", content: cityImage },
            ]
          : []),
      ],
    };
  },
  component: Index,
});

function Index() {
  return (
    <CityProvider>
      <SiteHeader />
      <main>
        <HomePage />
      </main>
      <SiteFooter />
      <MobileNav />
    </CityProvider>
  );
}
