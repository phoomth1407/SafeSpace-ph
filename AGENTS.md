# SafeSpace Development Notes

## Current stack

- Frontend: React + Vite
- Backend: Supabase
- Database: Supabase Postgres
- Authentication: Supabase Auth
- Server-side logic: Supabase Edge Functions
- Deployment: GitHub Pages
- AI: OpenAI primary, Gemini fallback, local fallback

## Development

Run the frontend locally with:

```bash
npm install
npm run dev
```

The active backend lives in Supabase. Do not add new Base44 dependencies or Base44-specific runtime behavior.

## Repository structure

- `src/`: frontend application
- `src/api/base44Client.js`: compatibility adapter currently used by older page code; the implementation inside it talks to Supabase
- `src/lib/supabaseClient.js`: Supabase client
- `supabase/`: current Supabase-side project assets when present
- `legacy/`: archived files from the original Base44 project; not used by production

## Important rules

- Keep authentication on Supabase Auth.
- Keep Edge Functions JWT-protected unless the function itself implements explicit authentication or a safe webhook pattern.
- Store AI API keys in Supabase secrets, never in frontend code.
- Preserve Thai/English support.
- Preserve Light/Dark theme support.
- Avoid changing established button colors unless explicitly requested.
- Assessment AI is a screening/support feature, not a diagnostic system.
