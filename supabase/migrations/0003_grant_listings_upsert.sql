-- 0003_grant_listings_upsert.sql — K-Startup/기업마당 API 동기화를 위한 유니크 제약
--
-- source+external_id 조합으로 upsert(on conflict)할 수 있게 한다.
-- 수동 시드 데이터(source='manual')는 external_id가 null이라 이 제약과 무관하다
-- (Postgres는 UNIQUE 제약에서 NULL끼리는 서로 다른 값으로 취급해 충돌하지 않는다).

create unique index grant_listings_source_external_id_key
  on grant_listings (source, external_id)
  where external_id is not null;
