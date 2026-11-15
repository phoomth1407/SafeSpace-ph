alter table public.community_posts disable trigger community_posts_protect_fields;
update public.community_posts p
set author_role = case when u.role in ('admin', 'tester') then u.role else 'user' end
from public.users u
where p.created_by_id = u.id::text;
alter table public.community_posts enable trigger community_posts_protect_fields;

alter table public.community_comments disable trigger community_comments_protect_fields;
update public.community_comments c
set author_role = case when u.role in ('admin', 'tester') then u.role else 'user' end
from public.users u
where c.created_by_id = u.id::text;
alter table public.community_comments enable trigger community_comments_protect_fields;
