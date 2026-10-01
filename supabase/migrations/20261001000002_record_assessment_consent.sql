-- Record explicit assessment-processing consent without storing assessment answers.
alter table public.assessments
  add column if not exists consent_version text,
  add column if not exists sensitive_data_consent_at timestamptz;

-- Keep these as narrowly scoped metadata fields for authenticated inserts.
grant insert (consent_version, sensitive_data_consent_at) on table public.assessments to authenticated;
