import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// TEMPORARY: admin sign-in is switched off while the client presentation runs.
// Set VITE_ADMIN_OPEN_ACCESS to "false" in the Vercel environment to turn the
// email and password screen back on. Everything below still works unchanged
// once a signed-in JayCee admin is present.
const OPEN_ACCESS = import.meta.env.VITE_ADMIN_OPEN_ACCESS !== "false";

export default function AdminAccess() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "SIGNED_OUT") queryClient.clear();
      setSession(next);
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const result = await supabase.auth.signInWithPassword({
        email: String(fields.get("email")).trim(),
        password: String(fields.get("password")),
      });
      if (result.error) setError("Sign-in failed. Check your email and password and try again.");
    } catch {
      setError("Sign-in is unavailable. Try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  if (OPEN_ACCESS || session?.user.app_metadata.jaycee_admin === true) return <Outlet />;
  if (session === undefined) return <p role="status" className="p-6">Checking admin access…</p>;

  const content: ReactNode = session ? (
    <>
      <p role="alert">This account does not have Jaycee admin access.</p>
      <Button onClick={() => void supabase.auth.signOut({ scope: "local" })}>Sign out</Button>
    </>
  ) : (
    <form onSubmit={signIn} className="space-y-4">
      <label className="block">Email<Input name="email" type="email" autoComplete="username" required /></label>
      <label className="block">Password<Input name="password" type="password" autoComplete="current-password" required /></label>
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Signing in…" : "Sign in"}</Button>
    </form>
  );

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Admin Access</CardTitle></CardHeader>
        <CardContent className="space-y-4">{content}</CardContent>
      </Card>
    </div>
  );
}
