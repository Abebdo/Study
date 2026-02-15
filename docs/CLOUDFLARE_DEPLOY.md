# Cloudflare Pages deploy notes (Next.js App Router)

## What actually failed (from your log)
Cloudflare read `wrangler.toml` and expected this output directory:

```toml
pages_build_output_dir = ".vercel/output/static"
```

Then it executed the project build command as:

```bash
npm run build
```

But at that moment `build` was `next build`, which only creates `.next` and **does not** create `.vercel/output/static`.
So validation failed with:

- `Error: Output directory ".vercel/output/static" not found.`

## Root cause
A mismatch between:
- expected output directory (`.vercel/output/static`), and
- actual command executed by Cloudflare (`npm run build` -> `next build`).

This is why the build failed even though Next.js compilation itself succeeded.

## Framework/runtime facts for this repo
- Framework: **Next.js 16**
- Router: **App Router** (`app/`)
- Rendering: mixed static + dynamic (`ƒ` routes + `app/api/*` route handlers)
- `next.config.mjs` does **not** use `output: "export"`, so this is not static-export mode.

## Production-ready fix applied
Make `npm run build` produce the Cloudflare Pages adapter output directly.

### `package.json` (fixed)
```json
{
  "scripts": {
    "build": "npx @cloudflare/next-on-pages@1",
    "build:next": "next build",
    "build:pages": "npx @cloudflare/next-on-pages@1",
    "deploy:pages": "npm run build"
  }
}
```

### `wrangler.toml` (kept correct)
```toml
name = "study-lms"
compatibility_date = "2026-02-15"
pages_build_output_dir = ".vercel/output/static"
```

## Cloudflare Pages settings to use
- Build command: `npm run build`
- Build output directory: leave empty (Wrangler is used) OR `.vercel/output/static`
- Framework preset: **Next.js**

## Verification checklist
After build in CI or locally:

1. `.vercel/output/static` exists.
2. `.vercel/output/static/index.html` exists.
3. `.vercel/output/functions` exists.
4. Cloudflare log no longer shows `Output directory ... not found`.

## Required environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
