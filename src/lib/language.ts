import { useSyncExternalStore } from "react";

export type Language = "es" | "en";
const KEY = "hola-zaragoza-language";
const listeners = new Set<() => void>();

function read(): Language {
  if (typeof window === "undefined") return "es";
  return window.localStorage.getItem(KEY) === "en" ? "en" : "es";
}

export function setLanguage(lang: Language) {
  window.localStorage.setItem(KEY, lang);
  document.documentElement.lang = lang;
  listeners.forEach((l) => l());
}

export function useLanguage(): Language {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "es",
  );
}

const dict = {
  "Mi Zaragoza": "My Zaragoza",
  "Descubre planes": "Discover plans",
  "Conoce gente": "Meet people",
  "Información útil": "Useful info",
  "Mis primeros siete días": "My first seven days",
  "Mis favoritos": "My favourites",
  "Mis preferencias": "My preferences",
  "Mi perfil": "My profile",
  "Mi cuenta": "My account",
  "Administrar usuarios": "Manage users",
  "Cerrar sesión": "Sign out",
  "Iniciar sesión": "Sign in",
  Planes: "Plans",
  Gente: "People",
  "Info útil": "Info",
  "Hola Zaragoza. Tu nueva ciudad empieza aquí.": "Hola Zaragoza. Your new city starts here.",
  "Hecho con cariño para Zaragoza": "Made with love for Zaragoza",
  "Créditos y demo": "Credits and demo",
  "Protección de datos": "Data protection",
  Idioma: "Language",
} as const;

export type PhraseKey = keyof typeof dict;

export function translate(lang: Language, text: PhraseKey): string {
  return lang === "en" ? dict[text] : text;
}

export function useT() {
  const lang = useLanguage();
  return (text: PhraseKey) => translate(lang, text);
}
