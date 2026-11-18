# SafeSpace Edge Functions

Last reviewed: 18 November 2026 using the connected Supabase inventory. All listed functions were reported ACTIVE.

| Function | Version | JWT | Role |
| --- | ---: | --- | --- |
| `analyze-assessment` | 16 | Required | Signed-in wellbeing analysis |
| `analyze-community-post` | 7 | Required | Protected Community analysis endpoint |
| `analyze-phq9` | 5 | Required | PHQ-9-style screening |
| `delete-account` | 1 | Required | Delete authenticated account data |
| `communityInteract` | 3 | Required | Community compatibility interactions |
| `analyzeCommunityPost` | 4 | Required | Older compatibility endpoint; check callers before retirement |
| `save-guest-score` | 1 | No | Optional guest score-only share/claim path |

Versions are live-project values and can drift from tracked source. Verify before release.

## `analyze-assessment`

Requires JWT; validates request size (64 KB), JSON, 1–100 bounded answer objects, consent metadata, identity, and a 5-per-60-second rate limit. For a non-anonymous account it gets the birthdate through the authenticated private-profile RPC and checks age server-side. It can use configured OpenAI, Gemini fallback, and local/offline behavior. The saved wellbeing row contains score/category and operational/consent metadata; answers and narrative return to the browser. Provider keys stay in Supabase secrets.

## `analyze-community-post`

JWT-protected analysis with input validation, safety handling, and rate limiting before configured AI processing. Community post creation also uses database-side `create_community_post` and rolling limits.

## `analyze-phq9`

Requires authentication and nine answers; normalizes each to 0–3, calculates a 0–27 score/band, applies the rate limit, and can use OpenAI for supportive text. Stores structured answers and result fields in the assessment table. This is screening, not diagnosis.

## `delete-account`

Uses caller ID from the verified token, not a caller-supplied target. Server-side service-role access stays inside the function. It removes supported account-owned rows before Auth deletion. Guest/device-only data, imported sounds, provider logs, backups, and content already processed by third parties are outside deletion.

## `save-guest-score`

JWT verification is disabled for the guest route. It validates a score/risk-level payload and random claim token, storing only score-sharing data for later claiming; no answers or birthdate.

AI endpoints use database-backed `consume_rate_limit` (5 requests / 60 seconds per user/endpoint). Preserve JWT checks on authenticated functions, validate inputs, keep secrets server-side, review grants/RLS, and update this inventory after deployment. Current sources are under `supabase/functions/`; migrations are under `supabase/migrations/`.
