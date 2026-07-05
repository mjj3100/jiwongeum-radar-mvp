-- 0001_init.sql — 지원금 레이더 MVP 핵심 스키마
-- Supabase SQL Editor에서 실행. "Run and enable RLS" 옵션으로 실행할 것.

-- ── profiles ──────────────────────────────────────────────
create type user_status as enum ('pending', 'active');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  status user_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "본인 프로필만 조회" on profiles for select using (auth.uid() = id);
create policy "본인 프로필만 수정" on profiles for update using (auth.uid() = id);

create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── orders (주문번호 원장) ────────────────────────────────
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  payment_email text,
  product text not null check (product in ('bundle', 'starter')),
  amount int,
  claimed_by uuid references profiles(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;
revoke all on orders from anon, authenticated;

-- ── entitlements (상품별 이용권) ──────────────────────────
create table entitlements (
  user_id uuid not null references profiles(id) on delete cascade,
  product text not null check (product in ('bundle', 'starter')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (user_id, product)
);

alter table entitlements enable row level security;
create policy "본인 이용권만 조회" on entitlements for select using (auth.uid() = user_id);
revoke insert, update, delete on entitlements from anon, authenticated;

-- ── business_profiles (사업 정보 입력값) ─────────────────
create table business_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  founder_status text not null,
  region text not null,
  industry text not null,
  founded_date date,
  revenue_band text not null,
  employee_count text not null,
  item_description text not null,
  support_needed text not null,
  readiness text not null,
  updated_at timestamptz not null default now()
);

alter table business_profiles enable row level security;
create policy "본인 사업정보만 CRUD" on business_profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── grant_listings (공고 캐시) ────────────────────────────
create table grant_listings (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text,
  title text not null,
  agency text,
  apply_start date,
  apply_end date,
  target_desc text,
  exclude_desc text,
  support_content text,
  support_scale text,
  region_scope text[],
  industry_scope text[],
  founder_stage_scope text[],
  original_url text,
  raw jsonb,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index grant_listings_apply_end_idx on grant_listings (apply_end);
create index grant_listings_region_scope_idx on grant_listings using gin (region_scope);

alter table grant_listings enable row level security;
create policy "공고는 누구나 조회 가능" on grant_listings for select using (true);
revoke insert, update, delete on grant_listings from anon, authenticated;

-- ── match_results / diagnosis_reports ─────────────────────
create table match_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  grant_listing_id uuid not null references grant_listings(id),
  verdict text not null check (verdict in ('추천', '조건부', '확인 필요', '비추천')),
  fit_reason text not null,
  caution_note text,
  prep_priority int,
  created_at timestamptz not null default now()
);

create table diagnosis_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  grant_listing_id uuid references grant_listings(id),
  relevance_score int not null check (relevance_score between 0 and 25),
  concreteness_score int not null check (concreteness_score between 0 and 25),
  differentiation_score int not null check (differentiation_score between 0 and 25),
  feasibility_score int not null check (feasibility_score between 0 and 25),
  total_score int generated always as
    (relevance_score + concreteness_score + differentiation_score + feasibility_score) stored,
  risk_sentences jsonb,
  summary text not null,
  created_at timestamptz not null default now()
);

alter table match_results enable row level security;
alter table diagnosis_reports enable row level security;
create policy "본인 매칭결과만 조회" on match_results for select using (auth.uid() = user_id);
create policy "본인 진단리포트만 조회" on diagnosis_reports for select using (auth.uid() = user_id);
revoke insert, update, delete on match_results, diagnosis_reports from anon, authenticated;
