import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Lock } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Container } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff Login — PulseGear" },
      {
        name: "description",
        content: "Sign in to manage the PulseGear catalog, brands, categories and inquiries.",
      },
      { property: "og:title", content: "Staff Login — PulseGear" },
      { property: "og:description", content: "Admin access to the PulseGear catalog." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });
    setBusy(false);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      toast.success("Check your inbox to confirm your email.");
      return;
    }
    toast.success("Signed in");
    navigate({ to: "/admin" });
  };

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="glass w-full max-w-md rounded-3xl p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Lock className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">
          {mode === "signin" ? "Staff login" : "Create staff account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin access to the catalog. Customers don't need an account to browse.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </Container>
  );
}
