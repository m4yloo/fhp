import { useEffect } from "react";
import { ArrowLeft, Gamepad2, Library, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuthContext } from "@/lib/auth-provider";
import { Logo } from "@/components/Logo";
import { AuthPanel } from "@/components/AuthPanel";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: Library, title: "Knižnica na jednom mieste", copy: "Objavujte a spravujte svoje herné poklady." },
  { icon: Gamepad2, title: "Okamžitý prístup", copy: "Kľúče, pasy a história vždy poruke." },
  { icon: Sparkles, title: "Vybrané pre hráčov", copy: "Prehľadný katalóg bez zbytočného chaosu." },
];

export default function AuthPage() {
  const { devBypassSignIn, user } = useAuthContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        devBypassSignIn();
        setLocation("/kniznica");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [devBypassSignIn, setLocation]);

  useEffect(() => {
    if (user) setLocation("/kniznica");
  }, [user, setLocation]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card p-10 lg:flex xl:p-14">
          <div className="flex items-center gap-3">
            <Logo size={42} />
            <div>
              <p className="text-lg font-semibold tracking-tight">FHP</p>
              <p className="text-xs text-muted-foreground">Fazuľové Herné Poklady</p>
            </div>
          </div>
          <div className="flex max-w-xl flex-col gap-10">
            <div className="flex flex-col gap-4">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">Váš herný trezor</p>
              <h2 className="text-balance text-4xl font-semibold leading-tight xl:text-5xl">Hry, ktoré chcete hrať. Prístup, ktorý vás nezdržiava.</h2>
              <p className="max-w-lg text-base leading-relaxed text-muted-foreground">FHP spája vybraný katalóg, vaše licencie a členské výhody do jedného čistého priestoru.</p>
            </div>
            <div className="grid gap-3">
              {benefits.map(({ icon: Icon, title, copy }) => (
                <div key={title} className="flex gap-4 rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></div>
                  <div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy}</p></div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 FHP · Vytvorené pre hráčov</p>
        </section>

        <section className="flex min-h-screen flex-col px-5 py-5 sm:px-8 lg:px-14 xl:px-20">
          <div className="flex items-center justify-between lg:justify-end">
            <Button variant="ghost" size="sm" asChild><Link href="/"><ArrowLeft data-icon="inline-start" />Späť</Link></Button>
            <div className="flex items-center gap-2 lg:hidden"><Logo size={32} /><span className="font-semibold">FHP</span></div>
          </div>
          <div className="flex flex-1 items-center justify-center py-10">
            <AuthPanel />
          </div>
          <p className="text-center text-xs text-muted-foreground lg:hidden">© 2026 FHP · Fazuľové Herné Poklady</p>
        </section>
      </div>
    </main>
  );
}
