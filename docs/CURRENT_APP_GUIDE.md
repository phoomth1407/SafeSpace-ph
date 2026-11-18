# Current SafeSpace App Guide

Reviewed 18 November 2026 from repository `main` and the connected Supabase project.

## User flow

1. Guests and account holders open the React/Vite app on GitHub Pages; `HashRouter` handles routes.
2. Guests can browse public Community content, resources, and guest assessment. Account-specific history, mood check-ins, profile, policy acceptances, posting, and comments use a signed-in identity.
3. A signed-in account missing a username or birthdate sees a welcome profile-completion dialog. Settings has the same controls. The birthdate is privately stored and validated; score sharing with admins is a separate optional choice.
4. Signed-in wellbeing assessment answers go to a protected function. The saved main wellbeing row contains score/category metadata, while full result details return to the browser. PHQ-9 is a separate function and stores structured answers/results.
5. Community authors can use a username or anonymous label. Posts are public-facing; writes use protected paths and database limits.
6. Account users can review history, manage profile/sharing preferences, submit reports or contact requests, and request account deletion.

## Data boundaries

- Birthdate is in `private.user_birthdates`, not `public.users`; owner-only RPCs read/write it. Public Community and Admin profile lists do not show it.
- Admin score sharing is opt-in and covers risk score/risk level only, not answers or written responses.
- Main wellbeing answers may be sent to configured AI providers and are not written to the main assessment row; full result details are cached in localStorage.
- PHQ-9 answers/result fields are stored by its separate function and treated as sensitive.
- Guests may opt to send score/risk level only for claiming; guest sharing is separate from account history.
- Account deletion does not erase guest/device-only data, provider logs, backups, or content previously processed by external AI.

## Source map

| Concern | Source |
| --- | --- |
| Routes/providers | `src/App.jsx` |
| Shell, policies, profile welcome | `src/components/Layout.jsx`, `src/components/ProfileCompletionDialog.jsx` |
| Supabase adapter | `src/api/appClient.js` |
| Session/profile hydration | `src/lib/AuthContext.jsx` |
| Pages | `src/pages/` |
| Migrations and functions | `supabase/migrations/`, `supabase/functions/` |
| Project introduction | `public/about.html` |

Frontend CI deploys successful `main` pushes to GitHub Pages. Supabase schema/functions deploy separately. See [Data Model](DATA_MODEL.md), [Edge Functions](EDGE_FUNCTIONS.md), and [Deployment](DEPLOYMENT.md).
