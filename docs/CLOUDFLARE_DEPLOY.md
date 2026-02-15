# Cloudflare Pages deploy notes (Next.js App Router)

## Root cause (from latest logs)
The deployment loop was:

1. Cloudflare runs `npm run build`
2. `build` runs `@cloudflare/next-on-pages`
3. `next-on-pages` runs `vercel build`
4. `vercel build` runs project `build` again
5. recursion error: `vercel build must not recursively invoke itself`

## Clean fix applied
Instead of environment-flag workarounds, the project now configures Vercel's internal build command explicitly via `vercel.json`.

### What changed
- `package.json` keeps Cloudflare build as adapter command:
  - `build`: `pnpm dlx @cloudflare/next-on-pages@1`
  - `build:next`: `next build`
- Added `vercel.json`:
  - `buildCommand`: `pnpm run build:next`

So when `next-on-pages` invokes `vercel build`, Vercel executes `build:next` (plain Next build), not `build` again.
That removes recursion deterministically.

## Effective configuration

### `package.json`
```json
{
  "scripts": {
    "build": "pnpm dlx @cloudflare/next-on-pages@1",
    "build:next": "next build",
    "build:pages": "pnpm dlx @cloudflare/next-on-pages@1"
  }
}
```

### `vercel.json`
```json
{
  "buildCommand": "pnpm run build:next"
}
```

### `wrangler.toml`
```toml
name = "study-lms"
compatibility_date = "2026-02-15"
pages_build_output_dir = ".vercel/output/static"
```

## Cloudflare Pages settings
- Build command: `npm run build`
- Build output directory: leave empty (Wrangler reads it) or `.vercel/output/static`
- Framework preset: Next.js

## Verification checklist
1. Log no longer contains recursive-invocation error.
2. Log shows `vercel build` calling `pnpm run build:next`.
3. `.vercel/output/static` is found.
4. Deploy succeeds and root URL returns app, not 404.
