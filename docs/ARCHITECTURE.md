# SafeSpace Architecture

Last reviewed: 18 November 2026 against repository `main` and live Supabase metadata.

## Runtime

React 18/Vite 6 builds the static single-page app. React Router's `HashRouter` supports GitHub Pages deep links; route pages are lazy-loaded. Supabase provides Auth, Postgres, Realtime, and Edge Functions.

```text
Browser: React/Vite → AuthContext + appClient adapter
                       ├─ Supabase Auth
                       ├─ Postgres/RPCs (RLS and grants)
                       ├─ Edge Functions
                       └─ Realtime Community changes
GitHub Actions → checks/build → GitHub Pages
Supabase project → migrations/functions deployed separately
```

Only the Supabase URL and publishable key are browser-side. Provider keys and service-role credentials remain server-side.

## Main modules
- `src/App.jsx`: providers, routes, version check, startup and route transitions.
- `src/components/Layout.jsx`: navigation, policy readers, profile welcome prompt.
- `src/api/appClient.js`: adapter mapping page operations to tables, RPCs, and functions.
- `src/lib/AuthContext.jsx`: session handling and profile hydration.
- `src/pages/`: Home, assessment/results, Community, Resources, History, Settings, Toolkit, Admin, and auth.
- `public/about.html`: standalone introduction shipped with the Pages build.

## Account profile

After sign-in, the app loads the SafeSpace profile. A missing username or birthdate opens a welcome completion dialog; Settings provides the same controls. Authenticated RPCs save profile data. Full birthdate is stored in `private.user_birthdates`, separate from `public.users`; the Admin profile view does not expose it. Profile validation and assessment age eligibility are checked server-side.

## Assessment paths
- **Signed-in wellbeing:** policy/consent acknowledgement, then JWT-protected `analyze-assessment`. The function validates identity, private birthdate/age, request, consent metadata, and rate limit. Configured OpenAI/Gemini and local/offline fallback are supported. The saved row has score/category and operational/consent metadata; answers and narrative return to the browser and full details are cached locally.
- **Guest:** browser result; optional `save-guest-score` stores only score/risk level for later claiming.
- **PHQ-9-style:** separate authenticated `analyze-phq9`; it stores structured answers and result fields in `assessments`. Authenticated Data API grants are narrower than the table schema.

## Community and account data

Community reads are public and updates arrive through Realtime. Post creation uses database-side `create_community_post` with rolling limits. Comments/moderation use authenticated and owner/admin paths. Mood check-ins, sharing preferences, and policy acceptances link to the account. Admin score review follows each user's opt-in and returns score/risk level, not answers.

## Live backend snapshot

Connected project: SafeSpace (`nvvttqbqhmwpxzfrjixe`, `ap-northeast-1`). Applied history includes private birthdate, profile/username, policy acceptance, score-sharing, and anonymous Community migrations. Supabase reported RLS on listed application tables in `public` and `private.user_birthdates`. This dated inventory can drift; see [RLS notes](RLS_AUDIT.md) and [Edge Functions](EDGE_FUNCTIONS.md).

GitHub Actions checks/builds pull requests and deploys successful `main` pushes. Supabase changes deploy separately; frontend rollback does not revert database state.
