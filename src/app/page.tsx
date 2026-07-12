import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteFooter } from '@/components/SiteFooter'
import { PurchaseConsentGate } from '@/components/PurchaseConsentGate'
import { MobileStickyCta } from '@/components/MobileStickyCta'
import { signOut } from '@/lib/auth-actions'
import { LITTLY_URL_SCAN, PRICING } from '@/lib/constants'
import './landing.css'

const NOTICE_LINES = [
  { label: '신청자격', mark: '중소기업창업 지원법 제2조에 따른', rest: ' 예비창업자로서 공고일 기준 사업자등록 이력이 없는 자...' },
  { label: '제출서류', mark: '해당 시 가점 증빙', rest: ' 외 각 1부...' },
  { label: '평가기준', mark: null, rest: '문제인식, 실현가능성, 성장전략, 팀 역량...' },
]

const QUOTES = [
  '"자격 요건... 이거 내가 되는 건가?"',
  '"필요 서류가 어디까지인지 모르겠다"',
  '"평가위원은 대체 뭘 보고 점수를 주지?"',
]

const RESULT_ROWS = [
  { title: '신청 가능 / 주의 조건 표시', desc: '공고 원문 근거 문장과 함께 확인' },
  { title: '필요 서류 체크리스트', desc: '제출 전에 빠진 항목을 먼저 확인' },
  { title: '평가 4축 예비점수', desc: '관련성·구체성·차별성·실현가능성 이유 제공' },
]

const BA_ROWS = [
  { item: '공고 탐색', before: '사이트 5곳을 돌며 공고 수십 개 저장', after: '내 조건으로 좁힌 후보 3~5개만' },
  { item: '자격 판단', before: '27쪽 공고문을 읽고도 "되는지" 확신 없음', after: '신청 가능 / 주의 조건, 원문 근거와 함께 표시' },
  { item: '서류 준비', before: '뭘 빠뜨렸는지 제출하고 나서야 알게 됨', after: '공고별 필요 서류를 체크리스트로' },
  { item: '제출 판단', before: '감·운·지인 조언', after: '평가 4축 예비점수 + 축별 이유' },
  { item: '걸리는 시간', before: '저녁마다 공고 읽기, 그래도 결론 없음', after: '입력 3분 → 리포트 24시간 안에' },
]

const FAQS = [
  { q: '지원금 선정이나 결과를 보장하나요?', a: '아닙니다. 지원금 레이더는 선정 결과를 약속하는 서비스가 아니라, 내 조건에 맞는 공고를 좁히고 제출 전 준비 상태를 점검하는 신청 준비 도구입니다.' },
  { q: '공고를 많이 보여주는 서비스인가요?', a: '많이 보여주는 것보다 지금 볼 만한 공고 3~5개로 좁히는 데 집중합니다. 신청 대상, 제외 조건, 준비 난이도, 마감 대응성을 함께 봅니다.' },
  { q: '왜 3~5개만 보여주나요?', a: '지원사업 신청은 공고 수보다 판단 품질이 중요하기 때문입니다. 신청할 수 없거나 준비가 어려운 공고까지 많이 보면 오히려 실행이 늦어집니다.' },
  { q: '사업계획서를 대신 써주나요?', a: "아니요, 대신 쓰지 않습니다. 지원금 레이더는 '쓰기 전과 내기 전' — 공고 후보 선정과 제출 전 진단에 집중합니다. 평가위원이 보는 기준을 알고 쓰는 것과 모르고 쓰는 것의 차이를 만드는 게 저희 역할입니다." },
  { q: '결제하면 리포트는 언제 받나요?', a: '정보 입력 완료 후 24시간 안에 도착합니다. 마감이 임박한 공고라면 결제 후 바로 정보를 입력해 주세요.' },
  { q: '환불이 되나요?', a: '리포트 발급 전에는 전액 환불됩니다. 발급 후에는 맞춤 제작 콘텐츠 특성상 환불이 어려운 점 양해 부탁드립니다.' },
  { q: '사업계획서가 이미 있는데, 문장 단위로 점검받을 수 있나요?', a: '사업계획서 기반 정밀진단(LOCK-ON)을 준비하고 있습니다. 출시되면 이 페이지에서 안내드릴게요. 지금의 예비진단(SCAN, 9,900원)으로도 어느 공고에, 어떤 축을 보강해서 내야 하는지는 먼저 확인하실 수 있습니다.' },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
    <div className="ld-page">
      <header className="topbar">
        <div className="wrap nav">
          <a className="brand" href="#top" aria-label="지원금 레이더 홈">
            <span className="brand-dot" aria-hidden="true" />
            <span>지원금 레이더</span>
          </a>
          <nav className="nav-links" aria-label="주요 메뉴">
            <a className="nav-link" href="#sample">샘플 리포트</a>
            <a className="nav-link" href="#process">진행 방식</a>
            <a className="nav-link" href="#pricing">가격</a>
            {user ? (
              <>
                <Link className="nav-link" href="/result">내 결과</Link>
                <form action={signOut}>
                  <button type="submit" className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <Link className="nav-link" href="/login">로그인</Link>
            )}
            <a className="btn" href={LITTLY_URL_SCAN}>3분 진단 시작</a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* 히어로 */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <h1>
                <span className="hero-soft">공고 찾는 것도 일인데,</span>
                <span className="hero-soft">막상 내려니</span>
                <span className="hero-strong">&quot;이게, 될까?&quot;</span>
              </h1>
              <p className="hero-copy">
                그 혼잣말에 답하려고 만들었습니다.<br />
                후보는 3~5개로 좁히고,<br className="mobile-break" /> &apos;되는지&apos;는 공개 평가 기준표로 판정합니다 — 3분.
              </p>
              <div className="hero-actions">
                <a className="btn" href={LITTLY_URL_SCAN}>3분 정보 입력하고 진단 받기</a>
              </div>
              <p className="cta-note">아이디어 단계 예비진단 리포트 · 9,900원 · 24시간 안에 도착</p>
            </div>

            <div className="report-card" role="group" aria-label="지원금 레이더 리포트 예시">
              <div className="report-head">
                <span>아이디어 단계 예비진단</span>
                <span>추천 · 주의 조건 · 제외</span>
              </div>
              <div className="report-body">
                <div className="mini-card">
                  <div className="mini-top">
                    <span className="badge good">추천</span>
                    <span className="badge blue">D-11</span>
                  </div>
                  <h2 className="mini-title">예비창업패키지 (일반분야)</h2>
                  <p className="mini-desc">
                    예비창업자 신분과 온라인 서비스 업종 조건이 맞습니다.<br />
                    다만 사업 아이디어가 한 줄 단계라<br />
                    구체성·실현가능성 보완이 필요합니다.
                  </p>
                  <div className="score" aria-label="4축 예비점수">
                    <div className="score-row"><span>관련성</span><span className="bar"><i className="s72" /></span><span>72</span></div>
                    <div className="score-row"><span>구체성</span><span className="bar"><i className="s48" /></span><span>48</span></div>
                    <div className="score-row"><span>차별성</span><span className="bar"><i className="s61" /></span><span>61</span></div>
                    <div className="score-row"><span>실현가능성</span><span className="bar"><i className="s45" /></span><span>45</span></div>
                  </div>
                  <a className="sample-link" href="#sample">
                    실제 리포트 전체 보기
                    <svg className="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 고객이 멈추는 지점 */}
        <section className="soft-section">
          <div className="wrap">
            <p className="section-kicker">고객이 멈추는 지점</p>
            <h2 className="section-title"><span className="title-line">공고는 찾았습니다.</span><span className="title-line">그런데 공고문 앞에서 멈춥니다.</span></h2>
            <p className="section-lead">
              문제는 검색 결과 부족이 아닙니다.<br />
              신청자격, 제외 조건, 제출서류,<br className="mobile-break" />
              평가항목을 읽는 순간 &quot;내가 되는 건지&quot;가 흐려집니다.
            </p>
            <div className="reading-visual">
              <div className="notice-card">
                <div className="visual-head">
                  <span className="visual-chip bad">지금까지</span>
                  <span>공고문 27쪽, 혼자 해석</span>
                </div>
                <div className="fake-notice">
                  <h3>2026년 예비창업패키지 모집공고</h3>
                  {NOTICE_LINES.map((line) => (
                    <div className="notice-line" key={line.label}>
                      <span className="notice-box" aria-hidden="true" />
                      <span>
                        {line.label}: {line.mark && <span className="notice-mark">{line.mark}</span>}{line.rest}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="quote-list">
                  {QUOTES.map((q) => (
                    <blockquote key={q}>{q}</blockquote>
                  ))}
                </div>
              </div>
              <div className="visual-arrow" aria-hidden="true">
                <span className="arrow-disc"><svg viewBox="0 0 24 24"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg></span>
                <span>3분</span>
              </div>
              <div className="answer-card">
                <div className="visual-head">
                  <span className="visual-chip good">진단 결과</span>
                  <span>같은 공고, 판단 가능한 답</span>
                </div>
                <div className="result-box">
                  {RESULT_ROWS.map((r) => (
                    <div className="result-row" key={r.title}>
                      <span className="result-icon">✓</span>
                      <p><b>{r.title}</b><span>{r.desc}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="timeline">
              <h3>자격이 안 맞으면, 아무리 잘 써도 심사대에 오르지 못합니다.</h3>
              <p>
                그리고 고민하는 사이, 마감은 지나갑니다.<br />
                한 번 놓친 공고의 다음 모집은 보통 반년 뒤입니다.<br />
                공고를 더 모으는 게 아니라, &apos;내가 되는지&apos;를 먼저 확인해야 하는 이유입니다.
              </p>
              <div className="time-line" role="group" aria-label="마감 타임라인">
                <span className="time-dot">오늘</span><span className="time-stroke" /><span className="time-dot deadline">D-day</span><span className="time-stroke" /><span className="time-dot next">다음 모집 6개월 뒤</span>
              </div>
            </div>
          </div>
        </section>

        {/* 전후 비교 */}
        <section>
          <div className="wrap">
            <p className="section-kicker">전후 비교</p>
            <h2 className="section-title"><span className="title-line">지원금 레이더를 켜기</span><span className="title-line">전과 후</span></h2>
            <div className="ba-table">
              <div className="ba-row ba-head"><div className="ba-cell">구분</div><div className="ba-cell">지금까지 (혼자)</div><div className="ba-cell">지원금 레이더 이후</div></div>
              {BA_ROWS.map((row) => (
                <div className="ba-row" key={row.item}>
                  <div className="ba-cell"><b>{row.item}</b></div>
                  <div className="ba-cell before-cell">{row.before}</div>
                  <div className="ba-cell after-cell">{row.after}</div>
                </div>
              ))}
            </div>
            <div className="mid-cta">
              <p>공고를 더 모으기 전에, 내 조건으로 먼저 줄여보세요.</p>
              <a className="btn" href={LITTLY_URL_SCAN}>내 조건으로 3분 진단 받기</a>
            </div>
          </div>
        </section>

        {/* 다른 점 */}
        <section className="soft-section">
          <div className="wrap">
            <p className="section-kicker">다른 점</p>
            <h2 className="section-title"><span className="title-line">찾아주는 서비스와,</span><span className="title-line">진단해주는 서비스는 다릅니다</span></h2>
            <div className="difference-grid">
              <div className="difference-card">
                <div className="mini-graphic">
                  <div className="snippet">신청자격: <span className="highlight">예비창업자</span> 및 업력 기준 충족 필요</div>
                  <span className="mini-result">근거 문장 연결</span>
                </div>
                <h3>근거를 보여드립니다</h3>
                <p>&quot;신청 가능&quot;이라는 결론만 던지지 않습니다. 공고 원문의 어느 문장 때문에 가능한지, 어느 조건 때문에 주의해야 하는지 — 근거 문장을 함께 보여드립니다. 점수에 출처가 있습니다.</p>
              </div>
              <div className="difference-card">
                <div className="mini-graphic">
                  <span className="mini-result">추천 ✓</span>
                  <span className="badge coral">비추천: 업력 요건 미충족</span>
                </div>
                <h3>안 맞으면 안 맞는다고 말합니다</h3>
                <p>모든 공고를 추천하지 않습니다. 조건이 안 맞는 공고는 &apos;왜 안 맞는지&apos;와 함께 걸러드립니다. 비추천 사유가 있는 서비스는 드뭅니다.</p>
              </div>
              <div className="difference-card">
                <div className="mini-graphic">
                  <div className="criteria-row"><span>구체성</span><span className="light-bar"><i className="w48" /></span><b>이유</b></div>
                  <span className="mini-result">축별 이유 문장</span>
                </div>
                <h3>진단에서 끝나지 않습니다</h3>
                <p>점수만 던지고 끝나면 진단이 아닙니다. 4축 각각에 &apos;왜 이 점수인지&apos;가 이유 문장으로 따라옵니다. 어느 축이 약한지 알면, 무엇부터 준비할지가 보입니다.</p>
              </div>
            </div>
            <p className="plain-note">공고 매칭은 무료 서비스도 잘합니다. 저희가 파는 건 매칭이 아니라, &apos;내도 되는가&apos;에 대한 근거 있는 답입니다.</p>
          </div>
        </section>

        {/* 샘플 리포트 */}
        <section id="sample">
          <div className="wrap">
            <p className="section-kicker">리포트로 확인</p>
            <h2 className="section-title"><span className="title-line">말이 아니라,</span><span className="title-line">리포트로 보여드리겠습니다</span></h2>
            <div className="sample-frame">
              <iframe src="/sample-report.html" title="지원금 레이더 샘플 리포트" />
            </div>
            <p className="sample-caption">샘플 리포트입니다 — 당신이 받게 될 리포트도 정확히 이 형식입니다.</p>
            <div className="evidence-grid">
              <div className="criteria-card">
                <h3>저희 4축 점수는 감이 아닙니다.</h3>
                <p>정부가 공개한 평가배점표에 축을 맞춰 채점합니다. &quot;왜 이 점수인가요?&quot;라고 물으시면, 이 표를 가리키면 됩니다.</p>
                <p>합격을 보장하지 않는 대신, 근거 없는 점수도 드리지 않습니다.</p>
                <div className="criteria-bars">
                  <div className="criteria-row"><span>문제인식</span><span className="light-bar"><i className="w20" /></span><b>20</b></div>
                  <div className="criteria-row"><span>실현가능성</span><span className="light-bar"><i className="w30" /></span><b>30</b></div>
                  <div className="criteria-row"><span>성장전략</span><span className="light-bar"><i className="w30" /></span><b>30</b></div>
                  <div className="criteria-row"><span>팀역량</span><span className="light-bar"><i className="w20" /></span><b>20</b></div>
                </div>
              </div>
              <div className="story-card">
                <h3>만든 사람</h3>
                <p>지원금 레이더는 서울에서 개인 SaaS를 만드는 1인 창업자가 만들었습니다.</p>
                <p>혼자 지원사업을 준비하는 사장님들이 공고문 앞에서 같은 혼잣말(&quot;이게, 될까?&quot;)에 멈추는 걸 보고, 공고문 수십 건과 공개 평가배점표를 직접 뜯어 분석해 이 진단을 설계했습니다.</p>
              </div>
            </div>
            <div className="mid-cta">
              <p>이 형식의 리포트를 내 사업 조건으로 받아보세요.</p>
              <a className="btn" href={LITTLY_URL_SCAN}>이 리포트, 내 사업으로 받아보기</a>
            </div>
          </div>
        </section>

        {/* 진행 방식 */}
        <section className="dark-section" id="process">
          <div className="wrap">
            <p className="section-kicker">진행 방식</p>
            <h2 className="section-title"><span className="title-line">결제부터 리포트까지,</span><span className="title-line">이렇게 진행됩니다</span></h2>
            <div className="steps">
              <div className="step"><span className="step-time">1분</span><div className="step-num">01</div><h3>결제</h3><p>카드/간편결제</p></div>
              <div className="step"><span className="step-time">1분</span><div className="step-num">02</div><h3>가입 확인</h3><p>결제 정보를 확인하고 진단 입력으로 넘어갑니다.</p></div>
              <div className="step"><span className="step-time">3분</span><div className="step-num">03</div><h3>내 사업 정보 입력</h3><p>11개 항목, 사업계획서 없어도 됩니다.</p></div>
              <div className="step"><span className="step-time">24시간 안에</span><div className="step-num">04</div><h3>진단 리포트 도착</h3><p>정보 입력 완료 후 24시간 안에 도착합니다.</p></div>
            </div>
            <p className="input-note">※ 한 줄 아이디어 단계여도 진단 가능합니다. 이 단계의 리포트는 &apos;아이디어 단계 예비진단&apos;으로 표기됩니다.</p>
          </div>
        </section>

        {/* 맞는 고객 */}
        <section>
          <div className="wrap">
            <p className="section-kicker">맞는 고객</p>
            <h2 className="section-title"><span className="title-line">솔직하게 말씀드리면,</span><span className="title-line">모두에게 맞는 서비스는 아닙니다</span></h2>
            <div className="fit-board">
              <div className="fit-card">
                <div className="fit-symbol">✓</div>
                <h3>이런 분께 맞습니다</h3>
                <div className="fit-chips">
                  <span>예비창업자·초기창업자·소상공인 조건이 헷갈리는 경우</span>
                  <span>지역, 업력, 업종 기준으로 공고를 좁히고 싶은 경우</span>
                  <span>사업계획서 초안을 쓰기 전 방향을 잡고 싶은 경우</span>
                  <span>마감 전 무엇부터 준비해야 할지 정리가 필요한 경우</span>
                </div>
              </div>
              <div className="fit-card no">
                <div className="fit-symbol">!</div>
                <h3>이런 경우에는 맞지 않을 수 있습니다</h3>
                <div className="fit-chips">
                  <span>선정 가능성 보장을 원하는 경우</span>
                  <span>공식 공고문 확인 없이 바로 제출하고 싶은 경우</span>
                  <span>사업계획서 전체 대필이나 자동 제출을 원하는 경우</span>
                  <span>세금, 법률, 회계 판단까지 대신 받으려는 경우</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 가격 */}
        <section className="soft-section" id="pricing">
          <div className="wrap">
            <p className="section-kicker">가격</p>
            <h2 className="section-title"><span className="title-line">컨설팅 한 번 값이 아니라,</span><span className="title-line">커피 몇 잔 값으로</span></h2>
            <div className="price-anchor">
              <p className="section-lead" style={{ marginTop: 0 }}>
                사업계획서 컨설팅은 1회 30만~80만 원입니다.<br />컨설턴트를 부르기 전에, &apos;내도 되는지&apos;부터 9,900원으로 확인하세요.
              </p>
              <div className="price-bars" role="group" aria-label="컨설팅과 예비진단 가격 비교">
                <div className="price-bar-row"><span>컨설팅 30만~80만 원</span><span className="money-bar big"><i /></span><b>제출 전 큰 비용</b></div>
                <div className="price-bar-row"><span>예비진단 9,900원</span><span className="money-bar small"><i /></span><b>내도 되는지 먼저 확인</b></div>
              </div>
            </div>
            <div className="price-layout">
              <div className="main-price">
                <span className="badge good">판매 중</span>
                <h3>{PRICING.scan.name}</h3>
                <p>아이디어 예비진단 — &quot;되는지&quot;부터 훑기</p>
                <div className="price">{PRICING.scan.price.toLocaleString()}원</div>
                <div className="price-sub">출시 기념 가격 · 정식 버전에서 인상될 수 있습니다</div>
                <ul className="check-list">
                  {PRICING.scan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="fine-print">※ 사업계획서 첨부 전 단계의 진단이므로, 구체성·실현가능성 점수는 낮게 나오는 것이 정상입니다. 리포트에 그 이유를 축별로 적어드립니다.</p>
                <PurchaseConsentGate href={LITTLY_URL_SCAN} label={`${PRICING.scan.price.toLocaleString()}원으로 예비진단 받기`} />
              </div>
              <div className="price-card">
                <span className="badge warn">출시 준비 중</span>
                <h3>LOCK-ON · 락온</h3>
                <p>제출 전 정밀진단 — 공고 하나를 조준</p>
                <div className="price" style={{ fontSize: 22 }}>
                  정가 29,900원{' '}
                  <span className="flow-arrow" aria-hidden="true"><svg className="arrow-icon" viewBox="0 0 24 24"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg></span>
                  <br />출시 기념가 19,900원 예정
                </div>
                <div className="locked"><p>공고를 정하고 사업계획서 초안까지 있는 분을 위한 제출 직전 점검. 문장 단위 감점 위험 탐지 + 공개 평가배점표 기준 상세 채점.</p></div>
                <p className="no-button-note">출시 소식은 이 페이지에서 안내됩니다</p>
              </div>
              <div className="price-card">
                <span className="badge warn">출시 준비 중</span>
                <h3>FULL RADAR · 풀레이더</h3>
                <p>심층진단 — 여러 공고, 전 범위 비교</p>
                <div className="price" style={{ fontSize: 22 }}>
                  정가 49,900원{' '}
                  <span className="flow-arrow" aria-hidden="true"><svg className="arrow-icon" viewBox="0 0 24 24"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg></span>
                  <br />출시 기념가 29,900원 예정
                </div>
                <div className="locked"><p>후보 공고들을 한 번에 비교하고, 축별 보완 방향까지 잡아드리는 가장 깊은 진단.</p></div>
                <p className="no-button-note">출시 소식은 이 페이지에서 안내됩니다</p>
              </div>
            </div>
            <div className="safe-box">
              <ul>
                <li>리포트는 24시간 안에 도착합니다</li>
                <li>리포트 발급 전에는 전액 환불됩니다</li>
                <li>결제는 리틀리 페이지에서 진행됩니다 · 카드/간편결제 가능</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="wrap">
            <p className="section-kicker">자주 묻는 질문</p>
            <h2 className="section-title">자주 묻는 질문</h2>
            <div className="faq-list">
              {FAQS.map((item, i) => (
                <details key={item.q} open={i === 0}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
            <div className="mid-cta">
              <p>궁금한 건 풀렸다면, 3분 진단을 시작해보세요.</p>
              <a className="btn" href={LITTLY_URL_SCAN}>궁금한 건 풀렸다면, 3분 진단 시작하기</a>
            </div>
          </div>
        </section>

        {/* 최종 CTA */}
        <section className="final-cta">
          <div className="wrap">
            <h2>공고 100개를 더 모으는 것보다,<br />지금 가진 1개에 &apos;내도 되는지&apos; 답을 얻는 게 빠릅니다.</h2>
            <div className="hero-actions">
              <a className="btn" href={LITTLY_URL_SCAN}>3분 정보 입력하고 진단 받기 · 9,900원</a>
            </div>
            <div className="secondary-links">
              <span>아직 고민되시나요?</span>
              <a className="text-link dark-link" href="#sample">공고문을 7칸으로 쪼개 읽는 법, 가이드북 일부를 무료로 열어뒀습니다 [무료 미리보기]</a>
            </div>
          </div>
        </section>
      </main>
      </div>

      <SiteFooter />
      <MobileStickyCta href={LITTLY_URL_SCAN} />
    </>
  )
}
