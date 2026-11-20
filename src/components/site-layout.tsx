import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { accountDetailsOptions } from "@/lib/user-management-query";
import {
  Compass,
  Heart,
  Home,
  Info,
  MapPin,
  Users,
  ArrowUpRight,
  UserRound,
  CalendarDays,
  LogIn,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useT } from "@/lib/language";
import { HolaFace } from "@/components/hola-face";
import { useCity } from "@/components/city-provider";
import { useAccount } from "@/components/account-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/mi-zaragoza", label: "Mi Zaragoza", icon: Home },
  { to: "/planes", label: "Descubre planes", icon: Compass },
  { to: "/conoce-gente", label: "Conoce gente", icon: Users },
  { to: "/informacion", label: "Información útil", icon: Info },
] as const;
export function SiteHeader() {
  const t = useT();
  const { state } = useCity();
  const { user, ready: accountReady, signOut } = useAccount();
  const { data: accountDetails } = useQuery({
    ...accountDetailsOptions(user?.id ?? "signed-out"),
    enabled: accountReady && Boolean(user),
  });
  return (
    <>
      <header className="site-header">
        <div className="page-width flex h-full items-center justify-between gap-5">
        <Link to="/" className="brand" aria-label="Hola Zaragoza, inicio">
          <MapPin className="brand-mark" strokeWidth={2.4} />
          <span>
            hola<span className="text-primary">Zaragoza</span>
          </span>
        </Link>
        <nav aria-label="Navegación principal" className="flex items-center gap-8">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="nav-item">
              {t(n.label)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="icon" title={t("Mis primeros siete días")}>
            <Link to="/primeros-dias" aria-label={t("Mis primeros siete días")}>
              <CalendarDays />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" title={t("Mis favoritos")}>
            <Link to="/planes" search={{ guardados: true }} aria-label={t("Mis favoritos")}>
              <Heart />
            </Link>
          </Button>
          <Button asChild variant="default" className="hidden text-xs sm:inline-flex">
            <Link to="/onboarding">
              {state.completed ? t("Mis preferencias") : t("Mi perfil")}
              <ArrowUpRight className="size-3" />
            </Link>
          </Button>
          <Button asChild variant="default" size="icon" className="sm:hidden" title={t("Mi perfil")}>
            <Link to="/onboarding" aria-label={t("Mi perfil")}>
              <UserRound />
            </Link>
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label={t("Mi cuenta")} title={t("Mi cuenta")}>
                  <UserRound />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/cuenta">
                    <UserRound />
                    {t("Mi cuenta")}
                  </Link>
                </DropdownMenuItem>
                {accountDetails?.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/usuarios">
                      <ShieldCheck />
                      {t("Administrar usuarios")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => void signOut()}>
                  <LogOut />
                  {t("Cerrar sesión")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="icon"
              disabled={!accountReady}
              title={t("Iniciar sesión")}
            >
              <Link to="/auth" aria-label={t("Iniciar sesión")}>
                <LogIn />
              </Link>
            </Button>
          )}
        </div>
      </div>
      </header>
    </>
  );
}
export function MobileNav() {
  const t = useT();
  return (
    <nav className="mobile-nav" aria-label="Navegación móvil">
      <Link to="/mi-zaragoza">
        <Home size={19} />
        {t("Mi Zaragoza")}
      </Link>
      <Link to="/planes">
        <Compass size={19} />
        {t("Planes")}
      </Link>
      <Link to="/compañero" className="mobile-hola">
        <HolaFace />
        Pilar
      </Link>
      <Link to="/conoce-gente">
        <Users size={19} />
        {t("Gente")}
      </Link>
      <Link to="/informacion">
        <Info size={19} />
        {t("Info útil")}
      </Link>
    </nav>
  );
}
export function SiteFooter() {
  const t = useT();
  return (
    <footer className="page-width site-footer">
      <span>{t("Hola Zaragoza. Tu nueva ciudad empieza aquí.")}</span>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span>{t("Hecho con cariño para Zaragoza")}</span>
        <Link to="/creditos" className="underline underline-offset-4">
          {t("Créditos y demo")}
        </Link>
        <Link to="/privacidad" className="underline underline-offset-4">
          {t("Protección de datos")}
        </Link>
      </div>
    </footer>
  );
}
