# SafeSpace Architecture

Last reviewed: 2026-09-19

## How the project is put together

The frontend is built with React/Vite. Supabase handles authentication, database storage, Realtime events, and server-side Edge Functions.

```text
Browser
  |
  +-- React/Vite UI
  |     +-- Auth
  |     +-- Assessment / Result
  |     +-- Home wellbeing tools
  |     +-- Community
  |     +-- Resources
  |     +-- History
  |     +-- Admin
  |
  +-- src/api/appClient.js
  |     +-- Supabase Auth
  |     +-- Postgres through RLS
  |     +-- Edge Functions
  |
  +-- Supabase Realtime
        +-- Community post updates
```

## Frontend

`src/pages/` contains route-level pages such as `Home.jsx`, `Assessment.jsx`, `AssessmentResult.jsx`, `Community.jsx`, `Resources.jsx`, `History.jsx`, `Admin.jsx`, and authentication pages.

`src/api/appClient.js` is the main Supabase-backed data adapter. Some pages still use the older entity/function interface, so this file keeps that interface working while the actual backend is Supabase. It also contains signup password checks and local assessment fallback/repair logic.

`src/lib/` contains shared infrastructure such as the Supabase client, auth context, i18n, scoring, and auth return-to handling.

## Assessment flow

### Guest flow

1. The UI validates age and requires acknowledgement of the privacy notice.
2. The user completes the assessment in the browser.
3. The result can be displayed without writing it to the user's account.

### Authenticated flow

1. The UI invokes `analyze-assessment`.
2. The Edge Function verifies the JWT and loads the authenticated user.
3. Request size and JSON shape are validated.
4. `consume_rate_limit` applies 5 requests / 60 seconds / user.
5. OpenAI is attempted first when configured.
6. Gemini is used as a fallback when configured.
7. Local fallback logic remains available.
8. The result is saved to `public.assessments`.
9. The result page reads the saved row through RLS.

## Community

`Community.jsx` reads public posts and subscribes to Supabase Realtime INSERT/UPDATE/DELETE events.

Normal authenticated posts are sent to `analyze-community-post`, which currently requires JWT authentication, enforces a 64 KB request limit and 5-request/60-second rate limit, applies a lightweight safety flag, optionally calls OpenAI, and inserts the post into `community_posts`.

Comments use `community_comments` with RLS ownership/admin controls.

## PHQ-9

`analyze-phq9` is a separate authenticated Edge Function. It requires exactly nine answers, normalizes answers to 0–3, calculates a 0–27 screening score and band, optionally asks OpenAI for supportive text, and saves the result to `assessments`.

## What is public and what is private

Public by design:

- community post reads
- community comment reads
- emergency resource reads

Private/authenticated:

- assessments
- guest assessment storage
- reports
- contact requests
- user profiles
- rate-limit state

RLS is the database authorization boundary.

## Deployment

The frontend is deployed to GitHub Pages from `main`. Supabase database changes and Edge Functions are deployed separately to the connected project.

The live backend currently contains some migrations/functions that are not mirrored in `main`. See `docs/RLS_AUDIT.md` and `docs/EDGE_FUNCTIONS.md` before rebuilding the backend from source.

## Things I try to keep consistent

- Keep provider secrets server-side.
- Keep AI functions JWT-protected.
- Validate expensive AI requests before processing.
- Rate-limit expensive AI endpoints.
- Preserve Thai/English and Light/Dark behavior.
- Treat assessment answers and generated results as sensitive.
- Present AI output as screening/supportive guidance, not diagnosis.
