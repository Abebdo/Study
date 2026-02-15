# Supabase Integration Required (Before continuing Phases 1-6)

This repository currently contains Phase 0 schema/RLS SQL, but full LMS execution (Phases 1-6) cannot be completed without connecting to a real Supabase project.

## What is already in repo
- Phase 0 schema + strict RLS script: `scripts/004_phase0_supabase_schema_rls.sql`
- Supabase SSR client/middleware wrappers:
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`
  - `lib/supabase/middleware.ts`

## What is missing to continue real implementation
Provide these values from your Supabase project:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY` (server-only)
4. `SUPABASE_JWT_SECRET` (server-only, used to validate JWT signatures)
5. `SUPABASE_DB_URL` (optional but recommended for automated SQL validation via psql)
6. Storage bucket names intended for videos/assets
7. Payment provider secrets (if Phase 5 should be implemented end-to-end)

## Minimum setup steps
1. Create `.env.local` in project root.
2. Add the variables above.
3. Run local key validation:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_JWT_SECRET=... node scripts/006_verify_supabase_config.mjs
   ```
4. Execute `scripts/004_phase0_supabase_schema_rls.sql` in Supabase SQL Editor.
5. Execute `scripts/005_phase0_security_verification.sql` and confirm all tests pass.

## Important
Without real Supabase credentials/project access, any claim of “all phases complete” would be inaccurate because:
- No server-side data can be persisted or verified.
- RLS policies cannot be runtime-tested against real auth users.
- Payments/enrollments cannot be enforced end-to-end.
