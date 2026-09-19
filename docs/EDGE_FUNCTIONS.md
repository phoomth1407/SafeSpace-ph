# SafeSpace Edge Functions

Last reviewed: 2026-09-19

## Current production inventory

| Function | Status | Version | JWT |
| --- | --- | ---: | --- |
| `analyze-assessment` | ACTIVE | 13 | Required |
| `analyze-community-post` | ACTIVE | 5 | Required |
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

The rate-limit state is stored in `public.edge_rate_limits` and protected by RLS. The database function is SECURITY INVOKER and public execute access is revoked.

## Source-control status

As of 2026-09-19, the three current AI function source files are deployed in Supabase but are not yet present under `supabase/functions/` on `main`.

The live Supabase project is therefore the source of truth for their deployed code. Before future refactors or disaster recovery, mirror the deployed source into Git and deploy from the repository.

## Operational guidance

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
