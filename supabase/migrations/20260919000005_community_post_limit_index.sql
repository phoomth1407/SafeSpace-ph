create index if not exists community_posts_created_by_id_created_date_idx
  on public.community_posts (created_by_id, created_date desc);
