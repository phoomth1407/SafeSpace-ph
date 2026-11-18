# SafeSpace Data Model

Last reviewed: 18 November 2026 against the connected Supabase project and repository `main`.

This describes practical data boundaries, not a full schema dump. Some legacy table creation SQL is not in this repository; use live schema, policies, grants, functions, and migrations together.

| Table | Purpose and boundary |
| --- | --- |
| `users` | Account profile/role and username; no birthdate column |
| `private.user_birthdates` | Full date and update timestamps; owner reads through `get_my_private_profile`, writes through `save_my_profile` |
| `assessments` | Signed-in wellbeing and PHQ-9 records; sensitive, RLS enabled, authenticated column access restricted |
| `guest_score_shares` | Optional guest score/risk-level share and claim token; no answers or birthdate |
| `guest_assessments` | Legacy/admin-managed guest assessment table |
| `mood_checkins` | Account mood and selected factor by date |
| `assessment_sharing_preferences` | Opt-in to admin score/risk-level visibility |
| `user_policy_acceptances` | Account-scoped policy key/version/time |
| `community_posts`, `community_comments` | Public-facing user content; owner/admin moderation |
| `reports`, `contact_requests` | Submitter/admin paths |
| `emergency_resources` | Public read; admin-managed |
| `edge_rate_limits` | Protected rate-limit state |

## Birthdate privacy

Full dates are stored in `private.user_birthdates`, not `public.users`. The profile table contains username and role information but no birthdate field. The account owner reads the date through `get_my_private_profile`; `save_my_profile` validates/updates it. Public Community and Admin user lists do not show birthdates. The assessment function checks age server-side from this private record.

## Assessment data differs by flow

- **Signed-in wellbeing:** answers go to the authenticated `analyze-assessment` function and may be processed by configured AI providers. The saved row contains score/category and operational/consent metadata, not the answer list or narrative. Full results return to the browser and up to 20 recent objects are cached in localStorage; shared/unlocked devices can expose that local cache.
- **PHQ-9-style:** separate `analyze-phq9` stores nine normalized answers, score/band, and result fields in `assessments`. The underlying schema has these fields, while direct authenticated Data API grants restrict reads. Treat these values as sensitive.
- **Guest:** results display in browser state. If the guest chooses sharing, only score, risk level, language, and a claim-token hash go to `guest_score_shares`; no answers or birthdate are sent.
- **Admin sharing:** an account preference permits risk score/risk level review through a restricted path. It does not grant answer or written-response access. Birthdate is not part of this view.

Community posts/comments link internally to their creator and show a username or anonymous label. Username changes update prior named content; anonymous content stays anonymous. Mood check-ins, policy acceptances, and sharing preferences link to the account.

The authenticated delete-account function removes supported account-owned data before Auth deletion. Guest/device-only data, imported sounds, third-party logs, backups, and data already processed by external AI are outside that operation.

RLS was enabled on the listed app tables during this review. Recheck live schema and policies before backend changes. See [RLS notes](RLS_AUDIT.md).
