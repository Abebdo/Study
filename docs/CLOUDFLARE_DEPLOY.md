# Cloudflare Deploy Notes

## Root cause from your log
Cloudflare Pages failed at the final validation step because it was configured to expect an output directory named `dist`:

- `Error: Output directory "dist" not found.`

This repo builds with Next.js and outputs to `.next`.

## Fix applied in repo
A `wrangler.toml` file was added with:

```toml
pages_build_output_dir = ".next"
```

This aligns Cloudflare output validation with the actual Next build output.

## Required Cloudflare project settings
In Cloudflare Pages project settings:

- **Build command**: `npm run build`
- **Build output directory**: leave empty (Wrangler config will be used) OR set to `.next`

## Environment variables (required for real backend behavior)
Set these in Cloudflare Pages/Workers variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

Without these, middleware now safely no-ops (no crash), but backend endpoints that need Supabase will not function fully.
