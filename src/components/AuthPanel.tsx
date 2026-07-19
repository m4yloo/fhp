import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useAuthContext } from "@/lib/auth-provider";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

 type AuthPanelProps = {
  embedded?: boolean;
  onAuthenticated?: () => void;
};

function getAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const normalized = message.toLowerCase();

  if (normalized.includes("nie je nakonfigurovan") || normalized.includes("chýba verejná")) {
    return "Prihlásenie nie je v tomto prostredí nakonfigurované. Skontrolujte verejné Supabase premenné projektu.";
  }
  if (normalized.includes("invalid login credentials")) return "Nesprávny e-mail alebo heslo.";
  if (normalized.includes("email not confirmed")) return "E-mail ešte nebol potvrdený. Skontrolujte svoju schránku.";
  if (normalized.includes("provider") && normalized.includes("enabled")) return "Tento spôsob prihlásenia nie je povolený.";
  if (normalized.includes("popup")) return "Vyskakovacie okno bolo zablokované. Povoľte ho a skúste to znova.";
  if (normalized.includes("failed to fetch") || normalized.includes("networkerror")) {
    return "Server prihlásenia je momentálne nedostupný. Skontrolujte pripojenie a skúste to znova.";
  }
  if (normalized.includes("already registered")) return "Účet s týmto e-mailom už existuje.";
  if (normalized.includes("password")) return "Heslo musí mať aspoň 6 znakov.";
  return message || "Prihlásenie sa nepodarilo. Skúste to znova.";
}

export function AuthPanel({ embedded = false, onAuthenticated }: AuthPanelProps) {
  const { signIn, signInWithOAuth, signUp, loading, user } = useAuthContext();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isSignIn = mode === "signin";

  useEffect(() => {
    if (user && onAuthenticated) onAuthenticated();
  }, [user, onAuthenticated]);

  const clearFeedback = () => {
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    try {
      if (isSignIn) {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, username.trim());
        setSuccess("Účet je vytvorený. Potvrďte e-mail cez odkaz vo svojej schránke.");
        setMode("signin");
      }
    } catch (authError) {
      setError(getAuthError(authError));
    }
  };

  const handleOAuth = async (provider: "discord" | "google") => {
    clearFeedback();
    try {
      await signInWithOAuth(provider);
    } catch (authError) {
      setError(getAuthError(authError));
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <header className="flex flex-col gap-2 text-center">
        <div className="mx-auto flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
          Bezpečný prístup k herným pokladom
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
          {isSignIn ? "Vitajte späť vo FHP" : "Vytvorte si FHP účet"}
        </h1>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {isSignIn
            ? "Prihláste sa a pokračujte vo svojej hernej knižnici."
            : "Jedno konto pre knižnicu, pasy aj históriu aktivít."}
        </p>
      </header>

      {!isSupabaseConfigured && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Prihlásenie nie je pripravené</AlertTitle>
          <AlertDescription>V projekte chýba verejná konfigurácia Supabase.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" className="h-11" onClick={() => handleOAuth("discord")} disabled={loading || !isSupabaseConfigured}>
          Discord
        </Button>
        <Button type="button" variant="secondary" className="h-11" onClick={() => handleOAuth("google")} disabled={loading || !isSupabaseConfigured}>
          Google
        </Button>
      </div>

      <div className="flex items-center gap-3" aria-hidden="true">
        <Separator className="flex-1" />
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">alebo e-mailom</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isSignIn && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Prihlasovacie meno</Label>
            <Input id="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required minLength={2} placeholder="napr. fazulka92" className="h-11" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="hrac@example.sk" className="h-11" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Heslo</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignIn ? "current-password" : "new-password"} required minLength={6} placeholder="Minimálne 6 znakov" className="h-11 pr-11" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label={showPassword ? "Skryť heslo" : "Zobraziť heslo"}>
              {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Nepodarilo sa pokračovať</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <CheckCircle2 aria-hidden="true" />
            <AlertTitle>Skontrolujte e-mail</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="h-11" disabled={loading || !isSupabaseConfigured}>
          {loading && <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />}
          {loading ? "Pripájam..." : isSignIn ? "Prihlásiť sa" : "Vytvoriť účet"}
        </Button>
      </form>

      <Button type="button" variant="ghost" onClick={() => { setMode(isSignIn ? "signup" : "signin"); clearFeedback(); }}>
        {isSignIn ? "Nemáte účet? Zaregistrujte sa" : "Už máte účet? Prihláste sa"}
      </Button>
      {!embedded && <p className="text-center text-xs leading-relaxed text-muted-foreground">Pokračovaním súhlasíte s bezpečným spracovaním údajov potrebných pre váš účet.</p>}
    </div>
  );
}
