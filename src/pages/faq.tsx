import { useState } from "react";
import { Construction, X, AlertTriangle } from "lucide-react";

export default function FAQ() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Dismissible banner ── */}
      {showBanner && (
        <div className="relative bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Čoskoro</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Podpora a časté otázky sú vo výstavbe. Pracujeme na tom.
            </p>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="border-b border-border/50 pb-8">
        <div className="flex items-center gap-2 text-[11px] font-mono text-primary uppercase tracking-widest mb-3">
          <Construction className="w-3.5 h-3.5" />
          Vo výstavbe
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Podpora & Časté otázky</h1>
        <p className="text-muted-foreground text-sm">
          Táto sekcia je momentálne vo vývoji.
        </p>
      </div>

      {/* ── Skeleton loading cards ── */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-card border border-border/40 rounded-xl p-5 flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3 bg-muted rounded animate-pulse" style={{ width: `${70 - i * 5}%` }} />
              <div className="h-2 bg-muted/50 rounded animate-pulse" style={{ width: `${50 - i * 3}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
