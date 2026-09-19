# SafeSpace Environment Configuration

Last reviewed: 2026-09-19

## Frontend variables

Create `.env.local` from `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Browser-safe Supabase publishable key |

Only browser-safe values belong in Vite `VITE_*` variables.

## Supabase Edge Function secrets

Provider secrets belong in Supabase Edge Function secret storage, not in Git or `.env.local`.

| Secret | Used by | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | AI functions | OpenAI authentication |
| `OPENAI_MODEL` | AI functions | Optional model override |
| `GEMINI_API_KEY` | `analyze-assessment` | Gemini fallback |

Supabase runtime values such as `SUPABASE_URL` are provided to Edge Functions by the platform.

## Local setup

```bash
cp .env.example .env.local
npm ci
npm run dev
```

## Never commit

Do not commit `.env.local`, API keys, service-role keys, OAuth client secrets, database passwords, or private tokens.

The repository `.gitignore` excludes `.env` and `.env.*` while allowing `.env.example`.

## Security notes

The Supabase publishable key is intentionally browser-visible and is not an admin/service-role credential. Database authorization therefore depends on Supabase Auth and RLS.

The signup password checker uses browser Web Crypto and the Have I Been Pwned range API. It does not send the plaintext password or full password hash to that API.
