import { useEffect } from "react";
import { useLocation } from "wouter";

const PAGE_TITLES: Record<string, string> = {
  "/": "FHP",
  "/kniznica": "Knižnica",
  "/ucet": "Účet",
  "/dennik": "Denník",
  "/pasy": "Pasy",
  "/pomoc": "Pomoc",
  "/admin": "Admin",
  "/prihlasenie": "Prihlásenie",
  "/registracia": "Registrácia",
};

export function useTitle() {
  const [location] = useLocation();

  useEffect(() => {
    const base = "FHP";
    let page = PAGE_TITLES[location];

    // Check for game detail page
    if (!page && location.startsWith("/hra/")) {
      page = "Hra";
    }

    document.title = page ? `${base} / ${page}` : base;
  }, [location]);
}
