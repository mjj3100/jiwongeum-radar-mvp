-- 0004_fix_grant_listings_unique.sql — 0003의 부분 인덱스를 일반 유니크 제약으로 교체
--
-- 0003에서 만든 "where external_id is not null" 부분 인덱스는 PostgREST의
-- upsert(onConflict)가 조건절 없는 일반 ON CONFLICT (source, external_id)로
-- 요청하기 때문에 충돌 대상으로 인식하지 못한다 ("there is no unique or
-- exclusion constraint matching the ON CONFLICT specification" 에러 원인).
--
-- Postgres는 UNIQUE 제약에서 NULL끼리는 원래 서로 다른 값으로 취급해 충돌하지
-- 않으므로, 애초에 부분 인덱스일 필요가 없었다. 일반 유니크 제약으로 교체한다.

drop index if exists grant_listings_source_external_id_key;

alter table grant_listings
  add constraint grant_listings_source_external_id_key unique (source, external_id);
