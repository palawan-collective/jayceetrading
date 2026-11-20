import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import AdminLeadPipeline from "./AdminLeadPipeline";

const tools = [
  ["overview", "SEO overview"],
  ["audit", "Website audit"],
  ["rankings", "Search rankings"],
  ["keywords", "Keyword metrics"],
  ["competitors", "Search competitors"],
] as const;

type Report = { source: string; checkedAt: string; result: string };

export default function AdminSeo() {
  const [keywords, setKeywords] = useState("");
  const [trackerId, setTrackerId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<Report>();

  async function load(action: typeof tools[number][0]) {
    setBusy(true);
    setError("");
    setReport(undefined);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Sign in again to use SEO tools.");
      const response = await fetch("/api/seo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          keywords: keywords.split("\n").map(value => value.trim()).filter(Boolean),
          trackerId: trackerId.trim(),
        }),
      });
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("The SEO endpoint is unavailable on this deployment.");
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setReport(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The SEO request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>SEO &amp; Leads</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="block">
            Search terms
            <Textarea value={keywords} onChange={event => setKeywords(event.target.value)} maxLength={809} placeholder="One search term per line, up to ten" />
          </label>
          <p className="text-sm text-muted-foreground">Keyword and competitor requests use OpenSEO credits and the Philippines market.</p>
          <label className="block">
            Tracker ID (optional)
            <Input value={trackerId} onChange={event => setTrackerId(event.target.value)} maxLength={36} placeholder="Leave blank to list trackers" />
          </label>
          <div className="flex flex-wrap gap-2">
            {tools.map(([action, label]) => (
              <Button key={action} variant="outline" disabled={busy} onClick={() => void load(action)}>{label}</Button>
            ))}
          </div>
          {busy && <p role="status">Loading report…</p>}
          {error && <p role="alert">{error}</p>}
          {report && (
            <section aria-label="SEO report">
              <p className="mb-2 text-sm text-muted-foreground">{report.source} · {new Date(report.checkedAt).toLocaleString()}</p>
              <pre className="whitespace-pre-wrap break-words rounded-md bg-muted p-3 text-sm">{report.result}</pre>
            </section>
          )}
        </CardContent>
      </Card>
      <AdminLeadPipeline />
    </div>
  );
}
