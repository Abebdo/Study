# Cloudflare Workers Deploy Notes (OpenNext)

This project deploys to **Cloudflare Workers** with **OpenNext**.

## Required commands
- Build: `pnpm install && pnpm exec opennextjs-cloudflare build`
- Deploy: `pnpm exec opennextjs-cloudflare deploy`
- Version command: **leave empty / remove entirely**

These are the only supported commands for production Workers deployment.

## Why this setup
- The app uses App Router, API routes, and middleware/proxy.
- It is not a static export.
- Cloudflare Pages config (`pages_build_output_dir`) is intentionally removed.

## Wrangler target
`wrangler.toml` must point to OpenNext output:

```toml
main = ".open-next/worker.js"

[assets]
binding = "ASSETS"
directory = ".open-next/assets"
```

## Environment variables
Set these for Workers runtime:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `SUPABASE_JWT_SECRET` (server-only)
