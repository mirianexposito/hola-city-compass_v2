import { createFileRoute } from "@tanstack/react-router";
import { CityProvider } from "@/components/city-provider";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { SiteHeader, SiteFooter, MobileNav } from "@/components/site-layout";
import { pageHead } from "@/lib/metadata";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () =>
    pageHead(
      "Tu Zaragoza comienza contigo",
      "Cuéntanos tus intereses, tu barrio y tu presupuesto para crear una experiencia de Zaragoza a tu medida.",
    ),
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <CityProvider>
      <SiteHeader />
      <main>
        <OnboardingFlow />
      </main>
      <SiteFooter />
      <MobileNav />
    </CityProvider>
  );
}
