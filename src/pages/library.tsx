import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { useGames } from "@/hooks/useGames";
import type { Game } from "@/lib/types";
import { Search, X, Star } from "lucide-react";

// Friendly Slovak labels for the raw IGDB genre strings.
const GENRE_LABELS: Record<string, string> = {
  "Role-playing (RPG)": "RPG",
  "Shooter": "Akčné",
  "Platform": "Platformovky",
  "Puzzle": "Hlavolamy",
  "Simulator": "Simulátory",
  "Adventure": "Dobrodružstvá",
  "Point-and-click": "Point-and-click",
  "Fighting": "Súbojovky",
  "Racing": "Závody",
  "Music": "Hudba",
  "Hack and slash/Beat 'em up": "Hack & Slash",
  "Strategy": "Stratégie",
  "Sport": "Šport",
  "Real Time Strategy (RTS)": "RTS",
  "Indie": "Indie",
};

export default function Library() {
  const { data: games = [], isLoading, isError } = useGames();
  const [selectedGenre, setSelectedGenre] = useState("Všetky");
  const [search, setSearch] = useState("");       // search-box text (does NOT filter the grid)
  const [searchOpen, setSearchOpen] = useState(false); // controls the dropdown
  const [, setLocation] = useLocation();
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Build the genre filter buttons from the genres actually present in the data.
  const genres = useMemo(() => {
    const present = Array.from(new Set(games.map((g) => g.genre)));
    const labeled = present.map((g) => GENRE_LABELS[g] || g);
    const unique = Array.from(new Set(labeled));
    return ["Všetky", ...unique];
  }, [games]);

  const labelToRawGenres = (label: string): string[] =>
    Object.entries(GENRE_LABELS)
      .filter(([, lbl]) => lbl === label)
      .map(([raw]) => raw);

  // Grid is filtered ONLY by genre, never by search.
  const filtered = games.filter((g) => {
    if (selectedGenre === "Všetky") return true;
    const rawMatches = labelToRawGenres(selectedGenre);
    return rawMatches.includes(g.genre);
  });

  // Pagination: render in batches to keep the DOM light (4k+ games at once
  // would jank the browser). Reset the visible count whenever the filter changes.
  const VISIBLE_STEP = 30;
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);
  useEffect(() => setVisibleCount(VISIBLE_STEP), [selectedGenre]);
  const visible = filtered.slice(0, visibleCount);

  // Featured banner: a random game from the current filter, picked once per
  // genre selection. It is intentionally excluded from being the first grid
  // card so the spotlight is always something different from card #1.
  const [featured, setFeatured] = useState<Game | null>(null);
  useEffect(() => {
    const pool = filtered.length > 1 ? filtered.slice(1) : filtered;
    if (pool.length === 0) {
      setFeatured(null);
      return;
    }
    setFeatured(pool[Math.floor(Math.random() * pool.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenre]);

  // Search dropdown matches: filters games by title/genre for navigation only.
  const searchMatches = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return [];
    return games.filter(
      (g) =>
        g.title.toLowerCase().includes(s) ||
        g.genre.toLowerCase().includes(s) ||
        (GENRE_LABELS[g.genre] || g.genre).toLowerCase().includes(s)
    ).slice(0, 8);
  }, [search, games]);

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  const pickGame = (id: number) => {
    setSearch("");
    setSearchOpen(false);
    setLocation(`/hra/${id}`);
  };

  return (
    <div className="flex flex-col gap-10">

      {/* ── Featured banner ── */}
      {featured && (
        <div
          onClick={() => setLocation(`/hra/${featured.id}`)}
          className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden cursor-pointer group"
        >
          <img
            src={featured.image}
            alt={featured.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {featured.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] font-mono uppercase tracking-wider text-white/60 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
              {featured.title}
            </h2>
            <p className="text-sm text-white/50 max-w-lg mb-4 hidden sm:block">{featured.description}</p>
            <div className="flex items-center gap-3 text-xs text-white/40 font-mono">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-yellow-300">{featured.rating.split(" ")[0]}</span>
              </div>
              <span>·</span>
              <span>{featured.developer}</span>
              <span>·</span>
              <span>{featured.year}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-foreground shrink-0">Katalóg</h2>
          <div className="h-px flex-1 bg-border/40" />

          {/* Search box with dropdown */}
          <div className="relative w-56" ref={searchBoxRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
            <Input
              placeholder="Hľadať…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              data-testid="input-search"
              className="pl-9 pr-8 bg-card border-border/60 h-8 text-xs font-mono rounded-lg"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setSearchOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Dropdown results */}
            {searchOpen && search.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                {searchMatches.length === 0 ? (
                  <div className="px-3 py-3 text-[11px] font-mono text-muted-foreground">
                    Žiadne výsledky.
                  </div>
                ) : (
                  searchMatches.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => pickGame(g.id)}
                      data-testid={`search-result-${g.id}`}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-accent transition-colors"
                    >
                      <img
                        src={g.image}
                        alt=""
                        className="w-8 h-8 rounded object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-foreground truncate">{g.title}</div>
                        <div className="text-[10px] font-mono text-muted-foreground truncate">
                          {GENRE_LABELS[g.genre] || g.genre} · {g.year}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-yellow-300 shrink-0">
                        {g.rating.split(" ")[0]}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedGenre === g
                  ? "bg-primary text-white"
                  : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-muted-foreground font-mono">
            {filtered.length} hier
          </span>
        </div>
      </div>

      {/* ── Empty ── */}
      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground text-sm font-mono border border-dashed border-border/40 rounded-xl">
          Žiadne výsledky.
        </div>
      )}

      {/* ── Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6">
        {visible.map((game) => (
          <div
            key={game.id}
            data-testid={`card-game-${game.id}`}
            className="group cursor-pointer"
            onClick={() => setLocation(`/hra/${game.id}`)}
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border/40 group-hover:border-primary/40 transition-all duration-200 mb-2.5 group-hover:shadow-lg group-hover:shadow-primary/8">
              <img
                src={game.image}
                alt={game.title}
                loading="lazy"
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  game.available ? "" : "grayscale opacity-30"
                }`}
              />
              {!game.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground bg-card/90 border border-border/50 px-2.5 py-1 rounded">Nedostupné</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                <span className="text-[9px] font-mono text-yellow-300">{game.rating.split(" ")[0]}</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{game.title}</p>
            <p className="text-[11px] text-muted-foreground font-mono truncate">{game.genre}</p>
          </div>
        ))}
      </div>

      {/* ── Load more ── */}
      {visibleCount < filtered.length && (
        <div className="flex flex-col items-center gap-1.5 pt-2">
          <button
            onClick={() => setVisibleCount((c) => c + VISIBLE_STEP)}
            data-testid="button-load-more"
            className="px-5 py-2.5 rounded-lg bg-card border border-border/60 hover:border-primary/60 text-muted-foreground hover:text-primary transition-all text-xs font-mono uppercase tracking-widest"
          >
            Načítať ďalšie ({filtered.length - visibleCount} zostáva)
          </button>
          <span className="text-[11px] text-muted-foreground font-mono">
            {visibleCount} z {filtered.length}
          </span>
        </div>
      )}
    </div>
  );
}
