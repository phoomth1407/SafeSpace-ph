-- Restrict signed-in clients to assessment score metadata.
-- Full answer/narrative columns remain unavailable through the exposed Data API.
revoke select, insert, update on table public.assessments from authenticated;
revoke select (id, created_date, updated_date, created_by, created_by_id, is_sample, risk_level, ai_summary, nationality, risk_score, depression_chance, age_group, answers, similar_case, recommendations, age, screening_type, phq9_score, phq9_band, phq9_ai_summary, phq9_recommendations, tool_recommendations, analysis_source, language), insert (id, created_date, updated_date, created_by, created_by_id, is_sample, risk_level, ai_summary, nationality, risk_score, depression_chance, age_group, answers, similar_case, recommendations, age, screening_type, phq9_score, phq9_band, phq9_ai_summary, phq9_recommendations, tool_recommendations, analysis_source, language), update (id, created_date, updated_date, created_by, created_by_id, is_sample, risk_level, ai_summary, nationality, risk_score, depression_chance, age_group, answers, similar_case, recommendations, age, screening_type, phq9_score, phq9_band, phq9_ai_summary, phq9_recommendations, tool_recommendations, analysis_source, language) on table public.assessments from authenticated;
grant select (id, created_date, updated_date, created_by_id, risk_level, risk_score, screening_type, analysis_source, language) on table public.assessments to authenticated;
grant insert (id, created_by_id, risk_level, risk_score, screening_type, analysis_source, language) on table public.assessments to authenticated;
grant update (language) on table public.assessments to authenticated;
-- Keep deletion governed by the existing row-level DELETE policy.
grant delete on table public.assessments to authenticated;
