![Tests](https://github.com/phoomth1407/SafeSpace-ph/actions/workflows/test.yml/badge.svg)
![Deploy](https://github.com/phoomth1407/SafeSpace-ph/actions/workflows/deploy.yml/badge.svg)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-powered-3ECF8E)

# SafeSpace

SafeSpace is a Vite + React web application focused on youth mental-health screening, supportive self-care tools, community support, and trusted resources.

The current production stack is:

- React + Vite
- Supabase Auth
- Supabase Postgres
- Supabase Edge Functions
- GitHub Pages for the frontend
- OpenAI as the primary assessment-analysis provider
- Gemini as the AI fallback when configured
- A local rule-based fallback when both AI providers are unavailable

## Highlights

SafeSpace is built as a real small-stack application rather than a static mockup. It includes authenticated and guest flows, Supabase RLS, AI fallback handling, bilingual UI, responsive themes, automated tests, route-level lazy loading, and an accessibility lint pass.

## Prerequisites

- Node.js
- npm
- A configured Supabase project for authentication, database access, and Edge Functions

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Vite will print the local development URL in the terminal.

# Website URL

https://phoomth1407.github.io/SafeSpace-ph

## Supabase

The frontend uses Supabase for:

- Authentication
- User profiles
- Assessments and assessment history
- Community posts and comments
- Emergency resources
- Edge Functions for AI analysis and community moderation

The assessment AI Edge Function is:

```
analyze-assessment
```

AI processing is designed as:

```
OpenAI
  -> Gemini fallback
  -> Local fallback
```

Gemini fallback requires the Supabase Edge Function secret:

```
GEMINI_API_KEY
```

Other secrets such as the OpenAI API key must also remain in Supabase secret storage and must never be committed to the repository.

## Frontend features

- Assessment with PHQ-9-related screening context
- AI-assisted assessment analysis
- Personalized next-step wellbeing tools
- Daily Mood Check-in
- Guided Breathing
- 5-4-3-2-1 Grounding
- Worry Release
- Procedural Ambient Sound Mixer
- Anonymous Community
- Mental-health resources and hotlines
- Assessment History and trend visualization
- Thai and English language support
- Light and Dark themes
- Google OAuth and Google One Tap authentication

## Legacy folder

The `legacy/` directory contains archived files inherited from the original Base44 version of the project.

These files are kept only for historical/reference purposes and are not part of the current production backend.

The active application uses Supabase instead.

## Development quality

GitHub Actions runs the test suite, an accessibility-focused ESLint audit, and a production build on pushes and pull requests. Dependabot is configured to check npm and GitHub Actions dependencies weekly.

## Performance

Application routes are lazy-loaded with React Suspense so the initial page does not need to download every page component up front.

## Deployment

The frontend is deployed from the GitHub repository to GitHub Pages.

Supabase Edge Functions are deployed to the connected Supabase project.

Before deploying changes, verify:

1. `npm run build` succeeds.
2. GitHub Actions completes successfully.
3. Supabase Edge Functions are deployed successfully.
4. Light/Dark theme behavior is checked.
5. Thai/English language behavior is checked.

## Notes

Assessment results are intended for screening and supportive guidance. They are not medical diagnoses.

## Security and development docs

- [Security model](SECURITY.md)
- [Supabase RLS audit](docs/RLS_AUDIT.md)
- [.env.example](.env.example) — safe template for local frontend configuration; provider secrets stay in Supabase Edge Function secrets.

## Crisis support

SafeSpace is a screening and supportive-information tool, not an emergency service. In Thailand, the Department of Mental Health provides the 1323 hotline 24/7. In an immediate medical emergency, contact the appropriate local emergency service. citeturn652121search0turn652121search6turn652121search5
