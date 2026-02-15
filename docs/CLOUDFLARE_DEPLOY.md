# Cloudflare Workers Deploy (OpenNext)

## Why Pages failed
This project uses dynamic Next.js App Router features (API routes, middleware, server-side auth). Cloudflare Pages static output validation expects a static directory and fails with errors like:

- `Output directory .vercel/output/static not found`

That happens because Pages is the wrong runtime target for this app.

## What this repo now uses
Deployment target is now **Cloudflare Workers + OpenNext**.

- Build tool: `@opennextjs/cloudflare`
- Worker entry output: `.open-next/worker.js`
- Static assets output: `.open-next/assets`

## Required commands
Use these commands in CI / Cloudflare build settings:

- **Build command**: `pnpm build`
- **Deploy command**: `pnpm deploy`

`pnpm build` runs OpenNext and generates the Worker bundle + assets.

## Wrangler configuration
`wrangler.toml` is now configured for Workers runtime output (not Pages):

- `main = ".open-next/worker.js"`
- `assets.directory = ".open-next/assets"`
- `compatibility_flags = ["nodejs_compat"]`

## Supabase environment variables
Set these as Cloudflare Worker environment variables/secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

This keeps middleware and API routes working with Supabase auth on Workers.

## No billing-risk features enabled
This setup does **not** require adding paid Cloudflare primitives (KV, R2, D1, Durable Objects) to run.
It uses default OpenNext Worker output only.
