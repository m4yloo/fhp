import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { CreditCard, Gamepad2, Key } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const steps = [
    { icon: CreditCard, title: "Získaj pas", desc: "Vyber si členstvo" },
    { icon: Gamepad2, title: "Vyber hru", desc: "Prezri katalóg" },
    { icon: Key, title: "Aktivuj", desc: "Získaj kľúč" },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-[#0a0a0d] text-foreground flex flex-col items-center justify-center px-6 font-sans relative overflow-hidden py-20">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute top-1/3 -right-60 w-[500px] h-[500px] rounded-full bg-sky-600/6 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
        {/* Logo with glow */}
        <div className="w-[42px] h-[42px] mb-6 relative">
          <div className="absolute inset-0 bg-primary/40 blur-[16px] rounded-full" />
          <Logo size={42} className="relative" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">FHP</h1>
        <p className="text-sm text-muted-foreground font-mono mb-12">Fazuľové Herné Poklady</p>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-12">
          {steps.map((step, i) => (
            <div key={i} className="bg-card/40 border border-border/50 p-5 rounded-2xl flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <div className="text-sm font-semibold text-foreground">{step.title}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-1">{step.desc}</div>
                </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={() => setLocation("/kniznica")}
            className="w-full max-w-xs mx-auto h-12 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            Vstúpiť do katalógu
          </Button>
        </div>

        <footer className="mt-16 text-[10px] text-muted-foreground font-mono text-center">
          © 2026 FHP · Fazuľové Herné Poklady
        </footer>
      </div>
    </div>
  );
}
