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
