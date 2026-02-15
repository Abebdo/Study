# Auth audit and remediation plan

This project now uses Supabase Auth end-to-end for:
- Email/password login.
- Google OAuth login.
- Password reset.
- Server-side role checks for teacher/admin routes.

## Supabase dashboard settings to verify

> These are dashboard-side settings and must match production URLs.

1. **Auth → URL Configuration**
   - Site URL: `https://<your-vercel-domain>`
   - Additional Redirect URLs should include:
     - `https://<your-vercel-domain>/auth/callback`
     - `http://localhost:3000/auth/callback`

2. **Auth → Providers → Google**
   - Google enabled.
   - Client ID + Client Secret configured in Supabase.
   - Authorized redirect URI in Google Cloud must include:
     - `https://<project-ref>.supabase.co/auth/v1/callback`

3. **Auth → Providers → Email**
   - Email provider enabled.
   - Confirm email enabled for production (recommended).

4. **Auth → Email Templates**
   - Confirm signup + reset password templates active.
   - Links should use `{{ .ConfirmationURL }}` and redirect through `/auth/callback`.

## Database hardening applied in SQL migration

Run `scripts/011_auth_hardening.sql` in Supabase SQL editor:
- Auto-create `profiles` record on `auth.users` insert.
- Restrict `profiles` reads to self/admin.
- Restrict enrollment reads to self, admin, or course instructor.
- Keep insert/update checks tied to authenticated user/admin role.

## Manual verification checklist

1. **Google login test**
   - Click "Continue with Google" on `/sign-in`.
   - Complete OAuth consent.
   - Verify redirect to `/dashboard`.
   - Confirm profile row exists in `profiles` for new user.

2. **Email/password login test**
   - Sign up with email/password from `/sign-up`.
   - Confirm verification email and click link.
   - Login on `/sign-in`.
   - Verify no silent failures; errors appear in UI.

3. **Admin/teacher access test**
   - Set role in `profiles.role` to `instructor` or `admin` for test user.
   - Access `/dashboard/teacher`.
   - Verify student users are redirected away.

4. **Student access test**
   - Student can sign up and login.
   - Student can access `/dashboard`.
   - Student cannot access teacher-only pages.

5. **Password reset test**
   - Open `/forgot-password` and submit account email.
   - Open email reset link.
   - Verify callback sends user to `/reset-password`.
   - Set new password and login again.
