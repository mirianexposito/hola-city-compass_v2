import type { ReactNode } from "react";
import { CityProvider } from "@/components/city-provider";
import { SiteHeader, SiteFooter, MobileNav } from "@/components/site-layout";

// Public content pages share the city navigation and guest preferences without a session.
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <CityProvider>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <MobileNav />
    </CityProvider>
  );
}
