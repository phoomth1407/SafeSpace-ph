# SafeSpace Edge Functions

Last reviewed: 2026-09-20

## What is currently deployed

| Function | Status | Version | JWT |
| --- | --- | ---: | --- |
| `analyze-assessment` | ACTIVE | 14 | Required |
| `analyze-community-post` | ACTIVE | 7 | Required |
| `analyze-phq9` | ACTIVE | 5 | Required |
| `analyzeCommunityPost` | ACTIVE | 3 | Required |
| `communityInteract` | ACTIVE | 3 | Required |

The first three are the current hardened AI endpoints. The latter two are compatibility/legacy-style functions that remain deployed and should be checked before removal.

## `analyze-assessment`

Purpose: authenticated wellbeing assessment analysis and persistence.

Controls:

- JWT required
- 64 KB request-size limit
- JSON body validation
- 1–100 answer objects
- answer text fields capped at 2,000 characters
- age validated to 1–120 when supplied
- authenticated-user lookup
- 5 requests / 60 seconds / user
- OpenAI primary when configured
- Gemini fallback when configured
- local fallback when remote AI is unavailable
- result saved to `public.assessments`

## `analyze-community-post`

Purpose: authenticated community-post creation with optional AI support.

Controls:

- JWT required
- 64 KB request-size limit
- JSON body validation
- content must be at least 10 characters
- authenticated-user lookup
- 5 requests / 60 seconds / user
- lightweight safety flag
- optional OpenAI response
- post saved to `public.community_posts`

## `analyze-phq9`

Purpose: authenticated PHQ-9 screening result creation.

Controls:

- JWT required
- 32 KB request-size limit
- JSON body validation
- exactly 9 answers required
- answers normalized to 0–3
- score calculated from 0–27
- screening band calculated from the score
- authenticated-user lookup
- 5 requests / 60 seconds / user
- optional OpenAI summary/recommendations
- result saved to `public.assessments`

The PHQ-9 result is a screening indicator, not a diagnosis.

## Rate limiting

The current AI endpoints call `consume_rate_limit` with a 60-second window and maximum of 5 requests per user/endpoint window.

The rate-limit state is stored in `public.edge_rate_limits` and protected by RLS. The database function is intentionally SECURITY DEFINER because it writes the protected counter table on behalf of an authenticated caller; its `search_path` is pinned to an empty path and EXECUTE is restricted to `authenticated`.

## Keeping the source and production in sync

As of 2026-09-20, the three current AI function source files under `supabase/functions/` match the deployed Supabase `index.ts` byte-for-byte for the active functions `analyze-assessment` (v14), `analyze-community-post` (v7), and `analyze-phq9` (v5).

`analyzeCommunityPost` remains deployed as a legacy compatibility function (v3) but is no longer used by the current application flow. `communityInteract` remains deployed and is still used by the Community UI. The current connector can inspect and deploy Edge Functions but does not expose a delete operation, so the legacy `analyzeCommunityPost` endpoint is documented for later retirement rather than removed blindly.

## When changing an Edge Function

When changing an Edge Function:

1. Keep JWT verification enabled.
2. Validate request size before expensive processing.
3. Validate JSON shape before using user-controlled fields.
4. Authenticate the user before database writes.
5. Apply a rate limit to expensive AI calls.
6. Keep provider keys in Supabase secrets.
7. Preserve response fields expected by the frontend.
8. Test success and rejected-request paths.
9. Record the deployed version here.
