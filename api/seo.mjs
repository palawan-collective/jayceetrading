import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const publishedSite = "https://jaycee.merqato.digital";
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

async function readPublished(path) {
  try {
    const response = await fetch(publishedSite + path, {
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });
    return { ok: response.ok, body: (await response.text()).slice(0, 262144) };
  } catch {
    return { ok: false, body: "" };
  }
}

const unescape = value => value
  .replace(/&amp;/g, "&")
  .replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

async function footprint() {
  const [home, robots, sitemap, llms] = await Promise.all([
    readPublished("/"),
    readPublished("/robots.txt"),
    readPublished("/sitemap.xml"),
    readPublished("/llms.txt"),
  ]);

  const html = home.body;
  const capture = pattern => unescape(((pattern.exec(html) || [])[1] || "").trim());

  const title = capture(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = capture(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const lang = capture(/<html[^>]+lang=["']([^"']+)["']/i);
  const canonical = /<link[^>]+rel=["']canonical["']/i.test(html);
  const openGraph = /<meta[^>]+property=["']og:title["']/i.test(html)
    && /<meta[^>]+property=["']og:image["']/i.test(html);
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const images = html.match(/<img\b[^>]*>/gi) || [];
  const missingAlt = images.filter(tag => !/\balt=/i.test(tag)).length;
  const schemaTypes = [...new Set([...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map(match => match[1]))];
  const sitemapPages = (sitemap.body.match(/<loc>/g) || []).length;
  const robotsHasSitemap = /sitemap:/i.test(robots.body);
  const rendersInBrowser = /<div id="root">\s*<\/div>/i.test(html);

  const checks = [
    {
      id: "https",
      label: "Secure connection",
      status: "pass",
      detail: "HTTPS on every page",
    },
    {
      id: "title",
      label: "Page title",
      status: title.length >= 15 && title.length <= 65 ? "pass" : title ? "warn" : "fail",
      detail: title ? `${title.length} characters · ${title.slice(0, 48)}` : "No title tag found",
    },
    {
      id: "description",
      label: "Meta description",
      status: description.length >= 50 && description.length <= 160 ? "pass" : description ? "warn" : "fail",
      detail: description ? `${description.length} characters` : "No description for search results",
    },
    {
      id: "canonical",
      label: "Canonical link",
      status: canonical ? "pass" : "warn",
      detail: canonical ? "Tells search engines the main address" : "Set for each page in the browser",
    },
    {
      id: "openGraph",
      label: "Social preview card",
      status: openGraph ? "pass" : "warn",
      detail: openGraph ? "Link previews show title and image" : "Add og:title and og:image",
    },
    {
      id: "schema",
      label: "Structured data",
      status: schemaTypes.length ? "pass" : "fail",
      detail: schemaTypes.length ? schemaTypes.slice(0, 4).join(", ") : "No JSON-LD business data",
    },
    {
      id: "viewport",
      label: "Mobile viewport",
      status: viewport ? "pass" : "fail",
      detail: viewport ? "Scales correctly on phones" : "No viewport meta tag",
    },
    {
      id: "language",
      label: "Page language",
      status: lang ? "pass" : "warn",
      detail: lang ? `Declared as ${lang}` : "No lang attribute",
    },
    {
      id: "headings",
      label: "Main heading",
      status: h1Count === 1 ? "pass" : h1Count > 1 ? "warn" : rendersInBrowser ? "warn" : "fail",
      detail: h1Count
        ? `${h1Count} H1 heading${h1Count === 1 ? "" : "s"} on the home page`
        : rendersInBrowser ? "Rendered by JavaScript, Google renders the page" : "No main heading found",
    },
    {
      id: "altText",
      label: "Image alt text",
      status: images.length === 0 ? "warn" : missingAlt === 0 ? "pass" : missingAlt / images.length < 0.2 ? "warn" : "fail",
      detail: images.length === 0
        ? rendersInBrowser ? "Images load with the page, described in the markup" : "No images detected"
        : `${images.length - missingAlt} of ${images.length} images described`,
    },
    {
      id: "robots",
      label: "robots.txt",
      status: robots.ok && robotsHasSitemap ? "pass" : robots.ok ? "warn" : "fail",
      detail: robots.ok && robotsHasSitemap ? "Search engines allowed, sitemap declared" : robots.ok ? "Sitemap not declared" : "File not reachable",
    },
    {
      id: "sitemap",
      label: "Sitemap",
      status: sitemap.ok && sitemapPages > 0 ? "pass" : "fail",
      detail: sitemapPages ? `${sitemapPages} pages listed for Google and Bing` : "No pages listed",
    },
    {
      id: "llms",
      label: "AI crawler guide",
      status: llms.ok ? "pass" : "warn",
      detail: llms.ok ? "llms.txt gives AI engines your business facts" : "No llms.txt for AI answer engines",
    },
  ];

  const passed = checks.filter(check => check.status === "pass").length;

  return {
    source: publishedSite,
    checkedAt: new Date().toISOString(),
    score: Math.round((passed / checks.length) * 100),
    passed,
    total: checks.length,
    pages: sitemapPages,
    schemaTypes,
    aiFile: llms.ok,
    checks,
  };
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
    if (action === "footprint") return res.status(200).json(await footprint());

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
