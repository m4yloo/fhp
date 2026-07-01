import { Link, useLocation } from "wouter";
import {
  Gamepad2,
  User,
  History,
  CreditCard,
  HelpCircle,
  LogOut,
  Server,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/kniznica", label: "Katalóg", icon: Gamepad2, shortcut: "K" },
  { href: "/ucet", label: "Môj účet", icon: User, shortcut: "U" },
  { href: "/dennik", label: "Denník", icon: History, shortcut: "D" },
  { href: "/pasy", label: "Členské pasy", icon: CreditCard, shortcut: "P" },
  { href: "/pomoc", label: "Podpora & FAQ", icon: HelpCircle, shortcut: "?" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const isActive = (href: string) =>
    location === href || location.startsWith(href + "/");

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row w-full bg-background text-foreground font-sans selection:bg-primary/25 selection:text-primary-foreground">

      {/* ── Sidebar ── */}
      <nav className="
        w-full md:w-60 shrink-0
        border-b md:border-b-0 md:border-r border-border/50
        bg-sidebar
        flex flex-col
        relative z-30
      ">
        {/* Subtle gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="flex flex-col flex-1 p-5 gap-6">
          {/* ── Logo ── */}
          <Link href="/kniznica" className="flex items-center gap-3 group py-1">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 glow-primary-sm shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-white font-extrabold text-base leading-none">F</span>
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm tracking-tight text-foreground">FHP</div>
              <div className="text-[9px] font-mono text-muted-foreground truncate">Fazúľové Poklady</div>
            </div>
          </Link>

          {/* ── Nav links ── */}
          <div className="flex flex-col gap-0.5">
            <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 px-2 mb-1.5">Navigácia</div>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={`nav-${item.href.replace("/", "")}`}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                    ${active
                      ? "bg-primary/12 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"}`} />
                  <span className="flex-1 leading-none">{item.label}</span>
                  {active && <ChevronRight className="w-3 h-3 text-primary/50" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Sidebar footer ── */}
        <div className="p-5 border-t border-border/50 flex flex-col gap-3">
          {/* Bot status */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-card border border-border/60 rounded-lg">
            <div className="relative shrink-0">
              <Server className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-sidebar" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-foreground leading-tight">FHP Bot</div>
              <div className="text-[9px] text-emerald-400 font-mono">Online · Sync</div>
            </div>
            <div className="text-[10px] font-bold font-mono text-primary">1,420</div>
          </div>

          {/* User card */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-primary/5 border border-primary/15 rounded-lg">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary font-mono">
                BE
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#5865F2] border border-sidebar flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">bean_enjoyer</div>
              <div className="text-[9px] text-muted-foreground font-mono truncate">Limitovaný pas · 8/12</div>
            </div>
          </div>

          {/* Log out */}
          <div className="flex items-center justify-between px-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              <LogOut className="w-3 h-3" />
              Odhlásiť sa
            </Link>
            <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Secure
            </span>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="flex-1 min-w-0 overflow-x-hidden relative">
        {/* Background glow */}
        <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-primary/4 rounded-full blur-[160px] -translate-y-1/2 translate-x-1/3" />

        <div className="max-w-6xl mx-auto w-full p-6 md:p-10 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
