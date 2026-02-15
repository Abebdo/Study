# Cloudflare Pages deploy notes (Next.js App Router)

## Root cause from the failing logs
The build failed because of recursive invocation:

1. Cloudflare executes `npm run build`.
2. `build` runs `@cloudflare/next-on-pages`.
3. `next-on-pages` invokes `vercel build` internally.
4. `vercel build` executes project `build` again.
5. If `build` runs `next-on-pages` again, it loops and fails with:
   - `Error: vercel build must not recursively invoke itself`

## Why earlier guard was not enough
Relying only on `VERCEL=1` is not always robust across nested process chains. In failing environments this variable may not be present as expected when script re-enters.

## Fix applied (robust recursion guard)
A dedicated marker env var is now injected by our build wrapper when launching `next-on-pages`:

- marker: `CF_PAGES_NEXT_ON_PAGES_INTERNAL=1`
- if marker is present (or `VERCEL=1`) => run `next build`
- otherwise => run `pnpm dlx @cloudflare/next-on-pages@1`

This guarantees the second entry into `npm run build` executes `next build` instead of re-invoking adapter CLI.

### `package.json` scripts
```json
{
  "scripts": {
    "build": "node scripts/cloudflare-build.mjs",
    "build:next": "next build",
    "build:pages": "pnpm dlx @cloudflare/next-on-pages@1",
    "deploy:pages": "pnpm run build"
  }
}
```

### `scripts/cloudflare-build.mjs`
- non-nested: starts adapter with `CF_PAGES_NEXT_ON_PAGES_INTERNAL=1`
- nested: runs `next build`

### `wrangler.toml`
```toml
name = "study-lms"
compatibility_date = "2026-02-15"
pages_build_output_dir = ".vercel/output/static"
```

## Cloudflare Pages settings
- Build command: `npm run build`
- Build output directory: empty (Wrangler-managed) or `.vercel/output/static`
- Framework preset: Next.js

## Verification checklist
1. Build log no longer contains `vercel build must not recursively invoke itself`.
2. Build reaches adapter completion.
3. `.vercel/output/static` exists and passes Pages validation.
4. Production URL no longer returns Cloudflare 404 for app routes.
