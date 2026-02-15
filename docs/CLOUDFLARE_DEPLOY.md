# Cloudflare Pages deploy notes (Next.js App Router)

## Root cause of the 404
The project was deployed as if `.next` were a static website folder by setting:

```toml
pages_build_output_dir = ".next"
```

in `wrangler.toml`.

That is incorrect for this app. `.next` is an internal Next.js build directory (server bundles, manifests, runtime files), **not** a publishable static site root. It does not expose a top-level `index.html` for Cloudflare Pages static hosting, so the deployed URL resolves to Cloudflare's 404 page.

## Framework/runtime facts for this repo
- Framework: **Next.js 16** with the **App Router** (`app/` directory).
- Rendering model: mixed static + dynamic server routes (`ƒ` routes, API route handlers under `app/api/*`).
- Because API routes and dynamic server rendering are present, this is **not** a pure static-export app.

## Correct Cloudflare Pages build setup
Use the Cloudflare Next.js adapter output (`.vercel/output`) instead of `.next`.

### `package.json` scripts
```json
{
  "scripts": {
    "build": "next build",
    "build:pages": "npx @cloudflare/next-on-pages@1",
    "deploy:pages": "npm run build && npm run build:pages"
  }
}
```

### `wrangler.toml`
```toml
name = "study-lms"
compatibility_date = "2026-02-15"
pages_build_output_dir = ".vercel/output/static"
```

### Cloudflare Pages project settings
- Build command: `npm run deploy:pages`
- Build output directory: leave empty (Wrangler config), or `.vercel/output/static`
- Framework preset: **Next.js**

## Verification checklist
After running `npm run deploy:pages` in CI/local:

1. `.vercel/output/static` exists.
2. `.vercel/output/static/index.html` exists.
3. `.vercel/output/functions` exists (for dynamic/API routes).
4. Cloudflare deploy logs reference `.vercel/output/static` (not `.next`).

## Required environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
