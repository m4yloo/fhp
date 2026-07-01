import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col overflow-x-hidden font-sans">

      {/* ── Ambient glows ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute top-1/3 -right-60 w-[500px] h-[500px] rounded-full bg-sky-600/6 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30 glow-primary-sm">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base tracking-tight text-foreground">FHP</span>
              <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">Fazúľové Herné Poklady</span>
            </div>
          </div>

          <Button
            onClick={() => setLocation("/kniznica")}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 h-8 rounded-lg shadow-lg shadow-primary/20 transition-all hover:-translate-y-px"
          >
            Vstup
          </Button>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-20 max-w-5xl mx-auto w-full flex-1 justify-center">

        {/* Tag line */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/25 text-primary rounded-full text-[11px] font-semibold tracking-wide mb-8 animate-fade-in">
          <Zap className="w-3.5 h-3.5 fill-current" />
          Exkluzívna privátna sieť · Len pre pozvánky
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 animate-fade-in" style={{ animationDelay: "60ms" }}>
          Herné kľúče pre{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-violet-400 via-primary to-sky-400 bg-clip-text text-transparent text-glow">
              dôveryhodnú
            </span>
          </span>{" "}
          komunitu.
        </h1>

        {/* Sub */}
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed mb-10 animate-fade-in" style={{ animationDelay: "120ms" }}>
          Súkromná distribúcia overených herných licencií. Vstup len s platným členským pasom cez Discord.
        </p>

        {/* CTA */}
        <div className="animate-fade-in" style={{ animationDelay: "180ms" }}>
          <Button
            onClick={() => setLocation("/kniznica")}
            data-testid="button-enter"
            className="bg-primary hover:bg-primary/90 text-white h-12 text-sm font-semibold rounded-lg px-7 shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            Vstúpiť do katalógu
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <span className="font-mono">© 2026 FHP · Fazúľové Herné Poklady</span>
          <div className="flex gap-5 font-mono text-[10px] uppercase tracking-wider">
            <a href="#" className="hover:text-primary transition-colors">Pravidlá</a>
            <span className="text-border">·</span>
            <a href="#" className="hover:text-primary transition-colors">Súkromie</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
