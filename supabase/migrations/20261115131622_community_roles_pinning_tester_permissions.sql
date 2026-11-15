-- Trusted staff identities and scoped tester permissions.
alter table public.users
  add column if not exists admin_permissions jsonb not null default '{}'::jsonb;

alter table public.community_posts
  add column if not exists author_role text not null default 'user',
  add column if not exists is_pinned boolean not null default false,
  add column if not exists pinned_at timestamptz;

alter table public.community_comments
  add column if not exists author_role text not null default 'user',
  add column if not exists is_pinned boolean not null default false,
  add column if not exists pinned_at timestamptz;

alter table public.community_posts
  drop constraint if exists community_posts_author_role_check;
alter table public.community_posts
  add constraint community_posts_author_role_check
  check (author_role in ('user', 'tester', 'admin'));

alter table public.community_comments
  drop constraint if exists community_comments_author_role_check;
alter table public.community_comments
  add constraint community_comments_author_role_check
  check (author_role in ('user', 'tester', 'admin'));

create index if not exists community_posts_pinned_feed_idx
  on public.community_posts (is_pinned desc, pinned_at desc, created_date desc)
  where is_announcement = false;

create unique index if not exists community_comments_one_pin_per_post_idx
  on public.community_comments (post_id)
  where is_pinned = true;

create or replace function private.has_admin_permission(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin()
    or (
      auth.uid() is not null
      and p_permission in ('view_assessments', 'delete_assessments', 'delete_comments', 'ban_users', 'post_announcements')
      and exists (
        select 1
        from public.users as u
        where u.id = auth.uid()
          and u.role = 'tester'
          and u.admin_permissions @> pg_catalog.jsonb_build_object(p_permission, true)
      )
    );
$$;

revoke all on function private.has_admin_permission(text) from public, anon;
grant execute on function private.has_admin_permission(text) to authenticated;

create or replace function public.admin_list_tester_access()
returns table(
  user_id uuid,
  email text,
  full_name text,
  view_assessments boolean,
  delete_assessments boolean,
  delete_comments boolean,
  ban_users boolean,
  post_announcements boolean
)
language sql
security definer
set search_path = ''
as $$
  select
    u.id,
    u.email,
    u.full_name,
    coalesce((u.admin_permissions ->> 'view_assessments')::boolean, false),
    coalesce((u.admin_permissions ->> 'delete_assessments')::boolean, false),
    coalesce((u.admin_permissions ->> 'delete_comments')::boolean, false),
    coalesce((u.admin_permissions ->> 'ban_users')::boolean, false),
    coalesce((u.admin_permissions ->> 'post_announcements')::boolean, false)
  from public.users as u
  where private.is_admin()
    and u.role = 'tester'
  order by u.created_date desc;
$$;

revoke all on function public.admin_list_tester_access() from public, anon;
grant execute on function public.admin_list_tester_access() to authenticated;

create or replace function public.admin_set_tester_access(
  p_user_id uuid,
  p_enabled boolean,
  p_view_assessments boolean default false,
  p_delete_assessments boolean default false,
  p_delete_comments boolean default false,
  p_ban_users boolean default false,
  p_post_announcements boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception using errcode = '42501', message = 'admin required';
  end if;
  if p_user_id is null or p_user_id = auth.uid() then
    raise exception using errcode = '22023', message = 'Choose another account.';
  end if;
  if exists (select 1 from public.users where id = p_user_id and role = 'admin') then
    raise exception using errcode = '42501', message = 'Admin accounts cannot be changed here.';
  end if;

  update public.users
  set role = case when p_enabled then 'tester' else 'user' end,
      admin_permissions = case when p_enabled then pg_catalog.jsonb_build_object(
        'view_assessments', p_view_assessments or p_delete_assessments,
        'delete_assessments', p_delete_assessments,
        'delete_comments', p_delete_comments,
        'ban_users', p_ban_users,
        'post_announcements', p_post_announcements
      ) else '{}'::jsonb end,
      updated_date = pg_catalog.now()
  where id = p_user_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'Account not found.';
  end if;
end;
$$;

revoke all on function public.admin_set_tester_access(uuid, boolean, boolean, boolean, boolean, boolean, boolean) from public, anon;
grant execute on function public.admin_set_tester_access(uuid, boolean, boolean, boolean, boolean, boolean, boolean) to authenticated;

create or replace function public.admin_set_user_ban(
  p_user_id uuid,
  p_banned boolean,
  p_banned_until timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_admin_permission('ban_users') then
    raise exception using errcode = '42501', message = 'ban permission required';
  end if;
  if p_user_id is null or p_user_id = auth.uid() then
    raise exception using errcode = '22023', message = 'Cannot ban the current account.';
  end if;
  if exists (select 1 from public.users where id = p_user_id and role = 'admin') then
    raise exception using errcode = '42501', message = 'Admin accounts cannot be banned.';
  end if;

  update public.users
  set banned = coalesce(p_banned, false),
      banned_until = case when p_banned then p_banned_until else null end,
      updated_date = pg_catalog.now()
  where id = p_user_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'Account not found.';
  end if;
end;
$$;

revoke all on function public.admin_set_user_ban(uuid, boolean, timestamptz) from public, anon;
grant execute on function public.admin_set_user_ban(uuid, boolean, timestamptz) to authenticated;

create or replace function private.stamp_community_author_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;

  select u.role into v_role from public.users as u where u.id = v_user_id;
  if v_role is null then
    raise exception using errcode = '42501', message = 'registered account required';
  end if;

  new.created_by_id := v_user_id::text;
  new.author_role := case when v_role in ('admin', 'tester') then v_role else 'user' end;
  return new;
end;
$$;

revoke all on function private.stamp_community_author_role() from public, anon;

drop trigger if exists community_posts_stamp_author_role on public.community_posts;
create trigger community_posts_stamp_author_role
before insert on public.community_posts
for each row execute function private.stamp_community_author_role();

drop trigger if exists community_comments_stamp_author_role on public.community_comments;
create trigger community_comments_stamp_author_role
before insert on public.community_comments
for each row execute function private.stamp_community_author_role();

create or replace function private.protect_community_post_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by_id is distinct from old.created_by_id
    or new.author_role is distinct from old.author_role then
    raise exception using errcode = '42501', message = 'Post author fields cannot be changed.';
  end if;
  if new.is_announcement is distinct from old.is_announcement and not private.is_admin() then
    raise exception using errcode = '42501', message = 'Only an admin can change announcement status.';
  end if;
  if new.is_pinned is distinct from old.is_pinned and not private.is_admin() then
    raise exception using errcode = '42501', message = 'Only an admin can pin community posts.';
  end if;
  return new;
end;
$$;

revoke all on function private.protect_community_post_fields() from public, anon;

drop trigger if exists community_posts_protect_fields on public.community_posts;
create trigger community_posts_protect_fields
before update on public.community_posts
for each row execute function private.protect_community_post_fields();

create or replace function private.protect_community_comment_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_post_author text;
begin
  if new.created_by_id is distinct from old.created_by_id
    or new.author_role is distinct from old.author_role
    or new.post_id is distinct from old.post_id then
    raise exception using errcode = '42501', message = 'Comment author and post fields cannot be changed.';
  end if;
  if new.is_pinned is distinct from old.is_pinned then
    select p.created_by_id into v_post_author
    from public.community_posts as p
    where p.id = old.post_id;
    if v_post_author is distinct from auth.uid()::text and not private.is_admin() then
      raise exception using errcode = '42501', message = 'Only the post creator can pin a comment.';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.protect_community_comment_fields() from public, anon;

drop trigger if exists community_comments_protect_fields on public.community_comments;
create trigger community_comments_protect_fields
before update on public.community_comments
for each row execute function private.protect_community_comment_fields();

create or replace function public.admin_set_community_post_pin(p_post_id text, p_pinned boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception using errcode = '42501', message = 'admin required';
  end if;
  update public.community_posts
  set is_pinned = coalesce(p_pinned, false),
      pinned_at = case when coalesce(p_pinned, false) then pg_catalog.now() else null end,
      updated_date = pg_catalog.now()
  where id = p_post_id and is_announcement = false;
  if not found then
    raise exception using errcode = 'P0002', message = 'Community post not found.';
  end if;
end;
$$;

revoke all on function public.admin_set_community_post_pin(text, boolean) from public, anon;
grant execute on function public.admin_set_community_post_pin(text, boolean) to authenticated;

create or replace function public.set_community_comment_pin(p_comment_id text, p_pinned boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_post_id text;
  v_post_author text;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;

  select c.post_id into v_post_id
  from public.community_comments as c
  where c.id = p_comment_id;
  if v_post_id is null then
    raise exception using errcode = 'P0002', message = 'Comment not found.';
  end if;

  select p.created_by_id into v_post_author
  from public.community_posts as p
  where p.id = v_post_id
  for update;
  if v_post_author is distinct from auth.uid()::text and not private.is_admin() then
    raise exception using errcode = '42501', message = 'Only the post creator can pin a comment.';
  end if;

  if coalesce(p_pinned, false) then
    update public.community_comments
    set is_pinned = false, pinned_at = null
    where post_id = v_post_id and is_pinned = true and id <> p_comment_id;
  end if;

  update public.community_comments
  set is_pinned = coalesce(p_pinned, false),
      pinned_at = case when coalesce(p_pinned, false) then pg_catalog.now() else null end,
      updated_date = pg_catalog.now()
  where id = p_comment_id;
end;
$$;

revoke all on function public.set_community_comment_pin(text, boolean) from public, anon;
grant execute on function public.set_community_comment_pin(text, boolean) to authenticated;

drop policy if exists community_comments_delete on public.community_comments;
create policy community_comments_delete on public.community_comments
for delete to authenticated
using (
  created_by_id = (select auth.uid())::text
  or private.is_admin()
  or private.has_admin_permission('delete_comments')
);

drop policy if exists assessments_read on public.assessments;
create policy assessments_read on public.assessments
for select to authenticated
using (
  created_by_id = (select auth.uid())::text
  or ((private.is_admin() or private.has_admin_permission('view_assessments')) and share_with_admin = true)
);

drop policy if exists assessments_delete on public.assessments;
create policy assessments_delete on public.assessments
for delete to authenticated
using (
  created_by_id = (select auth.uid())::text
  or private.is_admin()
  or (private.has_admin_permission('delete_assessments') and share_with_admin = true)
);

create or replace function public.admin_list_shared_assessments_with_segments()
returns table(
  id text,
  created_date timestamptz,
  created_by_id text,
  risk_level text,
  risk_score numeric,
  screening_type text,
  analysis_source text,
  language text,
  age_13_19 boolean,
  age_19_plus boolean,
  is_foreigner boolean
)
language sql
security definer
set search_path = ''
as $$
  select
    a.id,
    a.created_date,
    a.created_by_id,
    a.risk_level,
    a.risk_score,
    a.screening_type,
    a.analysis_source,
    a.language,
    coalesce(a.age between 13 and 19, false),
    coalesce(a.age >= 19, false),
    coalesce(a.nationality = 'foreigner', false)
  from public.assessments as a
  where (private.is_admin() or private.has_admin_permission('view_assessments'))
    and a.share_with_admin = true
    and exists (
      select 1
      from public.assessment_sharing_preferences as p
      where p.user_id::text = a.created_by_id
        and p.share_risk_score = true
    )
  order by a.created_date desc
  limit 200;
$$;

create or replace function public.create_community_announcement(p_content text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_post public.community_posts%rowtype;
begin
  if v_user is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;
  if not private.has_admin_permission('post_announcements') then
    raise exception using errcode = '42501', message = 'announcement permission required';
  end if;
  if p_content is null or pg_catalog.length(pg_catalog.btrim(p_content)) < 5 then
    raise exception using errcode = '22023', message = 'Content must be at least 5 characters.';
  end if;
  if pg_catalog.length(p_content) > 10000 then
    raise exception using errcode = '22023', message = 'Content is too long.';
  end if;

  insert into public.community_posts (
    id, created_by_id, author_name, content, category, ai_response,
    ai_risk_flag, ai_enabled, is_announcement, hearts, bumps, hearted_by, bumped_by
  ) values (
    pg_catalog.gen_random_uuid()::text,
    v_user::text,
    case when private.is_admin() then 'Admin' else 'Tester' end,
    pg_catalog.btrim(p_content),
    'other',
    '',
    'safe',
    false,
    true,
    0,
    0,
    '[]'::jsonb,
    '[]'::jsonb
  )
  returning * into v_post;

  return pg_catalog.jsonb_build_object('allowed', true, 'post', pg_catalog.to_jsonb(v_post));
end;
$$;

revoke all on function public.create_community_announcement(text) from public, anon;
grant execute on function public.create_community_announcement(text) to authenticated;
