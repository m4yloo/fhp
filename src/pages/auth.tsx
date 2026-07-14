import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/lib/auth-provider";
import { Logo } from "@/components/Logo";
import { AuthPanel } from "@/components/AuthPanel";

export default function AuthPage() {
  const { devBypassSignIn, user } = useAuthContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        devBypassSignIn();
        setLocation("/kniznica");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [devBypassSignIn, setLocation]);

  useEffect(() => {
    if (user) {
      setLocation("/kniznica");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-[100dvh] w-full bg-[#0a0a0d] text-foreground flex flex-col items-center justify-center px-6 font-sans relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center w-full max-w-[340px]">
        {/* Logo with glow */}
        <div className="w-[42px] h-[42px] mb-5 relative">
          <div className="absolute inset-0 bg-primary/40 blur-[16px] rounded-full" />
          <Logo size={42} className="relative" />
        </div>

        <AuthPanel />

        <footer className="mt-[34px] text-[11px] text-[#57545e] tracking-[0.02em] text-center">
          © 2026 FHP · Fazuľové Herné Poklady
        </footer>
      </div>
    </div>
  );
}
