import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { MOCK_GAMES } from "@/data/games";
import { 
  ArrowLeft, 
  Layers, 
  Calendar, 
  HardDrive, 
  Star, 
  Terminal, 
  ShieldCheck, 
  CheckCircle, 
  Copy, 
  Sparkles, 
  Cpu 
} from "lucide-react";

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const game = MOCK_GAMES.find((g) => g.id === Number(id));

  // Key claiming state
  const [claimState, setClaimState] = useState<"idle" | "verifying" | "success">("idle");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  if (!game) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="font-mono text-muted-foreground text-sm">Hra sa nenašla v knižnici.</p>
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

  // Simulate secure license lookup
  const handleClaimKey = () => {
    setClaimState("verifying");
    
    setTimeout(() => {
      // Generate simulated but authentic-looking key
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const rWord = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      const key = `${rWord(5)}-${rWord(5)}-${rWord(5)}`;
      
      setGeneratedKey(key);
      setClaimState("success");
    }, 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-12 max-w-5xl">
      {/* Back button */}
      <button
        onClick={() => setLocation("/kniznica")}
        data-testid="button-back"
        className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Späť do katalógu
      </button>

      {/* Hero Header Card */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10 md:gap-16 items-start">
        {/* Left Side: Game Cover & Details */}
        <div className="flex flex-col gap-4 w-full">
          <div className="relative aspect-[3/4] bg-[#0c0b11] border border-border/80 overflow-hidden rounded-xl shadow-2xl">
            <img
              src={game.image}
              alt={game.title}
              className={`w-full h-full object-cover ${!game.available ? "opacity-45 grayscale" : ""}`}
            />
            {!game.available && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <span className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground border border-border px-3 py-1.5 bg-card/60 rounded">
                  Nedostupné
                </span>
              </div>
            )}
          </div>

          {/* Quick Specifications table */}
          <div className="border border-border/60 bg-[#08080c] rounded-xl p-4 space-y-3.5 text-xs font-mono">
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Platforma</span>
              <span className="text-foreground font-semibold uppercase">{game.platform}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Žáner</span>
              <span className="text-foreground font-semibold text-right">{game.genre}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Rok Vydania</span>
              <span className="text-foreground font-semibold">{game.year}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Developer</span>
              <span className="text-foreground font-semibold truncate max-w-[140px] text-right">{game.developer}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Veľkosť</span>
              <span className="text-foreground font-semibold">{game.size}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Stav kľúčov</span>
              <span className={game.available ? "text-primary font-semibold" : "text-muted-foreground"}>
                {game.available ? "Na sklade (Dostupné)" : "Vypredané"}
              </span>
            </div>
          </div>

          {/* Steam License Claim Button / Status */}
          {game.available ? (
            claimState === "idle" && (
              <Button
                onClick={handleClaimKey}
                data-testid="button-ziskat-detail"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs uppercase tracking-widest h-12 rounded-xl shadow-lg shadow-primary/10 transition-transform duration-200 hover:-translate-y-0.5"
              >
                Získať Hru (Claim Key)
              </Button>
            )
          ) : (
            <Button
              disabled
              data-testid="button-ziskat-detail-disabled"
              className="w-full font-mono text-xs uppercase tracking-wide h-12 rounded-xl"
            >
              Momentálne nedostupné
            </Button>
          )}

          {/* Key Claim Simulator UI */}
          {claimState === "verifying" && (
            <div className="bg-[#0f0e15] border border-primary/20 rounded-xl p-4 text-center space-y-3 font-mono text-[11px] animate-pulse text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <p className="text-primary font-semibold">OVEROVANIE LICENCIE...</p>
                <p className="text-[9px]">Sťahujem kryptografický kľúč z FHP databázy</p>
              </div>
            </div>
          )}

          {claimState === "success" && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 text-center space-y-4 animate-fade-in">
              <div className="flex items-center justify-center gap-1.5 text-emerald-500 font-mono text-xs font-bold uppercase">
                <CheckCircle className="w-4 h-4 fill-current" /> Licencia Získaná!
              </div>
              
              {/* Boxed key */}
              <div className="bg-[#040406] border border-border/80 p-2.5 rounded-lg flex items-center justify-between font-mono text-xs select-all text-foreground">
                <span className="font-semibold tracking-wider">{generatedKey}</span>
                <button
                  onClick={handleCopyKey}
                  className="p-1 hover:text-primary transition-colors text-muted-foreground"
                  title="Kopírovať kľúč"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {isCopied && (
                <div className="text-[10px] text-emerald-400 font-mono -mt-2 animate-bounce">
                  Kľúč skopírovaný do schránky!
                </div>
              )}

              <div className="text-[9px] text-muted-foreground leading-normal font-mono">
                Aktivujte tento kód vo vašom {game.platform} klientovi. Táto transakcia bola podpísaná a zapísaná v Denníku.
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Title, Details, and Live Playable Preview */}
        <div className="space-y-8">
          <div>
            {/* Tagline */}
            <div className="flex items-center gap-2.5 text-primary text-xs font-mono uppercase tracking-widest mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>{game.genre}</span>
              <span>·</span>
              <Calendar className="w-3.5 h-3.5" />
              <span>{game.year}</span>
              <span>·</span>
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-foreground font-semibold">{game.rating}</span>
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              {game.title}
            </h1>
            
            <p className="text-muted-foreground text-base leading-relaxed">
              {game.description}
            </p>
          </div>

          {/* Description details */}
          <div className="border-t border-border/40 pt-8 space-y-4">
            {game.longDescription.split("\n\n").map((para, i) => (
              <p key={i} className="text-[#c4c4c9] leading-relaxed text-sm">
                {para}
              </p>
            ))}
          </div>

          {/* Game Tags list */}
          <div className="flex flex-wrap gap-2 pt-2">
            {game.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-card border border-border/80 rounded-md text-[10px] font-mono text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Features list */}
          <div className="border-t border-border/40 pt-8">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Hlavné Vlastnosti</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {game.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="text-primary text-xs mt-1 shrink-0">◆</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hardware Requirements */}
          <div className="border-t border-border/40 pt-8 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Hardvérové Požiadavky
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-[11px] leading-relaxed">
              {/* Minimum */}
              <div className="bg-[#08080c] border border-border/50 p-4 rounded-xl space-y-2">
                <div className="text-muted-foreground uppercase text-[10px] font-bold border-b border-border/30 pb-1 text-primary">Minimálne požiadavky</div>
                <div><span className="text-muted-foreground">OS:</span> {game.sysRequirementsMin.os}</div>
                <div><span className="text-muted-foreground">CPU:</span> {game.sysRequirementsMin.cpu}</div>
                <div><span className="text-muted-foreground">RAM:</span> {game.sysRequirementsMin.ram}</div>
                <div><span className="text-muted-foreground">GPU:</span> {game.sysRequirementsMin.gpu}</div>
                <div><span className="text-muted-foreground">Disk:</span> {game.sysRequirementsMin.storage}</div>
              </div>

              {/* Recommended */}
              <div className="bg-[#08080c] border border-primary/10 p-4 rounded-xl space-y-2">
                <div className="text-muted-foreground uppercase text-[10px] font-bold border-b border-border/30 pb-1 text-[#e3e3e6]">Odporúčané požiadavky</div>
                <div><span className="text-muted-foreground">OS:</span> {game.sysRequirementsRec.os}</div>
                <div><span className="text-muted-foreground">CPU:</span> {game.sysRequirementsRec.cpu}</div>
                <div><span className="text-muted-foreground">RAM:</span> {game.sysRequirementsRec.ram}</div>
                <div><span className="text-muted-foreground">GPU:</span> {game.sysRequirementsRec.gpu}</div>
                <div><span className="text-muted-foreground">Disk:</span> {game.sysRequirementsRec.storage}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
