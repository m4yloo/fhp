import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="py-24 text-center space-y-6">
      <div className="text-5xl text-primary/30">◆</div>
      <h1 className="font-serif text-2xl font-bold text-foreground">Stránka sa nenašla</h1>
      <p className="text-muted-foreground font-mono text-sm">Táto adresa neexistuje v knižnici.</p>
      <Button
        variant="outline"
        onClick={() => setLocation("/kniznica")}
        className="border-border text-muted-foreground hover:text-foreground"
      >
        Späť do katalógu
      </Button>
    </div>
  );
}
