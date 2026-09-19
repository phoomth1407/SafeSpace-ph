# SafeSpace Supabase RLS Audit

Audit date: 2026-09-19

## Result

RLS is enabled on the current public application tables, including the rate-limit table used by the AI Edge Functions.

| Table | RLS | Intended access |
| --- | --- | --- |
| assessments | ON | Owner + admin |
| community_comments | ON | Public read; authenticated write; owner/admin manage |
| community_posts | ON | Public read; authenticated write; owner/admin manage |
| contact_requests | ON | Authenticated create; admin read/update/delete |
| edge_rate_limits | ON | Authenticated user can maintain only their own rate-limit rows |
| emergency_resources | ON | Public read; admin manage |
| guest_assessments | ON | Admin manage |
| reports | ON | Authenticated create; admin manage |
| users | ON | Self read; admin manage |

## Key checks

- `contact_requests_create` requires `created_by_id = auth.uid()`.
- Contact-request read/update/delete are restricted to admins.
- Owner checks on user-owned records compare `created_by_id` with `auth.uid()` where applicable.
- Admin policies use `private.is_admin()`.
- Anonymous access is revoked from private tables.
- `edge_rate_limits` allows authenticated users to insert/update only rows belonging to their own `auth.uid()`.
- The rate-limit function is SECURITY INVOKER and public execute access is revoked; authenticated clients invoke it through the authenticated Supabase session.

## Sensitive table behavior

### assessments
Authenticated users can create/read/update/delete their own rows. Admins can manage all rows.

### community_posts and community_comments
Posts/comments are publicly readable. Authenticated users can create and manage their own content. Admins can moderate/manage content.

### contact_requests
Authenticated users can create their own requests. Normal users do not have SELECT access, so the frontend intentionally does not chain `.select()` after INSERT. Admins can read and manage requests.

### guest_assessments
Guest assessment storage is admin-only at the database layer.

### reports
Authenticated users can create their own reports. Admins can review/manage reports.

### users
Users can read their own profile; admins can manage user records.

### emergency_resources
Public read access is intentional. Admin-only write access is enforced by RLS.

## Security goal

The frontend should never solve a database authorization problem by exposing more rows to the client. RLS remains the final authorization boundary.

## Production/source-control note

The live Supabase project has these recent migrations applied:

- `security_hardening_20260919`
- `add_edge_rate_limit_20260919`
- `fix_edge_rate_limit_security_20260919`

The first is currently tracked under `supabase/migrations/` in `main`. The two rate-limit migration files are applied in production but are not yet mirrored in the repository. This should be synchronized before using the repository as the sole source for rebuilding the database.

## Follow-up

Whenever a new table or function is added:

1. Enable RLS where the table is exposed through the public API.
2. Explicitly deny anonymous access unless the data is intentionally public.
3. Constrain INSERT/UPDATE/DELETE policies to ownership or admin access.
4. Re-check function SECURITY DEFINER / SECURITY INVOKER behavior and search paths.
5. Add the migration to source control.
6. Re-run the Supabase security advisor.
