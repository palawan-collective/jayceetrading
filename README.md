# JayCee Trading & Services

Online ordering web app for JayCee Trading & Services (Puerto Princesa, Palawan).

## Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (database, storage, realtime)
- Deployed on Vercel

## Local development

```sh
npm install
npm run dev
```

Environment variables are read from `.env` (or from the Vercel project settings in
production):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
```

## Database

Schema, RLS policies, functions and storage buckets live in
`supabase/migrations/`. Apply them with the Supabase SQL editor or the Supabase CLI.

## Routes

| Path | Description |
| --- | --- |
| `/` | Marketing home page |
| `/order` | Product catalogue and cart |
| `/checkout` | Order form and payment selection |
| `/track` | Order tracking |
| `/invoice/:orderId` | Printable invoice |
| `/admin` | Staff portal (passkey protected) |

## SEO & Leads

Jaycee staff use Supabase email and password sign-in at `/admin`. Before
rollout, set the server-managed Auth app metadata `jaycee_admin` to the
boolean `true` on the approved staff accounts and apply the two November 20
migrations to the verified Jaycee Supabase project. Stage the migration and app
release together and confirm both public contact forms and staff access.

The Vercel function at `/api/seo` validates the staff session with Supabase and
uses one configured OpenSEO project. Set these server environment variables
on the existing production project:

| Variable | Value |
| --- | --- |
| `OPENSEO_URL` | HTTPS origin of the OpenSEO instance |
| `OPENSEO_API_KEY` | OpenSEO Settings API key for the organization containing Jaycee |
| `OPENSEO_PROJECT_ID` | Jaycee project ID in that OpenSEO organization |

The function also uses the existing `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY`. Configure DataForSEO in OpenSEO for keyword
and competitor reports. Keyword data and competitor results use the
Philippines market. Rank tracker results use the location configured in each
OpenSEO tracker. The website audit checks the existing public robots and
sitemap URLs and works independently of OpenSEO.
