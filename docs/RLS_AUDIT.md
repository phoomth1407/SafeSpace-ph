# SafeSpace Supabase RLS Audit

Audit date: 2026-09-19

## Result

RLS is enabled on every current public application table.

| Table | RLS | Intended access |
| --- | --- | --- |
| assessments | ON | Owner + admin |
| community_comments | ON | Public read; authenticated write; owner/admin manage |
| community_posts | ON | Public read; authenticated write; owner/admin manage |
| contact_requests | ON | Authenticated create with owner check; admin read/update/delete |
| emergency_resources | ON | Public read; admin manage |
| guest_assessments | ON | Admin manage |
| reports | ON | Authenticated create; admin manage |
| users | ON | Self read; admin manage |

## Security-hardening changes

The `security_hardening_20260919` migration:

- revokes anonymous Data API privileges from sensitive tables
- limits sensitive table grants to authenticated users
- keeps public read access only on intentionally public community/resource tables
- requires `contact_requests.created_by_id` to match the authenticated user
- constrains assessment ages to 1–120
- constrains assessment risk scores to 0–100
- pins the `private.is_admin()` function search path to trusted schemas

## Key checks

- Owner checks on user-owned data compare `created_by_id` against `(auth.uid())::text` where applicable.
- Admin policies use the project's `private.is_admin()` helper.
- Private tables should not accidentally grant SELECT to normal users.

## Follow-up access matrix

Whenever a new table or policy is added, verify:

1. RLS is enabled.
2. Anonymous access is explicitly denied unless the data is intentionally public.
3. INSERT/UPDATE/DELETE policies constrain ownership or admin access.
4. A normal user cannot read or modify another user's private rows.
5. Ownership cannot be spoofed during INSERT.
6. Invalid input ranges are rejected by database constraints where appropriate.

These checks should be run against synthetic accounts/data before real minor or mental-health data is introduced.
