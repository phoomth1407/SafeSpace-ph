# SafeSpace Deployment

Last reviewed: 2026-09-20

## Frontend deployment

The frontend is deployed to GitHub Pages from `main` through `.github/workflows/test.yml`.

The workflow runs:

1. `npm ci`
2. `npm test`
3. `npm run lint:a11y`
4. `npm run build`
5. Playwright Chromium installation
6. `npm run test:e2e`
7. Pages artifact upload
8. GitHub Pages deployment after the quality job succeeds

## Supabase deployment

Supabase is managed separately from GitHub Pages.

Current production AI functions:

- `analyze-assessment` — version 13, JWT required
- `analyze-community-post` — version 5, JWT required
- `analyze-phq9` — version 5, JWT required

Recent production migrations:

- `security_hardening_20260919`
- `add_edge_rate_limit_20260919`
- `fix_edge_rate_limit_security_20260919`

The repository currently contains the first migration but not the two rate-limit migration files. This is a source-control drift item and should be resolved before treating Git as a complete infrastructure backup.

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
- [ ] Check Community realtime updates
- [ ] Check Resources and History

### Supabase

- [ ] Confirm RLS for new/changed tables
- [ ] Confirm ownership/admin policies
- [ ] Confirm AI functions still require JWT
- [ ] Confirm request-size and rate-limit controls
- [ ] Confirm provider secrets exist only in Supabase
- [ ] Run Supabase security advisors after schema changes

## If a deployment needs to be rolled back

### Frontend

Redeploy a previous known-good `main` commit through GitHub Pages.

### Edge Functions

Deploy the previously known-good function source/version. Do not disable JWT verification merely to recover a frontend issue.

### Database

Database changes should be delivered through versioned migrations. Because the live project currently has two rate-limit migrations not mirrored in `main`, take extra care before rebuilding/resetting a database from repository migrations.

## One important limitation

A successful frontend build does not prove that the live Supabase schema/functions are synchronized with Git. Check both deployment surfaces.


## Current backend note

The current repository tracks the September 2026 rate-limit and Community posting hardening migrations. AI function source is also tracked for the current assessment, community-post, and PHQ-9 endpoints. Supabase remains a separately deployed backend, so a green frontend build does not by itself prove that the live database or Edge Functions are synchronized.
