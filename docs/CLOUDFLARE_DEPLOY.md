# Cloudflare Pages deploy notes (Next.js App Router)

## Root cause from the latest failing log
The deployment failed due to **recursive build invocation**:

1. Cloudflare runs `npm run build`.
2. `build` ran `@cloudflare/next-on-pages`.
3. `next-on-pages` runs `vercel build` internally.
4. `vercel build` ran `pnpm run build` again.
5. Because `build` still called `next-on-pages`, it recursively invoked itself and failed with:
   - `Error: vercel build must not recursively invoke itself`

## Why this happened
`build` was bound directly to `next-on-pages`, while `next-on-pages` itself depends on `vercel build`, which calls the project build script.

## Fix applied
A guard script now controls build behavior:

- Normal Cloudflare run (`npm run build`): run `pnpm dlx @cloudflare/next-on-pages@1`
- Nested Vercel run (when `VERCEL=1`): run `next build` only

This breaks the recursion and still produces the Pages adapter output.

### `package.json` (fixed)
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

### `scripts/cloudflare-build.mjs` (new)
- If `VERCEL=1` => executes `next build`
- Otherwise => executes `pnpm dlx @cloudflare/next-on-pages@1`

### `wrangler.toml` (unchanged and correct)
```toml
name = "study-lms"
compatibility_date = "2026-02-15"
pages_build_output_dir = ".vercel/output/static"
```

## Cloudflare Pages settings
- Build command: `npm run build`
- Build output directory: keep empty (Wrangler-managed) or `.vercel/output/static`
- Framework preset: Next.js

## Verification checklist
After deploy:
1. Build log no longer contains recursive invocation error.
2. Build log reaches adapter completion successfully.
3. `.vercel/output/static` is found by Cloudflare validation.
4. Site and API routes load without Pages 404.
