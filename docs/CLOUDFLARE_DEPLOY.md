# Cloudflare Workers Deploy Notes (OpenNext)

This project deploys to **Cloudflare Workers** with **OpenNext**.

## Required commands
- Build: `pnpm run build`
- Deploy: `pnpm run deploy`

## Why this setup
- The app uses App Router, API routes, and middleware/proxy.
- It is not a static export.
- It does not use `.vercel/output`.
- Cloudflare Pages config (`pages_build_output_dir`) is intentionally removed.

## Wrangler target
`wrangler.toml` points to OpenNext output:

```toml
main = ".open-next/worker.js"

[assets]
binding = "ASSETS"
directory = ".open-next/assets"
```

## Environment variables
Public values can be set in `[vars]`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Server-only values **must** be set as Workers secrets:
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

Commands:

```bash
pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY
pnpm exec wrangler secret put SUPABASE_JWT_SECRET
```
