# SafeSpace Deployment

Last reviewed: 18 November 2026.

## Frontend

`.github/workflows/test.yml` uses Node.js 22 and runs `npm ci`, `npm test`, `npm run lint:a11y`, `npm run build`, and Playwright Chromium smoke checks (`npm run test:e2e`). Pull requests run quality checks without deployment. Successful pushes to `main` deploy the tested artifact to GitHub Pages.

The workflow passes the commit SHA as `VITE_APP_VERSION` and writes `version.json` for the app's update check. `public/about.html` is part of the static build.

## Supabase

Connected project: SafeSpace (`nvvttqbqhmwpxzfrjixe`, `ap-northeast-1`). Migrations and Edge Functions deploy separately from Pages. A frontend deployment does not apply SQL or deploy functions.

The live applied history includes the November private birthdate, profile/username, policy acceptance, score-sharing, admin age-segment, Community permissions, and anonymous Community changes. Latest applied database version reported in this review: `20261115172949` (`allow_anonymous_community_before_profile`). Check the live history before applying SQL; Git and production can drift.

See [Edge Functions](EDGE_FUNCTIONS.md) for current deployed names/versions.

## Release checks

Frontend: review Actions, Thai/English and light/dark, mobile layouts, auth return paths, profile completion and age validation, guest and signed-in assessments, history/deletion, score sharing, Community, resources, admin permissions, and About page.

Supabase: inspect project/tables/RLS/grants/migration history/function versions; review privacy effects; keep birthdate out of public/admin data and secrets server-side; verify deployed changes with read-only inspection.

A frontend rollback does not roll back Supabase state. A successful Vite build does not prove live database, RLS, Edge Function, secret, or Realtime configuration.
