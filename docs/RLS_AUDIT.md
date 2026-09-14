# SafeSpace Supabase RLS Audit

Audit date: 2026-09-14

## Result

RLS is enabled on every current public application table.

| Table | RLS | Intended access |
| --- | --- | --- |
| assessments | ON | Owner + admin |
| community_comments | ON | Public read; authenticated write; owner/admin manage |
| community_posts | ON | Public read; authenticated write; owner/admin manage |
| contact_requests | ON | Authenticated create; admin read/update/delete |
| emergency_resources | ON | Public read; admin manage |
| guest_assessments | ON | Admin manage |
| reports | ON | Authenticated create; admin manage |
| users | ON | Self read; admin manage |

## Key checks

- contact_requests_create uses role authenticated with WITH CHECK (true).
- contact_requests_read is restricted to admins.
- contact_requests_update and contact_requests_delete are restricted to admins.
- Owner checks on user-owned data compare created_by_id against (auth.uid())::text where applicable.
- Admin policies use the project's private.is_admin() helper.

## Security goal

The frontend should never solve a database authorization problem by exposing more rows to the client. RLS remains the final authorization boundary.

## Follow-up

Whenever a new table is added, verify:
1. RLS is enabled.
2. Anonymous access is explicitly denied unless the data is intentionally public.
3. INSERT/UPDATE/DELETE policies constrain ownership or admin access.
4. Private tables do not accidentally grant SELECT to normal users.
