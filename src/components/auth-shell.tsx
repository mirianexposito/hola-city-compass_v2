import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { HolaFace } from "@/components/hola-face";

export function AuthShell({ children }: { children: ReactNode }) {
  return <div className="auth-layout">
    <header className="site-header">
      <div className="page-width flex h-full items-center">
        <Link to="/" className="brand" aria-label="Hola Zaragoza, inicio"><MapPin className="brand-mark" strokeWidth={2.4} /><span>hola<span className="text-primary">Zaragoza</span></span></Link>
      </div>
    </header>
    <main><section className="page-width account-page fade-in"><HolaFace /><span className="eyebrow mt-5 block text-primary">TU SITIO EN ZARAGOZA</span>{children}</section></main>
    <footer className="page-width site-footer"><span>Hola Zaragoza. Tu nueva ciudad empieza aquí.</span><div className="flex flex-wrap items-center gap-x-5 gap-y-2"><span>Hecho con cariño para Zaragoza</span><Link to="/privacidad" className="underline underline-offset-4">Protección de datos</Link></div></footer>
  </div>;
}