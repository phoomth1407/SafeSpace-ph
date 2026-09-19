# SafeSpace Development Notes

## Current stack

- Frontend: React 18 + Vite
- Backend: Supabase
- Database: Supabase Postgres
- Authentication: Supabase Auth
- Server-side logic: Supabase Edge Functions
- Frontend deployment: GitHub Pages
- AI: OpenAI primary, Gemini fallback for the main assessment function, local/offline fallbacks

## Development

Use Node.js 22 and install from the lockfile:

```bash
npm ci
npm run dev
```

Quality commands:

```bash
npm test
npm run lint:a11y
npm run build
npm run test:e2e
```

The active backend lives in Supabase. Do not add new Base44 runtime dependencies or revive Base44-specific backend behavior.

## Repository structure

- `src/api/appClient.js`: current Supabase-backed compatibility/data adapter used by page code
- `src/lib/supabaseClient.js`: Supabase client
- `src/pages/`: application pages
- `supabase/migrations/`: database migrations tracked in Git
- `docs/`: architecture, deployment, environment, Edge Function, and RLS documentation
- `legacy/`: archived Base44-era files; not part of production

There is no active `src/api/base44Client.js` dependency in the current repository; do not document or add one as part of new work.

## Important rules

- Keep authentication on Supabase Auth.
- Keep AI Edge Functions JWT-protected.
- Keep provider API keys in Supabase secrets, never frontend code.
- Preserve Thai/English support.
- Preserve Light/Dark theme support.
- Preserve existing user-facing behavior unless the requested change is explicitly behavioral.
- Assessment AI is a screening/support feature, not a diagnostic system.
- Treat assessment answers, age, nationality, and generated results as sensitive.
- For sensitive database tables, use RLS as the final authorization boundary.
- Expensive AI endpoints should retain request-size validation and per-user rate limiting.
- When adding a database table, document its RLS policy and add the migration to source control.
- When deploying an Edge Function, update `docs/EDGE_FUNCTIONS.md` and keep the source in `supabase/functions/` when possible.
