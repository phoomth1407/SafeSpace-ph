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
