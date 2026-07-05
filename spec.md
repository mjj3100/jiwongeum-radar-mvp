# spec.md — 지원금 레이더 MVP

> SETUP.md의 고정 프레임(리틀리 결제 → 결제후가입 → 주문번호 claim_order 즉시승인 → AI 개인화 결과)을 그대로 쓰되, "사주" 도메인 자리에 "지원사업 매칭 + 4축 진단"을 넣은 구체 스펙. SETUP.md와 충돌 시 SETUP.md가 우선한다.

## 0. 배경 (근거 문서)

- `지원금 레이더 ppt.pptx` — 사업화 기획안. 최종 비전은 Free→Starter→Builder→Diagnostic/Deep→Season Pass 구독+단건 이중 매출 SaaS.
- `지원금_레이더_전자책.pdf` — 34페이지 워크북. "초기 구매자 혜택" = 최소 정보 입력 후 (a) 맞춤 지원사업 후보 3~5개 + (b) 1순위 공고 미니 4축(관련성/구체성/차별성/실현가능성) 예비진단. 공고 해석 7칸 틀, 위험문장 TOP10, D-day 체크리스트 등 도메인 로직의 원천 자료.
- `SETUP.md` — 기술 빌드 명세서(사주 예시). 결제·인증·승인 프레임은 고정.

## 1. MVP 범위 (확정)

**포함:**
1. 결제(리틀리, 전자책+진단리포트 결합 단일 상품) → 가입 → 주문번호 승인 → `/result`에서 맞춤 공고 3~5개 + 1순위 공고 미니 4축 진단
2. Starter 구독(월 9,900원, 무제한 맞춤공고 조회) — 매달 재구매로 만료일 연장하는 방식
3. 공고 데이터: K-Startup·기업마당 오픈 API 실시간 연동 (§5 조사 항목 참고, 실패 시 수동 큐레이션 시드로 폴백)
4. 위험 표현 가드레일(전자책 부록 규칙 그대로 강제)

**제외 (백로그):**
- Builder(신청준비방 7탭), Diagnostic/Deep 단건 결제, Season Pass
- D-day 플래너, 사업계획서 작성 보조 전체 기능(문장 위험도 검사 정도만 1차 포함 가능)
- "AI 멘토" — 사주 도메인의 멘토(교차세션 대화) 개념은 이 도메인에 직접 대응하는 기능이 없음. `/api/mentor`는 **이번 MVP에서 제외**한다. (Starter 대시보드의 "맞춤 공고 재조회"가 대응 기능이며 멘토처럼 대화형 채팅은 아님)

## 2. 사용자 동선

```
① 광고 → ② 리틀리 결제(전자책+진단리포트 결합 상품)
   ↓
③ 리틀리 결제완료 화면 + 카카오 알림톡: 주문번호 16자리
   ↓
④ 가입 링크 클릭 → /signup
   ↓
⑤ 회원가입 + 주문번호 입력 → claim_order(product='bundle') 즉시 승인
   ↓
⑥ /result 로 직행 → 사업 정보 입력(9개 항목) → /api/analyze 호출
   ↓
⑦ 결과: 맞춤 공고 3~5개(적합도·주의조건·준비우선순위) + 1순위 공고 미니4축 진단
   ↓
⑧ (선택) Starter 구독 CTA → 리틀리 구독 결제 → 새 주문번호 입력(/dashboard 진입) → claim_order(product='starter')가 entitlements.expires_at 연장
   ↓
⑨ /dashboard (Starter 구독자) → 무제한 맞춤 공고 조회(저장된 사업정보 기준 재매칭)
```

## 3. DB 스키마

### 3-1. profiles
```sql
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

-- 가입 트리거: auth.users insert 시 profiles pending 자동 생성
create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

### 3-2. orders (주문번호 원장, 1회용)
```sql
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
-- 일반 사용자는 orders에 직접 접근 불가 (claim_order RPC 경유만 허용)
revoke all on orders from anon, authenticated;
```

### 3-3. entitlements (상품별 이용권, 구독 만료일 지원)
```sql
create table entitlements (
  user_id uuid not null references profiles(id) on delete cascade,
  product text not null check (product in ('bundle', 'starter')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz, -- null = 무기한(bundle: 진단리포트 열람권), starter는 매달 연장
  primary key (user_id, product)
);

alter table entitlements enable row level security;
create policy "본인 이용권만 조회" on entitlements for select using (auth.uid() = user_id);
revoke insert, update, delete on entitlements from anon, authenticated;
```

### 3-4. business_profiles (사업 정보 입력값, 재사용)
```sql
create table business_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  founder_status text not null,   -- 예비창업자/개인사업자/법인사업자/소상공인
  region text not null,           -- 사업장 소재지 (시/도 + 시군구)
  industry text not null,
  founded_date date,              -- null 허용 (예비창업자)
  revenue_band text not null,     -- 없음/5천만미만/1억미만/3억미만 등
  employee_count text not null,   -- 1인/2~4명/5명이상
  item_description text not null, -- 사업 아이템 한 줄 설명
  support_needed text not null,   -- 사업화자금/개발비/광고비/장비/공간/정책자금
  readiness text not null,        -- 아이디어/MVP/매출발생/제출직전
  updated_at timestamptz not null default now()
);

alter table business_profiles enable row level security;
create policy "본인 사업정보만 CRUD" on business_profiles for all using (auth.uid() = user_id);
```

### 3-5. grant_listings (공고 캐시 — API 연동 + 수동 시드 공용)
```sql
create table grant_listings (
  id uuid primary key default gen_random_uuid(),
  source text not null,           -- 'kstartup' | 'bizinfo' | 'manual'
  external_id text,                -- 원본 API의 공고 ID (수동 등록은 null)
  title text not null,
  agency text,
  apply_start date,
  apply_end date,
  target_desc text,                -- 신청대상 원문
  exclude_desc text,                -- 제외대상 원문
  support_content text,
  support_scale text,
  region_scope text[],              -- 전국이면 null, 지역제한이면 배열
  industry_scope text[],
  founder_stage_scope text[],       -- 예비/초기/소상공인 등
  original_url text,
  raw jsonb,                        -- API 원본 응답 보관
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index on grant_listings (apply_end);
create index on grant_listings using gin (region_scope);
-- 공개 데이터이므로 RLS 없이 anon 조회만 허용, 쓰기는 service_role 전용
alter table grant_listings enable row level security;
create policy "공고는 누구나 조회 가능" on grant_listings for select using (true);
revoke insert, update, delete on grant_listings from anon, authenticated;
```

### 3-6. match_results / diagnosis_reports
```sql
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
  total_score int generated always as (relevance_score + concreteness_score + differentiation_score + feasibility_score) stored,
  risk_sentences jsonb,             -- [{quote, reason, suggestion}]
  summary text not null,
  created_at timestamptz not null default now()
);

alter table match_results enable row level security;
alter table diagnosis_reports enable row level security;
create policy "본인 매칭결과만 조회" on match_results for select using (auth.uid() = user_id);
create policy "본인 진단리포트만 조회" on diagnosis_reports for select using (auth.uid() = user_id);
revoke insert, update, delete on match_results, diagnosis_reports from anon, authenticated;
```

### 3-7. claim_order RPC v2 (구독 연장 지원)
```sql
create or replace function claim_order(
  p_order_no text,
  p_signup_email text,
  p_payment_email text default null
) returns text
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_product text;
  v_order_id uuid;
  v_current_expiry timestamptz;
begin
  if p_order_no is null or trim(p_order_no) = '' then
    return 'no_order';
  end if;

  select id into v_user_id from profiles where email = p_signup_email;
  if v_user_id is null then
    return 'no_account';
  end if;

  -- orders에 주문번호가 등록되어 있는지 확인 (사전에 리틀리 결제 알림/수동 등록으로 채워둠)
  select id, product into v_order_id, v_product
    from orders where order_no = trim(p_order_no) and claimed_by is null;

  if v_order_id is null then
    -- 이미 클레임됐거나 애초에 존재하지 않는 주문번호
    if exists (select 1 from orders where order_no = trim(p_order_no) and claimed_by is not null) then
      return 'order_used';
    end if;
    return 'no_order';
  end if;

  update orders set claimed_by = v_user_id, claimed_at = now() where id = v_order_id;

  if v_product = 'bundle' then
    insert into entitlements (user_id, product, expires_at)
      values (v_user_id, 'bundle', null)
      on conflict (user_id, product) do nothing;
    update profiles set status = 'active' where id = v_user_id;
  elsif v_product = 'starter' then
    select expires_at into v_current_expiry from entitlements
      where user_id = v_user_id and product = 'starter';
    insert into entitlements (user_id, product, expires_at)
      values (v_user_id, 'starter', greatest(now(), coalesce(v_current_expiry, now())) + interval '30 days')
      on conflict (user_id, product) do update
        set expires_at = greatest(now(), coalesce(entitlements.expires_at, now())) + interval '30 days';
    update profiles set status = 'active' where id = v_user_id;
  end if;

  return 'approved';
end;
$$;

revoke all on function claim_order(text, text, text) from public, anon, authenticated;
grant execute on function claim_order(text, text, text) to service_role;
```

> **SETUP.md와의 차이**: 원 SETUP.md는 `orders`가 결제 시점에 리틀리 쪽에서 자동으로 채워지는 걸 가정하지 않고, 고객이 입력한 주문번호를 그 자리에서 `insert`해 UNIQUE 위반으로 중복을 막는 방식이었다. 이 프로젝트는 상품이 2종(bundle/starter)이고 재구매(구독 연장)가 있어, **주문번호는 결제 후 리틀리 알림을 보고 운영자가 `orders`에 미리 등록**(`product` 태그 포함)해두고, `claim_order`는 "존재하는 미클레임 주문번호에 claimed_by를 채우는" 방식으로 바꾼다. 이렇게 해야 같은 주문번호 재사용(1회용)과 상품 종류 구분이 동시에 보장된다. 운영자의 주문번호 등록 작업(수동 또는 리틀리 알림 이메일 파싱 자동화)은 백로그로 남기고, MVP는 **Supabase 대시보드에서 수동 insert**로 시작한다.

## 4. 페이지/엔드포인트

| 경로 | 역할 | 접근 |
|------|------|------|
| `/` | 랜딩 (핵심 카피 + 리틀리 CTA) | 공개 |
| `/signup` | 결제 후 가입 + 주문번호 입력 → claim_order | 공개 |
| `/login` | 로그인 | 공개 |
| `/result` | 사업정보 입력 → 맞춤공고 3~5개 + 미니4축 진단 | bundle entitlement 필요 |
| `/dashboard` | 무제한 맞춤공고 재조회 | starter entitlement(미만료) 필요 |
| `/api/analyze` | 매칭+진단 생성 (규칙기반 필터 + Claude) | 서버, 인증 필요 |
| `/api/grants/sync` | K-Startup/기업마당 API → grant_listings 동기화 | 서버 전용 cron/관리자 |

`/api/mentor`는 이 도메인에 대응 기능이 없어 **제외**.

### 보안 게이트
- `/result`, `/dashboard`, `/api/analyze` 무인증 401 / 미승인 리다이렉트
- `/api/analyze`는 `business_profiles` 소유자 본인만 호출 가능 (RLS + 서버 세션 검증)
- 위험 표현 가드레일: `/api/analyze` 프롬프트에 "합격 보장/선정확률/보장" 등 출력 금지 문구를 시스템 프롬프트로 하드코딩, 응답 후 정규식으로 2차 검증

## 5. 공고 데이터 소스 (사람이 확인해야 할 항목)

- **K-Startup**: data.go.kr 공공데이터포털에서 "K-Startup" 또는 "창업지원사업 공고정보" API를 검색해 활용신청 필요. 인증키 발급에 1~2일 소요될 수 있음.
- **기업마당(비즈인포)**: bizinfo.go.kr 오픈API 또는 공공데이터포털 "기업마당" 데이터셋. 마찬가지로 활용신청 필요.
- **MVP 시작 전략**: API 키 발급 대기 중에도 개발 진행 가능하도록, 전자책에 수록된 실제 공고 4건(혁신 소상공인 AI활용지원, 서울 유니콘 챌린지, 서울 AI허브 인프라, 소상공인 정책자금)을 `grant_listings`에 `source='manual'`로 시드 삽입하고 매칭 로직을 먼저 검증한다. API 연동은 키 발급 완료 후 `/api/grants/sync`로 전환.

## 6. /api/analyze 로직

1. **규칙 기반 1차 필터**: `business_profiles`와 `grant_listings.region_scope/industry_scope/founder_stage_scope`를 비교해 명백히 부적합한 공고 제외 (지역 불일치, 업력 요건 초과 등)
2. **Claude 프롬프트 2차 판정**: 남은 후보 중 적합도 순 3~5개 선정, 각각 판정(추천/조건부/확인필요/비추천) + 이유 + 주의조건 + 준비우선순위 생성. 전자책 페르소나 사례(이민재/김서연/박준호)의 판정 로직을 few-shot으로 프롬프트에 포함.
3. **1순위 공고 미니 4축 진단**: 관련성/구체성/차별성/실현가능성 각 0~25점, 위험문장 감지(전자책 TOP10 패턴 참고), 개선 방향 제시.
4. **가드레일**: 시스템 프롬프트에 "'합격 보장', '선정 확률', '자동 제출' 표현 금지. '적합도', '준비도', '확인 필요'만 사용" 명시. 응답 후 금지어 정규식 스캔, 위반 시 재생성 1회 후 안전 문구로 대체.

## 7. 환경변수

SETUP.md §5와 동일 + 추가:
```
KSTARTUP_API_KEY=...       # 발급 후 추가 (미발급 시 시드 데이터로 폴백)
BIZINFO_API_KEY=...        # 발급 후 추가
```

## 8. 빌드 순서 (SETUP.md §6 준용, 도메인 반영)

1. [사람] Supabase 프로젝트 + Anthropic 키 발급, `.env.local` 작성
2. [Claude Code] Next.js+Tailwind 골격, 랜딩, /signup, /login
3. [Claude Code] business_profiles 입력 폼 + grant_listings 시드 데이터(전자책 공고 4건)
4. [Claude Code] /api/analyze (규칙필터+Claude 프롬프트+가드레일) + /result 렌더. 진단 정확도는 전자책 샘플(이민재 케이스: 관련성22/구체성16/차별성17/실현가능성18=73점)과 대조해 검증
5. [Claude Code] 스키마 0001(profiles/orders/entitlements/business_profiles/grant_listings/match_results/diagnosis_reports) → [사람] 실행
6. [Claude Code] 스키마 0002(claim_order v2) → [사람] 실행
7. [Claude Code] /signup 주문번호 연결 + 형식검증
8. [Claude Code] /dashboard(Starter) + entitlement 만료 체크
9. [사람] K-Startup/기업마당 API 키 신청 (병행 가능) → 발급되면 /api/grants/sync 연동 전환
10. [사람] 리틀리 상품 2종(bundle/starter) 등록
11. [Claude Code] 보안 리뷰 → [사람+Claude Code] 배포
12. [사람] 실결제 1건 end-to-end 테스트

## 9. 리스크/한계 (인지하고 진행)

- Starter 구독의 "매달 재구매+주문번호 재입력" 방식은 일반 SaaS 구독 UX보다 이탈이 클 수 있음. 리틀리가 정기결제를 지원하지 않는 한 구조적 한계. 출시 후 이탈률 보고 리틀리 정기결제 기능 재검토.
- `orders` 사전 등록을 운영자가 수동으로 해야 하는 부분은 초기 주문량이 적을 때만 지속 가능. 볼륨 늘면 리틀리 알림 이메일 파싱 자동화 필요(백로그).
