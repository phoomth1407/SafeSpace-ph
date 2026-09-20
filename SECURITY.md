# SafeSpace Security Notes

Last reviewed: 2026-09-20

SafeSpace handles sensitive wellbeing/mental-health screening information. This document describes the current security model for the school-project deployment.

## Authentication

Supabase Auth is used for email/password, Google OAuth, and Google One Tap / Google ID-token sign-in. Protected database writes require an authenticated Supabase session. Current AI Edge Functions require a valid JWT.

### Password policy

Signup applies an application-level password policy before calling Supabase Auth:

- 12–128 characters
- lowercase + uppercase + number + symbol
- breached-password screening through the Have I Been Pwned range API

The breached-password check hashes the password locally with SHA-1 and sends only the first five hash characters to the range endpoint. The plaintext password and full hash are not sent.

This is not equivalent to Supabase's server-side leaked-password protection. A direct API caller can bypass a client-side check, so server-side protection should be enabled when the project plan/configuration supports it.

## Database access

RLS is enabled on the current public application tables.

| Table | Normal user | Anonymous user | Admin |
| --- | --- | --- | --- |
| assessments | Own CRUD | No access | Manage |
| community_posts | Public read; own CRUD | Read | Manage |
| community_comments | Public read; own CRUD | Read | Manage |
| contact_requests | Create own | No access | Read/manage |
| emergency_resources | Read | Read | Manage |
| guest_assessments | No access | No access | Manage |
| reports | Create own | No access | Manage |
| users | Read own profile | No access | Manage |
| edge_rate_limits | Own rate-limit rows through restricted policies | No access | Not intended for client management |

The `private.is_admin()` helper uses a trusted search path (`pg_catalog, auth, private`).

## Edge Function protection

Current AI functions:

- `analyze-assessment` — version 14
- `analyze-community-post` — version 7
- `analyze-phq9` — version 5

Controls include JWT verification, authenticated-user lookup, request validation, request-size limits, and per-user rate limiting.

| Function | Request-size limit | Rate limit |
| --- | ---: | --- |
| analyze-assessment | 64 KB | 5 / 60 sec / user |
| analyze-community-post | 64 KB | 5 / 60 sec / user |
| analyze-phq9 | 32 KB | 5 / 60 sec / user |

`analyze-assessment` also limits answer objects to 100, caps answer text fields at 2,000 characters, and validates age 1–120 when supplied.

## Browser security

`index.html` contains a browser Content Security Policy restricting scripts, connections, frames, objects, forms, and base URLs. It is currently implemented as a meta tag; an HTTP response-header CSP would be stronger when the hosting platform makes that practical.

## Secrets

The browser receives only the Supabase URL and publishable key.

Never commit OpenAI API keys, Gemini API keys, Supabase service-role keys, OAuth client secrets, database passwords, or private tokens. AI provider keys belong in Supabase Edge Function secret storage.

## Data minimization and retention

Assessment answers, age, nationality, and generated results can be sensitive. The assessment UI displays a privacy notice before starting. Guest results are kept in browser navigation state rather than saved to the user's account.

This is a school demonstration, not a clinical or regulatory data platform. Before real-world deployment, define retention/deletion rules, access procedures, incident response, consent requirements, and applicable legal/compliance requirements.

## Current limitations

Security hardening reduces common abuse paths but does not make the application impossible to attack.

Known limitations:

- client-side password screening is bypassable by direct API callers
- CSP is currently a meta tag rather than an HTTP response header
- current AI functions allow `Access-Control-Allow-Origin: *`; JWT authorization remains the primary access control, while origin restriction could further reduce unwanted browser callers
- the repository is still a school-project deployment rather than a clinical or regulated health-data system
- some older compatibility Edge Functions remain deployed while the migration away from the legacy function names is completed

## Security maintenance checklist

1. Keep RLS enabled on every new public table.
2. Add explicit ownership/admin policies.
3. Revoke anonymous access to sensitive tables.
4. Keep AI functions JWT-protected unless a deliberate public/webhook design is documented.
5. Validate request size and input shape at Edge Function boundaries.
6. Rate-limit expensive AI endpoints.
7. Keep secrets in Supabase secret storage.
8. Run tests/build/accessibility checks before deployment.
9. Re-run Supabase security advisors after schema changes.
10. Keep production-only migrations/functions synchronized with Git where possible.
