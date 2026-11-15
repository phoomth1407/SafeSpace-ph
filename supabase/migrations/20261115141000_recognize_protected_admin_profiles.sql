create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, auth, private
as $function$
  select auth.uid() is not null
     and (
       exists (
         select 1
         from auth.users u
         where u.id = auth.uid()
           and lower(coalesce(u.email, '')) = 'phoomth1407@gmail.com'
       )
       or exists (
         select 1
         from public.users profile
         where profile.id = auth.uid()
           and profile.role = 'admin'
       )
     );
$function$;
