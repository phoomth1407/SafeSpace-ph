# SafeSpace Supabase Access and RLS Notes

Review date: 18 November 2026. This snapshot uses the connected project inventory, migration history, current app paths, and tracked SQL; it is not a formal penetration test. Supabase reported RLS enabled on listed app tables in `public` and on `private.user_birthdates`. Recheck each live policy and grant before backend changes.

## Main access boundaries

| Data | Access intent |
| --- | --- |
| `users` | Profile/role/username; no birthdate column |
| `private.user_birthdates` | Owner-only profile RPC; excluded from public/admin profile views |
| `assessments` | Owner records; direct authenticated columns restricted; admin score view follows opt-in |
| `assessment_sharing_preferences` | Owner opt-in for risk score/level only |
| `user_policy_acceptances` | Account-scoped policy versions |
| Community posts/comments | Public reads, controlled authenticated writes, owner/admin moderation |
| Reports/contact requests | Submitter/admin paths |
| Emergency resources | Public reads, admin management |
| Mood check-ins | Account-owned |
| Rate-limit counters | Protected function/database path |
| Guest score shares | Optional guest score-only claim flow |

## Birthdate privacy

The full date is in `private.user_birthdates`, separate from `public.users`. The owner reads through `get_my_private_profile`; updates use `save_my_profile`. Admin user lists and public Community do not expose the date. Assessment eligibility is checked server-side.

Keep birthdate out of public posts/profiles, admin user lists, admin score-sharing RPCs, and administrator-facing assessment payloads.

## Assessment scope

Main wellbeing rows save score/category and operational/consent metadata; answers and narrative return to the browser. PHQ-9 stores answer/result fields in the underlying assessment table, while direct authenticated Data API grants are narrower than the schema. Admin sharing is opt-in and score/risk-level only. Browser-local result caches can remain on shared devices.

## Live migration snapshot

The applied project history included `account_policy_acceptances`, `store_birth_dates_privately`, `admin_assessment_age_segments`, `community_roles_pinning_tester_permissions`, `allow_tester_user_role`, `backfill_community_author_roles`, `recognize_protected_admin_profiles`, `account_profiles_and_community_usernames`, `set_my_assessment_sharing`, and `allow_anonymous_community_before_profile`. Latest reported applied version: `20261115172949`.

For changes, review schema exposure, RLS, column grants, execution rights/search paths, ownership checks, and admin RPC result columns. Recheck production after deployment because Git and dashboard state can drift.
