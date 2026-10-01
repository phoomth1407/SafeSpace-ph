# SafeSpace Data Model

Last reviewed: 2026-10-01

This is a practical map of the data SafeSpace uses. It is not meant to replace the actual Supabase schema or migrations.

One important detail: the repository does not contain the original full database-creation migration for every application table. Some of the database structure existed before the current migration history was added. So this document describes the tables and access rules currently used by the application and tracked security migrations, rather than pretending this is the complete schema source.

## Main tables

| Table | Main purpose | Sensitivity | Main access |
| --- | --- | --- | --- |
| `users` | User profile information | Private | User owns profile; admins manage |
| `assessments` | Signed-in screening score metadata | Sensitive | Owner/admin RLS; authenticated Data API access limited to metadata columns |
| `guest_assessments` | Legacy/admin-managed guest screening records | Sensitive | Admin-only RLS; authenticated Data API reads limited to score metadata |
| `community_posts` | Public Community posts | Public-facing | Public read; controlled authenticated create; owner/admin management |
| `community_comments` | Comments on Community posts | Public-facing | Public read; authenticated write; owner/admin management |
| `reports` | Reports about Community content | Sensitive | Authenticated create; admin management |
| `contact_requests` | Messages sent to admin | Sensitive | Authenticated create; admin management |
| `emergency_resources` | Mental-health/resource information | Public | Public read; admin write |
| `edge_rate_limits` | Rate-limit counters | Security-sensitive | Authenticated user maintains own rows through the intended path |

The exact columns can change as the project develops. This table is mainly here to explain why the data exists and how it is protected.

## How the relationships work

There is not a huge relational model with dozens of joins. Most important relationships use a user ID or post ID.

### Users -> assessments

Signed-in assessment rows are tied to the authenticated Supabase user ID. RLS limits rows to the owner or an administrator. In addition, authenticated Data API column grants now expose only `id`, timestamps, `created_by_id`, `risk_level`, `risk_score`, `screening_type`, `analysis_source`, and `language`; answers, age, nationality, narrative summaries, recommendations, and PHQ-9 detail columns are not selectable through the authenticated Data API. New signed-in assessment submissions still send answers to the analysis function and configured AI provider(s), but only score metadata is written to the `assessments` row. The same row records the assessment-policy consent version and the server receipt timestamp for explicit sensitive-data consent; these fields do not contain answer text. Full result details may be kept in the user's browser localStorage cache (up to 20 entries) for result display; this is browser-local storage, not server-side history, and can be exposed on a shared/unlocked device.

### Users -> Community posts

Community posts are associated with their authenticated creator.

Posts are publicly readable, but creating a post is not treated as a public anonymous database INSERT. The current application uses a controlled server/database path, and direct client INSERT access is restricted.

A rolling post limit is also enforced at the database layer.

### Posts -> comments

Comments belong to Community posts and are stored in `community_comments`. Comments are publicly readable. Authenticated users can create comments, while ownership/admin rules control changes and moderation.

### Users -> reports

A report records the authenticated user who submitted it and the content being reported. Normal users can create their own reports; admins can review and manage them.

### Users -> contact requests

Contact requests are associated with the authenticated creator. The create policy checks that `created_by_id` matches the current authenticated user.

Normal users do not get general SELECT access to contact requests, so the frontend does not need to read back the private row after INSERT.

### Users -> rate limits

AI rate limiting is stored in `edge_rate_limits`. The rate-limit state is associated with the authenticated user and endpoint/window. The database function updates this protected state instead of trusting a value supplied by the browser.

## RLS in simple terms

Supabase Row Level Security is the final database permission layer.

The frontend might hide a button, but that is not security. A user can make their own request from browser developer tools.

For SafeSpace:

- public data is intentionally readable
- sensitive user data is owner/admin controlled
- anonymous access is removed from private tables
- admin access is checked separately
- Community creation has an additional controlled path
- rate-limit state is protected
- security-definer database functions use restricted search paths and execution grants

See [RLS audit](RLS_AUDIT.md) for the current checks.

## Guest assessments

Guest behavior is different from signed-in users.

The current guest UI computes the result locally and keeps it in browser navigation state so it can be shown without creating an account. A persistent browser-only guest history has not been implemented, and the guest result is not submitted to the analysis Edge Function by the current guest path. A `guest_assessments` table also exists for legacy/admin-managed records; authenticated reads are limited to `id`, timestamps, `risk_level`, `risk_score`, and `language`, with row access controlled by the admin-only RLS policies. Its existence does not mean new guest results are automatically written to it.

## Assessment history and deletion

Signed-in score metadata can appear in the History page. The full result shown immediately after analysis is cached in browser localStorage where available (up to 20 entries); if that cache is unavailable or cleared, older server rows provide score metadata only, not the full narrative or answers. Users can delete their saved assessment records through the History feature, subject to the database DELETE policy.

Guest results are not added to the signed-in user's history.

## Data that should be treated as sensitive

Even when a field is not an obvious identifier, assessment answers can contain personal or wellbeing information.

Treat these as sensitive:

- assessment answers
- generated assessment results
- PHQ-9-style results
- reports
- contact messages
- private profile information
- authentication/session information
- rate-limit/security state

Do not put real user data into tests, screenshots, issues, pull requests, or example payloads.

## Database changes

Tracked database changes live under `supabase/migrations/`.

The current repository includes September–October 2026 security work for:

- security hardening
- assessment and guest-assessment column-level access restrictions
- rate-limit RPC grants/locking
- Community rolling post limits
- database-enforced Community post creation
- SECURITY DEFINER search-path hardening

The repository and live Supabase project can still drift if someone changes the database directly in the Supabase dashboard. That is why the deployment and RLS docs call out the difference.

## When adding a table

Before adding a table, I would ask:

1. Is the data public, user-owned, or admin-only?
2. Can an unauthenticated user ever see it?
3. Who is allowed to insert it?
4. Who can update/delete it?
5. Does the frontend really need direct access?
6. Should a server-side function or RPC be used?
7. Does it need an index for the query/RLS pattern?
8. Does it contain personal or wellbeing information?

Then add the migration and update this document if the table changes the overall data model.

## Important limitation

This document is a guide to the current application data model, not a generated schema dump.

For exact column types, constraints, indexes, functions, and policies, the Supabase database and SQL migrations are the authoritative sources.
