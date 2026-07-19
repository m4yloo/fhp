import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Overujeme bezpečné prihlásenie...");

  useEffect(() => {
    const finish = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const oauthError = params.get("error_description") || params.get("error");

      if (oauthError) {
        setStatus("error");
        setMessage(decodeURIComponent(oauthError.replace(/\+/g, " ")));
        return;
      }
      if (!code) {
        setStatus("error");
        setMessage("Chýba autorizačný kód. Skúste sa prihlásiť znova.");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setStatus("error");
        setMessage("Prihlásenie sa nepodarilo dokončiť. Skúste to znova.");
        return;
      }

      setStatus("success");
      setMessage("Prihlásenie bolo úspešné.");
      if (window.opener && !window.opener.closed) {
        window.opener.location.assign("/kniznica");
        window.setTimeout(() => window.close(), 500);
      } else {
        window.setTimeout(() => setLocation("/kniznica"), 500);
      }
    };

    void finish();
  }, [setLocation]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
        {status === "loading" && <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />}
        {status === "success" && <CheckCircle2 className="size-8 text-primary" aria-hidden="true" />}
        {status === "error" && <AlertCircle className="size-8 text-destructive" aria-hidden="true" />}
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold">{status === "error" ? "Prihlásenie zlyhalo" : "Prihlasovanie do FHP"}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
        </div>
        {status === "error" && <Button onClick={() => setLocation("/prihlasenie")}>Späť na prihlásenie</Button>}
      </section>
    </main>
  );
}
