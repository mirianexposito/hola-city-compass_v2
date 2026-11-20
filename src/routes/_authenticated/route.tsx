import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { CityProvider } from "@/components/city-provider";
import { SiteHeader, SiteFooter, MobileNav } from "@/components/site-layout";
import { useAccount } from "@/components/account-provider";
import { safeDestination } from "@/lib/auth-flow";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email_confirmed_at) throw redirect({ to: "/auth", search: { redirect: safeDestination(location.href) }, replace: true });
    if (sessionStorage.getItem("hola-ciudad-recovery") === data.user.id) throw redirect({ to: "/reset-password", replace: true });
  },
  component: AuthenticatedApp,
});

function AuthenticatedApp() {
  const { error } = useAccount();
  return <CityProvider>
    <SiteHeader />
    {error && <p role="alert" className="page-width pt-4 text-sm text-destructive">{error}</p>}
    <main><Outlet /></main>
    <SiteFooter />
    <MobileNav />
  </CityProvider>;
}