import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import AdminLeadPipeline from "./AdminLeadPipeline";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Globe2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";

const tools = [
  ["overview", "SEO overview"],
  ["audit", "Website audit"],
  ["rankings", "Search rankings"],
  ["keywords", "Keyword metrics"],
  ["competitors", "Search competitors"],
] as const;

type Report = { source: string; checkedAt: string; result: string };
type CheckStatus = "pass" | "warn" | "fail";
type FootprintCheck = { id: string; label: string; status: CheckStatus; detail: string };
type Footprint = {
  source: string;
  checkedAt: string;
  score: number;
  passed: number;
  total: number;
  pages: number;
  schemaTypes: string[];
  aiFile: boolean;
  checks: FootprintCheck[];
};

const ADD_ON_MONTHLY = "₱2,500";
const ADD_ON_YEARLY = "₱25,000";

function checkIcon(status: CheckStatus) {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />;
  return <XCircle className="h-4 w-4 shrink-0 text-red-500" />;
}

function statusChip(status: "live" | "ready" | "todo" | "setup") {
  const styles = {
    live: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ready: "bg-blue-50 text-blue-700 border-blue-200",
    todo: "bg-amber-50 text-amber-700 border-amber-200",
    setup: "bg-red-50 text-red-700 border-red-200",
  } as const;
  const label = { live: "Live", ready: "Ready", todo: "Not connected", setup: "Needs work" } as const;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}>{label[status]}</span>
  );
}

export default function AdminSeo() {
  const [keywords, setKeywords] = useState("");
  const [trackerId, setTrackerId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<Report>();

  const [footprint, setFootprint] = useState<Footprint>();
  const [footprintBusy, setFootprintBusy] = useState(true);
  const [footprintError, setFootprintError] = useState("");
  const [profiles, setProfiles] = useState<string[]>([]);
  const [requested, setRequested] = useState(false);

  async function session() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  const loadFootprint = useCallback(async () => {
    setFootprintBusy(true);
    setFootprintError("");
    try {
      const token = await session();
      const response = await fetch("/api/seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: "footprint" }),
      });
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("The SEO endpoint is unavailable on this deployment.");
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setFootprint(result);
    } catch (cause) {
      setFootprintError(cause instanceof Error ? cause.message : "Could not check the site.");
    } finally {
      setFootprintBusy(false);
    }
  }, []);

  useEffect(() => {
    void loadFootprint();
    void supabase
      .from("social_media_links")
      .select("platform_name,is_enabled")
      .then(({ data }) => {
        setProfiles((data ?? []).filter(link => link.is_enabled).map(link => link.platform_name));
      });
  }, [loadFootprint]);

  async function load(action: typeof tools[number][0]) {
    setBusy(true);
    setError("");
    setReport(undefined);
    try {
      const token = await session();
      const response = await fetch("/api/seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  const byId = (id: string) => footprint?.checks.find(check => check.id === id);
  const searchReady = ["title", "description", "robots", "sitemap"].every(id => byId(id)?.status === "pass");
  const aiReady = byId("schema")?.status === "pass" && Boolean(footprint?.aiFile) && byId("description")?.status === "pass";

  const channels = [
    {
      icon: <Search className="h-4 w-4" />,
      name: "Google Search",
      scope: "Organic results",
      detail: searchReady ? "Pages are indexable and the sitemap is published" : "Finish the technical fixes below",
      status: searchReady ? ("live" as const) : ("setup" as const),
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      name: "Google Business Profile",
      scope: "Maps and local pack",
      detail: "Free listing with photos, hours, location and reviews",
      status: "todo" as const,
    },
    {
      icon: <Globe2 className="h-4 w-4" />,
      name: "Bing",
      scope: "Bing organic results",
      detail: searchReady ? "Sitemap detected, pages eligible" : "Needs the same fixes as Google",
      status: searchReady ? ("live" as const) : ("setup" as const),
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      name: "ChatGPT",
      scope: "Business listing and recommendations",
      detail: "Add the business so ChatGPT can recommend it by name",
      status: "todo" as const,
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      name: "Gemini and AI Overviews",
      scope: "Answers inside Google",
      detail: aiReady ? "Structured business facts are ready to cite" : "Add structured data and an AI guide",
      status: aiReady ? ("ready" as const) : ("setup" as const),
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      name: "Perplexity",
      scope: "Cited answers with sources",
      detail: aiReady ? "Crawlable pages with clear facts to quote" : "Add structured data and an AI guide",
      status: aiReady ? ("ready" as const) : ("setup" as const),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Digital footprint</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              How JayCee Trading &amp; Services appears in Google, Bing and AI answer engines. Checked live against the published site.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadFootprint()} disabled={footprintBusy}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${footprintBusy ? "animate-spin" : ""}`} />
            {footprintBusy ? "Checking" : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {footprintError && <p role="alert" className="text-sm text-red-600">{footprintError}</p>}
          {footprint && (
            <>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Organic search readiness</p>
                    <p className="text-3xl font-semibold">{footprint.score}%</p>
                    <p className="text-xs text-muted-foreground">
                      {footprint.passed} of {footprint.total} checks passing · {footprint.pages} pages in the sitemap
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last checked {new Date(footprint.checkedAt).toLocaleString()}
                  </p>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${footprint.score}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {channels.map(channel => (
                  <div key={channel.name} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {channel.icon}
                        {channel.name}
                      </p>
                      {statusChip(channel.status)}
                    </div>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{channel.scope}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{channel.detail}</p>
                  </div>
                ))}
              </div>

              {profiles.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Connected profiles: {profiles.join(" · ")}
                </p>
              )}

              <div>
                <p className="mb-2 text-sm font-medium">Technical foundation</p>
                <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                  {footprint.checks.map(check => (
                    <div key={check.id} className="flex items-start gap-2">
                      {checkIcon(check.status)}
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{check.label}</p>
                        <p className="truncate text-[11px] text-muted-foreground" title={check.detail}>{check.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-dashed border-primary/40 bg-primary/[0.03]">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              Added feature
            </span>
            <p className="text-xs text-muted-foreground">Optional add-on · organic SEO stays included</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Search &amp; AI visibility</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Organic SEO is part of your plan. This add-on is the monitoring and growth layer on top of it — so you can see,
              month by month, what customers find you for and where AI engines recommend you.
            </p>
          </div>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {[
              "Monthly keyword tracking for 25 buyer searches in the Philippines",
              "AI citation checks across ChatGPT, Gemini, Perplexity and Copilot",
              "Competitor gap report with a plain-language action list",
              "Google Business Profile setup, review flow and map visibility",
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
            <div>
              <p className="text-2xl font-semibold">
                {ADD_ON_MONTHLY}
                <span className="text-sm font-normal text-muted-foreground"> / month</span>
              </p>
              <p className="text-xs text-muted-foreground">Per location · or {ADD_ON_YEARLY} / year (2 months free)</p>
            </div>
            <Button onClick={() => setRequested(true)} disabled={requested}>
              {requested ? "Request noted — we will follow up" : "Request activation"}
              {!requested && <ArrowUpRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Advanced search tools</CardTitle>
          <p className="text-sm text-muted-foreground">
            Keyword and competitor requests use search credits and the Philippines market. Website audit runs free.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              Search terms
              <Textarea
                value={keywords}
                onChange={event => setKeywords(event.target.value)}
                maxLength={809}
                placeholder="One search term per line, up to ten"
              />
            </label>
            <label className="block text-sm">
              Tracker ID (optional)
              <Input
                value={trackerId}
                onChange={event => setTrackerId(event.target.value)}
                maxLength={36}
                placeholder="Leave blank to list trackers"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {tools.map(([action, label]) => (
              <Button key={action} variant="outline" size="sm" disabled={busy} onClick={() => void load(action)}>
                {label}
              </Button>
            ))}
          </div>
          {busy && <p role="status" className="text-sm">Loading report…</p>}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {report && (
            <section aria-label="SEO report">
              <p className="mb-2 text-sm text-muted-foreground">
                {report.source} · {new Date(report.checkedAt).toLocaleString()}
              </p>
              <pre className="whitespace-pre-wrap break-words rounded-md bg-muted p-3 text-sm">{report.result}</pre>
            </section>
          )}
        </CardContent>
      </Card>

      <AdminLeadPipeline />
    </div>
  );
}
