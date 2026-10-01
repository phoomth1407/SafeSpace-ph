-- Admin dashboard needs only aggregate guest screening metadata.
-- Keep answers and narrative fields out of authenticated Data API reads.
revoke select on table public.guest_assessments from authenticated;
revoke select (id, created_date, updated_date, created_by, created_by_id, is_sample, risk_level, ai_summary, nationality, risk_score, depression_chance, age_group, answers, language, recommendations, age) on table public.guest_assessments from authenticated;
grant select (id, created_date, updated_date, risk_level, risk_score, language) on table public.guest_assessments to authenticated;
