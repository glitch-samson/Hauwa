create extension if not exists pgcrypto;

create type public.app_role as enum ('owner', 'worker');
create type public.order_status as enum (
  'Delivery accepted',
  'Delivery processing',
  'Shipped',
  'Delivered'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role public.app_role not null default 'worker',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text not null unique,
  color text not null default 'bg-[#e5edf2] text-[#537087]',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  customer_name text not null,
  customer_email text not null,
  delivery_location text not null,
  product text not null,
  amount numeric(14,2) not null check (amount >= 0),
  status public.order_status not null default 'Delivery accepted',
  assigned_worker_id uuid references public.team_members(id) on delete set null,
  tracking_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  label text not null,
  detail text not null,
  status public.order_status,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index orders_status_idx on public.orders(status);
create index orders_worker_idx on public.orders(assigned_worker_id);
create index orders_created_at_idx on public.orders(created_at desc);
create index order_events_order_idx on public.order_events(order_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger team_members_updated_at before update on public.team_members
for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1)),
    'worker'
  )
  on conflict (id) do update
  set email = excluded.email,
      name = excluded.name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.next_order_reference()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_number bigint;
begin
  select coalesce(max((regexp_replace(reference_code, '[^0-9]', '', 'g'))::bigint), 2840) + 1
  into next_number
  from public.orders
  where reference_code ~ '^ORD-[0-9]+$';
  return 'ORD-' || next_number;
end;
$$;

create or replace function public.create_order(
  p_customer_name text,
  p_customer_email text,
  p_delivery_location text,
  p_product text,
  p_amount numeric,
  p_assigned_worker_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_reference text;
begin
  if not public.is_owner() then
    raise exception 'Only owners can create orders';
  end if;

  if p_customer_name is null or btrim(p_customer_name) = ''
     or p_customer_email is null or btrim(p_customer_email) = ''
     or p_delivery_location is null or btrim(p_delivery_location) = ''
     or p_product is null or btrim(p_product) = '' then
    raise exception 'Customer, email, location, and product are required';
  end if;

  if p_amount < 0 then
    raise exception 'Amount cannot be negative';
  end if;

  v_reference := public.next_order_reference();
  insert into public.orders (
    reference_code,
    customer_name,
    customer_email,
    delivery_location,
    product,
    amount,
    status,
    assigned_worker_id
  )
  values (
    v_reference,
    btrim(p_customer_name),
    lower(btrim(p_customer_email)),
    btrim(p_delivery_location),
    btrim(p_product),
    p_amount,
    'Delivery accepted',
    p_assigned_worker_id
  )
  returning id into v_order_id;

  insert into public.order_events (order_id, label, detail, status, created_by)
  values (v_order_id, 'Order confirmed', 'Order confirmation update prepared', 'Delivery accepted', auth.uid());

  return v_order_id;
end;
$$;

create or replace function public.update_order_status(
  p_order_id text,
  p_status public.order_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_worker_id uuid;
  v_order_id uuid;
begin
  select o.id into v_order_id
  from public.orders o
  where o.reference_code = p_order_id
     or o.id::text = p_order_id;

  if v_order_id is null then
    raise exception 'Order not found';
  end if;

  select tm.id into v_worker_id
  from public.team_members tm
  where tm.user_id = auth.uid();

  if not public.is_owner() and not exists (
    select 1
    from public.orders o
    where o.id = v_order_id
      and o.assigned_worker_id = v_worker_id
  ) then
    raise exception 'You can only update orders assigned to you';
  end if;

  update public.orders
  set status = p_status,
      updated_at = timezone('utc', now())
  where id = v_order_id;

  insert into public.order_events (order_id, label, detail, status, created_by)
  values (
    v_order_id,
    p_status::text,
    'Customer tracking update prepared',
    p_status,
    auth.uid()
  );
end;
$$;

alter table public.profiles enable row level security;
alter table public.team_members enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;

create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_owner());

create policy "Owners can update profiles"
on public.profiles for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "Owners can manage team members"
on public.team_members for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "Users can read team members"
on public.team_members for select
to authenticated
using (
  public.is_owner()
  or user_id = auth.uid()
);

create policy "Owners can read all orders"
on public.orders for select
to authenticated
using (public.is_owner());

create policy "Workers can read assigned orders"
on public.orders for select
to authenticated
using (
  assigned_worker_id in (
    select tm.id from public.team_members tm
    where tm.user_id = auth.uid()
  )
);

create policy "Owners can update orders"
on public.orders for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "Workers can update assigned orders"
on public.orders for update
to authenticated
using (
  assigned_worker_id in (
    select tm.id from public.team_members tm
    where tm.user_id = auth.uid()
  )
)
with check (
  assigned_worker_id in (
    select tm.id from public.team_members tm
    where tm.user_id = auth.uid()
  )
);

create policy "Owners can read all order events"
on public.order_events for select
to authenticated
using (public.is_owner());

create policy "Workers can read assigned order events"
on public.order_events for select
to authenticated
using (
  order_id in (
    select o.id
    from public.orders o
    join public.team_members tm on tm.id = o.assigned_worker_id
    where tm.user_id = auth.uid()
  )
);

create or replace function public.get_public_tracking(p_tracking_token uuid)
returns table (
  reference_code text,
  product text,
  delivery_location text,
  status public.order_status,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.reference_code,
    o.product,
    o.delivery_location,
    o.status,
    o.updated_at
  from public.orders o
  where o.tracking_token = p_tracking_token
  limit 1;
$$;

grant execute on function public.get_public_tracking(uuid) to anon, authenticated;
revoke all on public.orders from anon;
grant usage on schema public to anon, authenticated;

grant select on public.orders to authenticated;
grant select, insert, update on public.team_members to authenticated;
grant select on public.order_events to authenticated;
grant insert on public.order_events to authenticated;
grant execute on function public.create_order(text, text, text, text, numeric, uuid) to authenticated;
grant execute on function public.update_order_status(text, public.order_status) to authenticated;
