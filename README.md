# SafeSpace

SafeSpace is a Vite + React project focused on youth wellbeing. I built it around screening, simple self-care tools, community support, and a collection of trusted resources.

> **Important:** SafeSpace is a school-project screening/support tool. Its results are not medical diagnoses.

## What SafeSpace uses

- React 18 + Vite
- Supabase Auth
- Supabase Postgres + Row Level Security (RLS)
- Supabase Edge Functions
- GitHub Pages for the frontend
- OpenAI for AI analysis when configured
- Gemini fallback for the main assessment function when configured
- Local/offline fallback logic

## Live website

- https://phoomth1407.github.io/SafeSpace-ph
- https://phoomth1407.github.io/SafeSpace-ph/about.html

## What the project includes

- Wellbeing assessment with age and nationality context
- Guest assessment flow with browser-only result state
- Authenticated assessment history
- AI-assisted assessment analysis
- Personalized next-step wellbeing tools
- Daily Mood Check-in, Breathing, Grounding, Worry Release
- Procedural Ambient Sound Mixer
- Anonymous Community with realtime updates
- Mental-health resources and hotlines
- Thai/English UI and Light/Dark themes
- Email/password, Google OAuth, and Google One Tap authentication
- Admin moderation/resource management

## How the assessment works behind the scenes

```text
Assessment.jsx
   -> appClient.functions.invoke("analyze-assessment")
   -> JWT authentication + request validation
   -> rate limit: 5 requests / 60 seconds / user
   -> OpenAI -> Gemini fallback -> local fallback
   -> public.assessments
   -> Assessment Result
```

Guest assessment results are kept in browser navigation state and are not saved to the user's account. The assessment UI requires acknowledgement of its privacy notice before starting.

## AI functions currently used in production

- `analyze-assessment` — active version 13
- `analyze-community-post` — active version 5
- `analyze-phq9` — active version 5

All three are JWT-protected. Community AI and PHQ-9 also enforce request-size limits and a 5-request/60-second per-user rate limit.

See [Edge Functions](docs/EDGE_FUNCTIONS.md).

## Backend

Supabase provides authentication, user profiles, assessments, community posts/comments, emergency resources, reports, contact requests, Realtime updates, and Edge Functions.

The browser uses only the Supabase URL and publishable key. Provider secrets stay in Supabase Edge Function secret storage.

## License

SafeSpace is shared under the **SafeSpace Non-Commercial Attribution License**.

You may use, study, modify, and share the code for non-commercial purposes, provided that the original copyright notice and attribution to **SafeSpace by phoomth1407** are retained.

Commercial use requires separate written permission from the copyright holder.

See [LICENSE](LICENSE) for the complete terms.

## Security

The project uses RLS, owner/admin authorization, JWT-protected AI functions, request validation, request-size limits, per-user rate limiting, assessment database constraints, client-side signup password screening, and a browser Content Security Policy. These controls are meant to reduce common mistakes and abuse; they are not a promise that the site is impossible to attack.

See [SECURITY.md](SECURITY.md) and [RLS audit](docs/RLS_AUDIT.md).

## Running the project locally

Recommended Node.js version: 22.

```bash
npm ci
npm run dev
```

Quality checks:

```bash
npm test
npm run lint:a11y
npm run build
npm run test:e2e
```

Copy `.env.example` to `.env.local` and provide the frontend-safe Supabase values. Never put provider secrets in frontend environment variables.

See [Environment](docs/ENVIRONMENT.md) and [Deployment](docs/DEPLOYMENT.md).

## Project structure

```text
src/
  api/          Supabase-backed compatibility/data adapter
  components/   Reusable UI
  hooks/        React hooks
  lib/          Supabase client, auth, i18n, scoring
  pages/        Application routes
  utils/        Utilities
supabase/
  migrations/   Database migrations tracked in Git
docs/           Architecture, deployment, environment, Edge Functions, RLS
legacy/         Archived Base44-era files; not the active backend
```

## Testing and deployment

GitHub Actions installs with `npm ci`, runs tests, accessibility linting, the production build, and the Playwright smoke test. Successful pushes to `main` deploy the tested build to GitHub Pages.

Supabase Edge Functions and database migrations are deployed separately.

## Production and source-control note

The live Supabase project currently has these recent migrations applied:

- `security_hardening_20260919`
- `add_edge_rate_limit_20260919`
- `fix_edge_rate_limit_security_20260919`

Only the first is currently mirrored under `supabase/migrations/` on `main`. The two rate-limit migration files are live but not yet mirrored in the repository. The three current AI function source files are also deployed in Supabase but are not yet present under `supabase/functions/` on `main`.

This is documented explicitly so the repository does not falsely claim to be a complete backup of the live backend.

## Legacy folder

`legacy/` contains archived Base44-era files for historical/reference purposes. The active backend is Supabase.

## Crisis support

SafeSpace is not an emergency service. In Thailand, users can contact the Department of Mental Health hotline 1323. For an immediate emergency, use the appropriate local emergency service.

## Assessment Policy

The complete SafeSpace Assessment Policy is published in [docs/ASSESSMENT_POLICY.md](docs/ASSESSMENT_POLICY.md). The website requires users to review the policy before starting an assessment.

## Documentation

- [Security model](SECURITY.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Environment](docs/ENVIRONMENT.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Edge Functions](docs/EDGE_FUNCTIONS.md)
- [RLS audit](docs/RLS_AUDIT.md)
- [Changelog](CHANGELOG.md)
