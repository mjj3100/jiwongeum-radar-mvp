<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Coding Rules for 문정주's SaaS Project

## ✅ AUTO-APPROVE (동의 없이 진행)
- 보일러플레이트 코드 생성 (imports, exports, type definitions)
- 반복적인 구조 작업 (폴더 생성, 파일 이름 정렬)
- 자동 포매팅 (prettier, eslint 적용)
- 테스트 코드 추가/수정
- 주석 및 문서화
- node_modules, dist, build 폴더 생성
- .gitignore, .env.example 같은 기본 설정 파일

## ⚠️ ASK FOR APPROVAL (매번 확인 받기)
- 핵심 로직 수정 (src/core, src/api, 비즈니스 로직)
- 데이터베이스 스키마 변경
- API 엔드포인트 추가/수정
- 인증/보안 관련 코드
- .env, config 파일 수정
- package.json 의존성 추가
- 기존 함수 삭제 또는 인터페이스 변경

## 🎯 General Rule
- 한 번에 여러 파일 변경할 때는 명확하게 설명하고 진행
- 의심스러우면 물어보기 (확인받는 게 낫다)
- Git diff는 항상 확인 가능하게 유지
