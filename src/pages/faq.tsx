import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, ShieldCheck, Mail, Users, Key, AlertTriangle, Lock } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: "item-1",
    icon: Users,
    q: "Ako získam pozvánku do FHP klubu?",
    a: (
      <>
        <p>
          FHP funguje ako uzavretá komunita pre registrovaných členov. Noví členovia sú prijímaní len vtedy, keď to kapacita licencovania a infraštruktúra dovoľuje.
        </p>
        <p>
          Pre periodické otvorenie náboru sledujte kanál{" "}
          <code className="bg-background border border-border/70 px-1.5 py-0.5 rounded text-primary font-mono">#oznamenia</code>{" "}
          na našom hlavnom Discord serveri. Registrácia vyžaduje odporúčanie aspoň jedného aktívneho člena.
        </p>
      </>
    ),
  },
  {
    id: "item-2",
    icon: Key,
    q: "Odkiaľ pochádzajú herné kľúče a licencie?",
    a: (
      <>
        <p>
          Všetky licencie sú legálne zakúpené z oficiálnych distribúcií (Steam, Epic Store, GOG) a financované z príspevkov za členské pasy a darov komunity.
        </p>
        <p>
          Každá aktivácia je podpísaná unikátnym SHA-256 hash podpisom v internej databáze pre zabezpečenie proti duplicitnému zneužitiu.
        </p>
      </>
    ),
  },
  {
    id: "item-3",
    icon: AlertTriangle,
    q: "Čo sa stane, ak s kľúčom nastane nejaký problém?",
    a: (
      <>
        <p>
          Aj keď každý kľúč pred distribúciou prísne overujeme, výnimočne môže nastať technický nesúlad (napr. regionálny zámok).
        </p>
        <div className="bg-background border border-border/70 p-4 rounded-xl font-mono text-[11px] text-foreground leading-relaxed">
          <div className="text-primary font-bold mb-2 uppercase tracking-wider text-[9px]">Postup reklamácie</div>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex gap-2"><span className="text-primary shrink-0">01</span> Otvorte ticket cez náš Discord support bot.</div>
            <div className="flex gap-2"><span className="text-primary shrink-0">02</span> Tím preverí transakciu do 12 hodín.</div>
            <div className="flex gap-2"><span className="text-primary shrink-0">03</span> Náhradný kód alebo kredit je vydaný automaticky.</div>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "item-4",
    icon: ShieldCheck,
    q: "Môžem zakúpený kľúč darovať alebo zdieľať účet?",
    a: (
      <>
        <p>
          Hry získané cez FHP sú určené výhradne na osobné použitie na vašom spárovanom Steam/Epic účte. Akýkoľvek ďalší predaj alebo automatizované skrapovanie kľúčov vedie k okamžitému banu.
        </p>
        <p>
          Darovanie hry priateľovi je povolené výhradne pri Limitovanom pase prostredníctvom funkcie{" "}
          <span className="text-foreground font-semibold">„Generovať darovací odkaz"</span>{" "}
          v detaile hry.
        </p>
      </>
    ),
  },
  {
    id: "item-5",
    icon: Key,
    q: "Aký je rozdiel medzi Limitovaným a Neobmedzeným pasom?",
    a: (
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-background border border-border/70 rounded-xl p-4 space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Limitovaný</div>
          <div className="font-bold text-foreground">14,99 €</div>
          <p>Jednorazový poplatok. Dáva presne 12 herných kľúčov. Hry zostávajú natrvalo.</p>
        </div>
        <div className="bg-primary/6 border border-primary/20 rounded-xl p-4 space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-primary">Neobmedzený</div>
          <div className="font-bold text-foreground">29,99 € / 30 dní</div>
          <p>Predplatné. Plná knižnica bez obmedzení, prioritná podpora, skorý prístup k novým hrám.</p>
        </div>
      </div>
    ),
  },
  {
    id: "item-6",
    icon: Lock,
    q: "Ako je zabezpečená ochrana mojich osobných údajov?",
    a: (
      <p>
        Nepožadujeme žiadne heslá k herným účtom. Prihlásenie prebieha cez zabezpečený OAuth 2.0 protokol na serveroch Discordu. Získavame len vaše užívateľské meno pre spárovanie s členským pasom. Všetky platobné brány sú šifrované (PCI-DSS).
      </p>
    ),
  },
];

export default function FAQ() {
  return (
    <div className="space-y-10 max-w-3xl">

      {/* ── Header ── */}
      <div className="border-b border-border/50 pb-8">
        <div className="flex items-center gap-2 text-[11px] font-mono text-primary uppercase tracking-widest mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          Pomoc
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Podpora & Časté otázky</h1>
        <p className="text-muted-foreground text-sm">
          Pravidlá fungovania súkromnej knižnice FHP a bezpečnosť licencií.
        </p>
      </div>

      {/* ── Accordion ── */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
        <Accordion type="multiple" className="w-full">
          {FAQ_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <AccordionItem
                key={item.id}
                value={item.id}
                className={`border-border/50 ${idx === FAQ_ITEMS.length - 1 ? "border-b-0" : ""}`}
              >
                <AccordionTrigger className="px-6 py-5 text-left hover:no-underline group">
                  <div className="flex items-center gap-3 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    {item.q}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="ml-10 text-sm text-muted-foreground leading-relaxed space-y-3">
                    {item.a}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* ── Footer trust bar ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-t border-border/40 pt-8">
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
          <ShieldCheck className="w-4 h-4" />
          Licencovaný portál súkromnej distribúcie
        </div>
        <a
          href="mailto:kontakt@fhp.internal"
          className="flex items-center gap-2 bg-card border border-border/60 hover:border-primary/40 px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-primary transition-all"
        >
          <Mail className="w-3.5 h-3.5 text-primary" />
          kontakt@fhp.internal
        </a>
      </div>
    </div>
  );
}
