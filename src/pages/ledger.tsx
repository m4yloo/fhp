import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  History,
  Search,
  ShieldCheck,
  Copy,
  CheckCircle2,
  X,
  Info,
  TrendingUp,
  Package,
  RotateCcw,
} from "lucide-react";

const DENNIK_DATA = [
  {
    id: "trx_9823",
    date: "2024-01-05",
    type: "Získanie",
    polozka: "Hades II",
    mnozstvo: "-1 hra",
    stav: "doručené",
    hash: "6e269f8c6ebf8b9e6ad7fde15a9b752df856ea4f9c1d53fe0a1e50f3b0638ab4",
  },
  {
    id: "trx_9102",
    date: "2023-12-28",
    type: "Nákup",
    polozka: "Limitovaný pas (12 hier)",
    mnozstvo: "14,99 €",
    stav: "doručené",
    hash: "f2c31e9a8fbd74ce52163fa9d832e185ca88e63b68019cf3b12854fe8e0e6490",
  },
  {
    id: "trx_8834",
    date: "2023-12-10",
    type: "Získanie",
    polozka: "Elden Ring",
    mnozstvo: "-1 hra",
    stav: "doručené",
    hash: "a43e8d2e85a069df863920c8de156b82937b830d95101a1c9e88d1d81de8ea67",
  },
  {
    id: "trx_8122",
    date: "2023-11-05",
    type: "Vrátenie",
    polozka: "Kredit za chybnú hru",
    mnozstvo: "+1 hra",
    stav: "vrátené",
    hash: "e573b98ea75c40bcfe830e9d854fe0a1b2d718b5ef1e0f06ce80df2be6209efd",
  },
  {
    id: "trx_7993",
    date: "2023-11-02",
    type: "Získanie",
    polozka: "Outer Wilds",
    mnozstvo: "-1 hra",
    stav: "doručené",
    hash: "cb7389ea8fbd52e1f406ce8d930fe61b2d99ef87b35cf0a0cd89e1d74a00bf82",
  },
  {
    id: "trx_7211",
    date: "2023-10-15",
    type: "Získanie",
    polozka: "Portal 2",
    mnozstvo: "-1 hra",
    stav: "doručené",
    hash: "9a2f1b8c0e6378df8849bcf2e7d35ef1d856faef9012cd39bf09e46a782bd2ea",
  },
];

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  Získanie: { label: "Získanie", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: Package },
  Nákup:    { label: "Nákup",    color: "text-sky-400",    bg: "bg-sky-500/10 border-sky-500/20",       icon: TrendingUp },
  Vrátenie: { label: "Vrátenie", color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20",   icon: RotateCcw },
};

const STAV_CONFIG: Record<string, { color: string; bg: string }> = {
  "doručené": { color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20" },
  "vrátené":  { color: "text-sky-400",     bg: "bg-sky-500/8 border-sky-500/20" },
};

export default function Ledger() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Všetky");
  const [activeTxInfo, setActiveTxInfo] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const filteredData = DENNIK_DATA.filter((row) => {
    const matchesSearch =
      row.polozka.toLowerCase().includes(search.toLowerCase()) ||
      row.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "Všetky" || row.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="border-b border-border/50 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-primary uppercase tracking-widest mb-3">
            <History className="w-3.5 h-3.5" />
            Audit log
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Denník transakcií</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Kryptografický audit zdieľania kľúčov a platieb.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Hľadať ID alebo hru…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-card border-border/60 text-xs font-mono focus-visible:ring-primary rounded-xl"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-card border border-border/60 text-xs px-3 rounded-xl focus:outline-none focus:border-primary text-muted-foreground cursor-pointer font-mono h-9"
          >
            <option value="Všetky">Všetky</option>
            <option value="Získanie">Získania</option>
            <option value="Nákup">Nákupy</option>
            <option value="Vrátenie">Vrátenia</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest border-b border-border/50">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Dátum</th>
                <th className="px-5 py-3.5 font-semibold">ID</th>
                <th className="px-5 py-3.5 font-semibold">Typ</th>
                <th className="px-5 py-3.5 font-semibold">Položka</th>
                <th className="px-5 py-3.5 font-semibold text-right">Hodnota</th>
                <th className="px-5 py-3.5 font-semibold text-center">Stav</th>
                <th className="px-5 py-3.5 font-semibold text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredData.map((row) => {
                const tc = TYPE_CONFIG[row.type];
                const sc = STAV_CONFIG[row.stav] ?? { color: "text-muted-foreground", bg: "bg-card border-border" };
                const TypeIcon = tc?.icon;

                return (
                  <tr
                    key={row.id}
                    data-testid={`row-ledger-${row.id}`}
                    className="hover:bg-background/50 transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono text-muted-foreground whitespace-nowrap text-xs">
                      {row.date}
                    </td>
                    <td className="px-5 py-4 font-mono text-muted-foreground/70 text-xs whitespace-nowrap">
                      {row.id}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold font-mono px-2 py-1 rounded-lg border ${tc?.bg} ${tc?.color}`}>
                        {TypeIcon && <TypeIcon className="w-3 h-3" />}
                        {row.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-foreground font-medium text-sm">
                      {row.polozka}
                    </td>
                    <td className={`px-5 py-4 font-mono text-right font-semibold whitespace-nowrap text-sm ${
                      row.mnozstvo.startsWith("+") || row.mnozstvo.includes("€")
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}>
                      {row.mnozstvo}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 border rounded-full ${sc.bg} ${sc.color}`}>
                        <span className={`w-1 h-1 rounded-full bg-current`} />
                        {row.stav}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setActiveTxInfo(row)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-background border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                        title="Zobraziť audit"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="py-16 text-center text-muted-foreground font-mono text-xs">
              Žiadne transakcie nevyhovujú hľadaniu.
            </div>
          )}
        </div>
      </div>

      {/* ── Audit modal ── */}
      {activeTxInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="max-w-md w-full bg-card border border-border/70 rounded-2xl overflow-hidden shadow-2xl">

            {/* Header */}
            <div className="flex justify-between items-center border-b border-border/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-foreground">Kryptografický audit</span>
              </div>
              <button
                onClick={() => setActiveTxInfo(null)}
                className="w-7 h-7 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 font-mono text-xs">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">ID Transakcie</div>
                <div className="text-foreground font-bold">{activeTxInfo.id}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Dátum</div>
                  <div className="text-foreground">{activeTxInfo.date}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Typ</div>
                  <div className="text-foreground">{activeTxInfo.type}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Položka</div>
                  <div className="text-foreground font-semibold">{activeTxInfo.polozka}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Zmena</div>
                  <div className="text-foreground">{activeTxInfo.mnozstvo}</div>
                </div>
              </div>

              {/* Hash */}
              <div>
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">SHA-256 Hash</div>
                <div className="bg-background border border-border/70 rounded-xl p-3 flex items-start gap-3">
                  <span className="break-all text-foreground/80 leading-relaxed select-all flex-1 text-[10px]">
                    {activeTxInfo.hash}
                  </span>
                  <button
                    onClick={() => handleCopyHash(activeTxInfo.hash)}
                    className="shrink-0 p-1 text-muted-foreground hover:text-primary transition-colors mt-0.5"
                  >
                    {copiedHash
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      : <Copy className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              </div>

              {/* Verified badge */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-emerald-400">Podpísané a overené</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">
                    Tento záznam bol overený v block-ledgeri FHP.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 p-4">
              <Button
                onClick={() => setActiveTxInfo(null)}
                variant="outline"
                className="w-full h-9 text-xs font-mono border-border text-muted-foreground hover:text-foreground"
              >
                Zavrieť
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
