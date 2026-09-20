# Contributing to SafeSpace

Thanks for taking a look at SafeSpace.

This is a school project, but I still want the code to be useful to other students and developers. If you want to fix something, try an idea, or make your own version, this is the basic setup I use.

## Before you start

SafeSpace is a React/Vite frontend with Supabase as the backend.

You will normally need Node.js 22 and, if you want to test the real backend, a Supabase project. Start from `.env.example` for the frontend values.

Please read [LICENSE](LICENSE) before redistributing or using the code in another project. The project uses a custom non-commercial license.

## Run it locally

~~~bash
npm ci
cp .env.example .env.local
npm run dev
~~~

The frontend only needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Do not put OpenAI, Gemini, service-role, database-password, or other private keys in Vite environment variables.

## Where to look

- `src/pages/` — main pages and route-level UI
- `src/components/` — reusable UI
- `src/lib/` — auth, scoring, i18n, Supabase client, and shared logic
- `src/api/appClient.js` — the main Supabase-backed data adapter
- `supabase/functions/` — server-side Edge Functions
- `supabase/migrations/` — tracked database changes
- `tests/` — unit/component tests and Playwright tests
- `docs/` — project, backend, and security notes

`legacy/` contains old Base44-era code. It is not the active backend.

## Making a change

I try to keep changes small enough that it is easy to understand what broke if a test fails.

1. Change the relevant page, component, function, or migration.
2. Run the tests.
3. Check the production build.
4. Run accessibility lint when the UI changes.
5. If the change affects data, AI, auth, or RLS, update the related documentation.
6. Test the actual user flow, not only whether the code compiles.

~~~bash
npm test
npm run lint:a11y
npm run build
npm run test:e2e
~~~

## Assessment changes

Assessment data is sensitive.

Keep in mind:

- The normal saved assessment flow is authenticated.
- The Edge Function checks the JWT before saving.
- AI requests are validated and rate-limited.
- OpenAI is the primary provider when configured, with Gemini and local fallback behavior where supported.
- Guest results are kept in browser navigation state instead of being attached to an account.
- The assessment is a screening/support feature, not a medical diagnosis.

If you change what is collected, stored, or sent to an AI provider, also check [docs/AI.md](docs/AI.md) and [docs/ASSESSMENT_POLICY.md](docs/ASSESSMENT_POLICY.md).

## Community changes

Community posts are not protected only by a React button.

The current flow uses the server-side `analyze-community-post` function and a database-side `create_community_post` path. Direct client INSERT access is restricted, and the rolling post limit is enforced in the database.

If you change Community writes, check the RLS policies and migrations too.

## AI function changes

Current main AI functions:

- `analyze-assessment` — v14
- `analyze-community-post` — v7
- `analyze-phq9` — v5

They require JWT authentication and have request validation and rate limiting.

Provider keys belong in Supabase secret storage. Never commit them.

If a function request or response changes, check the frontend code that calls it before deploying.

See [docs/EDGE_FUNCTIONS.md](docs/EDGE_FUNCTIONS.md) and [docs/AI.md](docs/AI.md).

## Database changes

Database authorization is handled by Supabase RLS, not by trusting the frontend.

For a new table or sensitive column:

- decide whether it is public, user-owned, or admin-only
- enable RLS when the table is exposed through the public API
- add explicit policies
- avoid anonymous access unless it is intentionally public
- use a migration so the change is reproducible
- check SECURITY DEFINER functions carefully
- run the Supabase security checks again

See [docs/RLS_AUDIT.md](docs/RLS_AUDIT.md) and [docs/DATA_MODEL.md](docs/DATA_MODEL.md).

## Sharing changes

There is no complicated contribution process for this project.

A useful change should explain what changed, why it changed, anything that could affect existing users/data, and what was tested. Screenshots are useful for UI changes.

For larger changes involving assessment data, authentication, AI, or RLS, it is better to discuss the approach before changing a lot of files.

## Keep the project feeling like SafeSpace

I care about the project being simple enough to understand, especially because it started as a school project.

That does not mean avoiding good engineering. I would rather have a clear solution that can be maintained than add another dependency or abstraction without a real reason.

Please also keep the Thai/English experience, accessibility, mobile behavior, and non-clinical purpose of the project in mind.

## One important thing

Do not commit real user wellbeing answers, reports, passwords, API keys, or other private data while testing. Use test accounts and fake data instead.

Thanks for helping improve the project.
