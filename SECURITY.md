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

### Current access model

**Assessments**
- Authenticated users can create records for themselves.
- Users can read/update/delete their own assessment records.
- Admins can manage assessment records.

**Community posts/comments**
- Everyone can read community posts/comments.
- Authenticated users create content as themselves.
- Users can manage their own content; admins can moderate/manage content.

**Contact requests**
- Only authenticated users can create contact requests.
- Normal users cannot read contact requests.
- Admins can read, update, and delete contact requests.
- The client intentionally performs an INSERT without chaining .select(), because normal users do not have SELECT permission on this private table.

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

## Data minimization

The application should collect only information needed for its screening and support features. Assessment results should not be treated as a medical diagnosis.

## Retention and deletion

This project is a school demonstration. Test data should be cleared before public demonstrations. Production-like retention policies should be established before using the application with real users in a real clinical or school setting.

## Crisis support

SafeSpace is not an emergency service and does not replace a qualified mental-health professional.

For people in Thailand, the Department of Mental Health provides hotline 1323, available 24/7. In an immediate medical emergency, use the appropriate local emergency service.

## Important limitations

This document describes the application's current configuration; it is not a legal, clinical, or regulatory compliance certification.
