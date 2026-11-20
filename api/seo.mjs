import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const publishedSite = "https://jaycee-updatednov9.vercel.app";
const philippineMarket = { locationCode: 2608, languageCode: "en" };
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

async function auditCrawlFiles() {
  const checks = await Promise.all([
    ["/robots.txt", /^user-agent:/im],
    ["/sitemap.xml", /<(urlset|sitemapindex)(\s|>)/i],
  ].map(async ([path, expected]) => {
    const url = publishedSite + path;
    try {
      const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(5000) });
      const body = (await response.text()).slice(0, 65536);
      return `${url} — HTTP ${response.status}. ${response.ok && expected.test(body) ? "Expected file found." : "Expected file missing."}`;
    } catch {
      return `${url} — Could not retrieve the file.`;
    }
  }));
  return checks.join("\n");
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  const accessToken = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || "")?.[1];
  if (!accessToken) return res.status(401).json({ error: "Sign in to use SEO tools." });

  const { VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, OPENSEO_URL, OPENSEO_API_KEY, OPENSEO_PROJECT_ID } = process.env;
  if (!VITE_SUPABASE_URL || !VITE_SUPABASE_PUBLISHABLE_KEY) {
    return res.status(503).json({ error: "Configure the Jaycee Supabase URL and publishable key." });
  }

  try {
    const client = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await client.auth.getUser(accessToken);
    if (error || !data.user) return res.status(401).json({ error: "Sign in again to use SEO tools." });
    if (data.user.app_metadata.jaycee_admin !== true) {
      return res.status(403).json({ error: "Jaycee admin access is required." });
    }

    const { action, keywords, trackerId } = req.body ?? {};
    const success = (source, result) => res.status(200).json({ source, checkedAt: new Date().toISOString(), result });
    if (action === "audit") return success(publishedSite, await auditCrawlFiles());

    const args = { projectId: OPENSEO_PROJECT_ID };
    let name;
    switch (action) {
      case "overview":
        name = "get_project_context";
        break;
      case "rankings":
        name = "get_rank_tracker";
        if (trackerId) {
          if (typeof trackerId !== "string" || !uuid.test(trackerId)) return res.status(400).json({ error: "Enter a valid tracker ID." });
          Object.assign(args, { trackerId, limit: 25 });
        }
        break;
      case "keywords":
      case "competitors":
        if (!Array.isArray(keywords) || !keywords.length || keywords.length > 10 ||
          keywords.some(keyword => typeof keyword !== "string" || !keyword.trim() || keyword.length > 80)) {
          return res.status(400).json({ error: "Enter one to ten search terms, up to 80 characters each." });
        }
        Object.assign(args, philippineMarket, { keywords: [...new Set(keywords.map(keyword => keyword.trim()))] });
        if (action === "keywords") {
          name = "get_keyword_metrics";
          args.includeMonthlyTrends = false;
        } else {
          name = "find_serp_competitors";
          args.limit = 10;
        }
        break;
      default:
        return res.status(400).json({ error: "Choose an SEO tool." });
    }

    if (!OPENSEO_URL || !OPENSEO_API_KEY || !OPENSEO_PROJECT_ID) {
      return res.status(503).json({ error: "Configure the OpenSEO URL, API key, and Jaycee project ID on the server." });
    }
    const endpoint = new URL("/mcp", OPENSEO_URL);
    if (endpoint.protocol !== "https:") return res.status(503).json({ error: "The OpenSEO URL must use HTTPS." });
    const response = await fetch(endpoint, {
      method: "POST",
      redirect: "error",
      headers: {
        Authorization: `Bearer ${OPENSEO_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "MCP-Protocol-Version": "2025-06-18",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: randomUUID(), method: "tools/call", params: { name, arguments: args } }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return res.status(502).json({ error: `OpenSEO returned HTTP ${response.status}. Check the service and API key.` });
    const payload = await response.json();
    if (payload.error || payload.result?.isError) {
      return res.status(502).json({ error: "OpenSEO could not complete the request. Check project access and the DataForSEO connection." });
    }
    const result = payload.result?.content?.filter(item => item.type === "text").map(item => item.text).join("\n");
    if (!result) return res.status(502).json({ error: "OpenSEO did not return a report." });
    return success("OpenSEO", result);
  } catch {
    return res.status(502).json({ error: "The SEO service could not complete the request." });
  }
}
