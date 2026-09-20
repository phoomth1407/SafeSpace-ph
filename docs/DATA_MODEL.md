# SafeSpace Data Model

Last reviewed: 2026-09-20

This is a practical map of the data SafeSpace uses. It is not meant to replace the actual Supabase schema or migrations.

One important detail: the repository does not contain the original full database-creation migration for every application table. Some of the database structure existed before the current migration history was added. So this document describes the tables and access rules currently used by the application and tracked security migrations, rather than pretending this is the complete schema source.

## Main tables

| Table | Main purpose | Sensitivity | Main access |
| --- | --- | --- | --- |
| `users` | User profile information | Private | User owns profile; admins manage |
| `assessments` | Saved assessment/screening results | Sensitive | Owner + admin |
| `guest_assessments` | Stored guest assessment records | Sensitive | Admin only |
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

Signed-in assessment rows are tied to the authenticated Supabase user ID. RLS limits normal users to their own records. Admins have a separate management path.

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

The current guest UI does not attach the result to an authenticated account. The result is kept in browser navigation state so a user can see it without creating an account.

There is also a `guest_assessments` table in the backend. Its database access is admin-only.

So the existence of that table does not mean every guest result is automatically written to it by the current frontend flow.

## Assessment history and deletion

Signed-in assessment results can appear in the History page.

Users can delete their saved assessment records. The database DELETE policy is part of the access model, not just a hidden UI action.

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

The current repository includes September 2026 security work for:

- security hardening
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
