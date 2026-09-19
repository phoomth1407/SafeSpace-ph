# SafeSpace Security Notes

SafeSpace handles sensitive mental-health screening information. This document describes the current security model for the school-project deployment.

## Authentication

Supabase Auth is used for email/password and Google authentication. Guest users can use guest-safe parts of the application, but protected actions require an authenticated Supabase session.

The client uses the Supabase publishable key only. Provider secrets such as OpenAI and Gemini keys must stay in Supabase Edge Function secret storage.

## Row Level Security (RLS)

RLS is enabled on all current public application tables:

- assessments
- community_comments
- community_posts
- contact_requests
- emergency_resources
- guest_assessments
- reports
- users

The security-hardening migration also revokes anonymous Data API access to sensitive/private tables and grants only the minimum authenticated table privileges needed by the application.

### Current access model

**Assessments**
- Authenticated users can create records for themselves.
- Users can read/update/delete their own assessment records.
- Admins can manage assessment records.
- Age is constrained to 1–120 and risk_score to 0–100 when present.

**Community posts/comments**
- Everyone can read community posts/comments.
- Authenticated users create content as themselves.
- Users can manage their own content; admins can moderate/manage content.

**Contact requests**
- Only authenticated users can create contact requests.
- Inserts must use the authenticated user's own created_by_id.
- Normal users cannot read contact requests.
- Admins can read, update, and delete contact requests.

**Emergency resources**
- Everyone can read resources.
- Only admins can create/update/delete resources.

**Guest assessments**
- Guest assessment storage is admin-only at the database layer.

**Reports**
- Authenticated users can create reports as themselves.
- Admins can review/manage reports.

**Users**
- A user can read their own profile.
- Admins can manage user records.

## Frontend security controls

- The assessment flow requires acknowledgement of a privacy notice before starting.
- Sensitive assessment data is not intentionally exposed through anonymous table grants.
- The app includes a browser Content Security Policy in `index.html`.
- CI uses `npm ci` for reproducible dependency installation.
- The repository contains the security-hardening Supabase migration so the database changes are reproducible.

The CSP is currently a meta tag because the frontend is deployed on GitHub Pages. A true HTTP response-header CSP and related headers should be added if the deployment platform is changed to one that permits custom response headers.

## Edge Function boundary

The deployed Supabase Edge Function source was not present in this repository during the security-hardening review. Therefore this repository does **not** claim that server-side request-size limits, rate limiting, schema validation, or abuse controls have been verified.

Before accepting real user/minor data, verify each sensitive Edge Function server-side:

1. Require a valid authenticated session where the operation is not intentionally public.
2. Validate the request body with a strict schema.
3. Reject oversized payloads and unexpectedly large text fields.
4. Apply per-user and/or per-IP rate limits appropriate to the endpoint.
5. Return generic client-safe errors without exposing provider keys, stack traces, SQL, or internal details.
6. Keep AI/provider secrets exclusively in Supabase secret storage.
7. Log only the minimum operational information needed for abuse/error investigation; do not log full mental-health answers unnecessarily.

## Password protection

Supabase's leaked-password protection was reported as disabled during the live security review. Enable Supabase Auth's leaked-password protection before using real accounts.

## RLS verification checklist

For every sensitive table, test at least:

- anonymous SELECT: denied unless intentionally public
- anonymous INSERT: denied unless intentionally public
- authenticated user A reading user B's private row: denied
- authenticated user A modifying user B's private row: denied
- authenticated user A deleting user B's private row: denied
- admin access: allowed where intended
- ownership spoofing in INSERT: denied
- invalid age/risk values: denied by database constraints

Use synthetic test accounts/data only while these checks are being validated.

## Data minimization

The application should collect only information needed for its screening and support features. Assessment results should not be treated as a medical diagnosis.

## Retention and deletion

This project is a school demonstration. Test data should be cleared before public demonstrations. Production-like retention policies should be established before using the application with real users in a real clinical or school setting.

## Crisis support

SafeSpace is not an emergency service and does not replace a qualified mental-health professional.

For people in Thailand, the Department of Mental Health provides hotline 1323, available 24/7. In an immediate medical emergency, use the appropriate local emergency service.

## Important limitations

This document describes the application's current configuration; it is not a legal, clinical, or regulatory compliance certification.

A security hardening pass reduces common exposure risks but cannot guarantee that the application is completely secure. New dependencies, database policies, Edge Functions, deployment settings, and application features should be reviewed when they change.
