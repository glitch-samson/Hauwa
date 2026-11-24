create or replace function public.sync_worker_team_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'worker' then
    delete from public.team_members
    where lower(email) = lower(new.email)
      and user_id is distinct from new.id;

    insert into public.team_members (user_id, name, email, color)
    values (
      new.id,
      new.name,
      lower(new.email),
      'bg-[#e5edf2] text-[#537087]'
    )
    on conflict (user_id) do update
    set name = excluded.name,
        email = excluded.email,
        updated_at = timezone('utc', now());
  else
    delete from public.team_members
    where user_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_worker_team_member_on_profile on public.profiles;
create trigger sync_worker_team_member_on_profile
after insert or update of role, name, email on public.profiles
for each row execute function public.sync_worker_team_member();

delete from public.team_members tm
where not exists (
  select 1
  from public.profiles p
  where p.role = 'worker'
    and p.id = tm.user_id
    and lower(p.email) = lower(tm.email)
);

insert into public.team_members (user_id, name, email, color)
select id, name, lower(email), 'bg-[#e5edf2] text-[#537087]'
from public.profiles
where role = 'worker'
on conflict (email) do update
set user_id = excluded.user_id,
    name = excluded.name,
    email = excluded.email,
    updated_at = timezone('utc', now());

delete from public.team_members tm
where not exists (
  select 1
  from public.profiles p
  where p.id = tm.user_id
    and p.role = 'worker'
);
