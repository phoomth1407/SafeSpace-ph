# SafeSpace Deployment

Last reviewed: 2026-09-20

## Frontend deployment

The frontend is deployed to GitHub Pages from `main` through `.github/workflows/test.yml`.

The workflow currently runs the quality checks before deployment:

1. `npm ci`
2. `npm test`
3. `npm run lint:a11y`
4. `npm run build`
5. Install Playwright Chromium
6. `npm run test:e2e`
7. Upload the Pages artifact
8. Deploy to GitHub Pages only after the quality job succeeds

The standalone `public/about.html` page is deployed with the same Pages build.

## Supabase deployment

Supabase is a separate backend from the GitHub Pages frontend. The repository tracks the current Edge Function source and database migrations, but changes made directly in the Supabase dashboard can still create drift.

### Current Edge Functions

- `analyze-assessment` — v14, JWT required
- `analyze-community-post` — v7, JWT required
- `analyze-phq9` — v5, JWT required
- `communityInteract` — v3, compatibility function still used by the Community UI
- `analyzeCommunityPost` — v3, legacy endpoint being retired

### Current migrations tracked in Git

- `20260919000000_security_hardening.sql`
- `20260919000003_lock_rate_limit_rpc_grants.sql`
- `20260919000004_community_post_rolling_limit.sql`
- `20260919000005_community_post_limit_index.sql`
- `20260920000000_enforce_community_post_limit_rpc.sql`
- `20260920000001_harden_security_definer_search_paths.sql`

The recent migrations cover the security hardening, AI rate-limit RPC grants, rolling Community post limits, controlled Community creation, and SECURITY DEFINER/search-path hardening.

## Before deploying

### Frontend

- [ ] `npm ci`
- [ ] `npm test`
- [ ] `npm run lint:a11y`
- [ ] `npm run build`
- [ ] `npm run test:e2e`
- [ ] Check Thai/English
- [ ] Check Light/Dark
- [ ] Check email/password and Google authentication
- [ ] Check guest and authenticated assessment flows
- [ ] Check assessment history deletion
- [ ] Check Community realtime updates, posting, comments, and reports
- [ ] Check Resources and admin flows

### Supabase

- [ ] Confirm RLS for new/changed tables
- [ ] Confirm ownership/admin policies
- [ ] Confirm AI functions still require JWT
- [ ] Confirm request-size and rate-limit controls
- [ ] Confirm Community creation still goes through the controlled database path
- [ ] Confirm provider secrets exist only in Supabase
- [ ] Run Supabase security advisors after schema changes

## Rollback

### Frontend

Redeploy a previous known-good `main` commit through GitHub Pages.

### Supabase

Roll back the affected Edge Function or database migration using the Supabase deployment process. Do not assume a frontend rollback also rolls back database state.

## One important distinction

A successful Vite build only proves that the frontend can be built. It does not prove that the live Supabase schema, RLS policies, Edge Functions, secrets, or Realtime configuration are correct. Those parts need their own verification.

## Notes

The deployment setup follows the normal Supabase model where authenticated client calls send a user JWT to protected Edge Functions; Supabase documents `verify_jwt` as the platform-level check for functions that require authenticated callers. citeturn1search1turn1search3
