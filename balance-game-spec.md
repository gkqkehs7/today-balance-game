# 오늘의 밸런스 게임 — 프로젝트 명세서

## 프로젝트 개요

매일 하나의 밸런스 게임 질문을 보여주고 사용자가 투표하는 웹 서비스.
사용자 위치 기반 날씨를 페이지 전체 배경으로 표현해 감성적인 경험을 제공한다.
하루 한 번만 투표 가능하며, 투표 후 실시간 결과와 댓글을 확인할 수 있다.

---

## 기술 스택

### 프론트엔드
- HTML / CSS / JavaScript (바닐라, 프레임워크 없음)
- OpenWeatherMap API (날씨 정보)
- localStorage (중복 투표 방지 — 날짜 기반 키 저장)

### 백엔드
- Node.js + Express
- MongoDB (Mongoose ODM)

### 배포
- 프론트엔드: **Vercel**
- 백엔드: **Railway**
- DB: **Railway MongoDB** (Railway 플러그인으로 백엔드와 함께 관리)

---

## 파일 구조

```
balance-game/
├── client/                  # 프론트엔드 (Vercel 배포)
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── weather.js           # 날씨 API 및 배경 애니메이션
│
└── server/                  # 백엔드 (Railway 배포)
    ├── index.js             # Express 서버 진입점
    ├── .env                 # 환경변수
    ├── models/
    │   ├── Question.js      # 문제 스키마
    │   ├── Vote.js          # 투표 스키마
    │   └── Comment.js       # 댓글 + 대댓글 스키마
    └── routes/
        ├── questions.js     # 문제 관련 API
        ├── votes.js         # 투표 관련 API
        └── comments.js      # 댓글 + 대댓글 관련 API
```

---

## MongoDB 스키마

### Question (문제)
```js
{
  _id: ObjectId,
  question: String,       // 질문 본문
  optionA: String,        // 선택지 A
  optionB: String,        // 선택지 B
  tag: String,            // 카테고리 (음식, 일상, 직장 등)
  date: String,           // "2026-03-17" 형식 (오늘 문제 조회용)
  isAI: Boolean,          // AI 생성 여부
  createdAt: Date
}
```

### Vote (투표)
```js
{
  _id: ObjectId,
  questionId: ObjectId,   // 어떤 문제인지
  ip: String,             // IP 기반 중복 방지 (서버 측)
  choice: String,         // "A" 또는 "B"
  createdAt: Date
}
```

### Comment (댓글 + 대댓글)
```js
{
  _id: ObjectId,
  questionId: ObjectId,   // 어떤 문제의 댓글인지
  parentId: ObjectId,     // null이면 일반 댓글, ObjectId면 대댓글
                          // 대댓글의 parentId는 항상 최상위 댓글을 가리킴
                          // 대댓글의 대댓글은 존재하지 않음 (depth 1단계 고정)
  choice: String,         // 어느 쪽 선택한 사람인지 ("A" 또는 "B")
  text: String,           // 댓글 내용 (최대 100자)
  createdAt: Date
}
```

> **depth 제한 규칙**: 대댓글 등록 시 서버에서 parentId의 댓글을 조회해
> 해당 댓글이 이미 대댓글(parentId가 존재)이면 `400 Bad Request`로 거부한다.

---

## API 명세

### 문제

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/questions/today` | 오늘의 문제 조회 |
| GET | `/api/questions/archive` | 지난 문제 목록 조회 |
| POST | `/api/questions` | 문제 추가 (관리자) |
| DELETE | `/api/questions/:id` | 문제 삭제 (관리자) |
| POST | `/api/questions/ai` | AI 문제 생성 후 저장 (관리자) |

### 투표

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/votes` | 투표 등록 |
| GET | `/api/votes/:questionId` | 해당 문제 투표 결과 조회 |

### 댓글 + 대댓글

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/comments/:questionId` | 댓글 + 대댓글 트리 구조로 조회 |
| POST | `/api/comments` | 댓글 등록 (parentId 없음) |
| POST | `/api/comments/:parentId/reply` | 대댓글 등록 (depth 체크 포함) |
| DELETE | `/api/comments/:id` | 댓글/대댓글 삭제 |

#### GET `/api/comments/:questionId` 응답 예시
```json
[
  {
    "_id": "aaa",
    "parentId": null,
    "choice": "A",
    "text": "치킨이 훨씬 맛있죠",
    "createdAt": "2026-03-17T10:00:00Z",
    "replies": [
      {
        "_id": "bbb",
        "parentId": "aaa",
        "choice": "B",
        "text": "ㄹㅇ 공감합니다 ㅋㅋ",
        "createdAt": "2026-03-17T10:05:00Z"
      },
      {
        "_id": "ccc",
        "parentId": "aaa",
        "choice": "A",
        "text": "저도요!",
        "createdAt": "2026-03-17T10:07:00Z"
      }
    ]
  }
]
```

> 서버에서 댓글과 대댓글을 조회한 뒤 트리 구조로 조합해서 반환한다.
> 프론트는 replies 배열을 순서대로 렌더링하면 된다.

---

## 중복 투표 방지 전략

### 클라이언트 (1차 방어)
- `localStorage`에 `vote_2026-03-17` 형식의 키 저장
- 키가 존재하면 투표 버튼 비활성화
- 자정이 지나면 새 날짜 키가 없으므로 자동 초기화

### 서버 (2차 방어)
- 투표 등록 시 `questionId + IP` 조합으로 중복 체크
- 이미 투표한 IP면 `409 Conflict` 반환

> localStorage는 시크릿 모드나 다른 기기에서 우회 가능하므로
> 서버의 IP 체크가 실질적인 방어선이 된다.

---

## 날씨 배경 기능

### 동작 흐름
1. 페이지 로드 시 브라우저에서 위치 권한 요청
2. 위치 허용 → OpenWeatherMap API로 날씨 조회
3. 위치 거부 → 기본 배경(맑음) 표시
4. 날씨 코드에 따라 배경 애니메이션 + 색감 적용

### 날씨별 배경

| 날씨 | 배경 색감 | 애니메이션 |
|------|----------|-----------|
| 맑음 (Clear) | 하늘색 → 연노랑 | 태양 빛 퍼짐, 구름 천천히 이동 |
| 비 (Rain) | 어두운 회청색 | 빗줄기 파티클 (Canvas) |
| 흐림 (Clouds) | 회색톤 | 구름 레이어 느리게 흐름 |
| 눈 (Snow) | 차가운 흰/파랑 | 눈송이 파티클 (Canvas) |
| 안개/연무 (Mist/Haze) | 뿌연 청회색 | 안개 레이어 천천히 흐름 |
| 폭염 (기온 33°C+) | 주황/붉은 | 아지랑이 웨이브 애니메이션 |
| 뇌우 (Thunderstorm) | 짙은 남색 | 빗줄기 + 번개 플래시 효과 |

### 상단 날씨 정보 표시
- 좌측 상단에 작게 고정: `📍 수원시  12°  맑음`
- 흰색 텍스트 + 그림자 처리로 배경 위 가독성 확보

### 카드 처리
- 밸런스 게임 카드에 `backdrop-filter: blur(12px)` + 반투명 배경 적용
- 배경이 비치면서도 콘텐츠 가독성 유지

---

## UI 구성

### 사용자 페이지
```
[ 날씨 배경 애니메이션 — 전체 화면 ]

📍 수원시  12°  맑음               ← 좌측 상단 고정, 흰 텍스트

        2026년 3월 17일 · #82
       오늘의 밸런스 게임
      지금 사람들은 어느 쪽일까요?    [지난 문제]

┌──────────────────────────────────┐  ← 반투명 블러 카드
│  Q. 오늘의 질문                   │
│  연봉 5천 워라밸 vs 1억 야근?      │
│  📋 직장                         │
├─────────────┬────────────────────┤
│  A 선택지   │   B 선택지          │  ← 트위치 스타일 보라색 버튼
│  (투표 후 % + 바 애니메이션)       │
└──────────────────────────────────┘

  [결과 공유하기]

  댓글
  ┌─────────────────────────────────────┐
  │ [A] 치킨이 훨씬 맛있죠    [답글]    │  ← 댓글
  │   │                                │
  │   └─ [B] ㄹㅇ 공감합니다 ㅋㅋ      │  ← 대댓글
  │   └─ [A] 저도요!                   │  ← 대댓글
  │                                    │
  │ [B] 삼겹살은 구워먹는 재미가 [답글] │  ← 댓글
  │   │                                │
  │   └─ [A] 그래도 치킨이죠           │  ← 대댓글
  └─────────────────────────────────────┘
  ※ 대댓글에는 [답글] 버튼 없음

                               · · ·  ← 관리자 진입 (숨김)
```

### 댓글 UI 세부 규칙
- 댓글마다 **[답글]** 버튼 표시
- [답글] 클릭 시 해당 댓글 바로 아래 입력창이 인라인으로 열림
- 대댓글에는 [답글] 버튼 없음 (depth 1단계 고정)
- 대댓글은 좌측 들여쓰기 + 세로선으로 시각적 구분
- 댓글/대댓글 모두 선택지 뱃지 ([A] 또는 [B]) 표시

### 관리자 패널 (모달)
- `· · ·` 클릭 시 오버레이로 열림
- 문제 목록 보기 / 적용 / 삭제
- 문제 직접 추가 (질문, 선택지A/B, 카테고리)
- AI 문제 생성 (Claude API 연동, 주제 힌트 입력 가능)

---

## 환경변수

### 서버 (Railway에 등록)
```
MONGODB_URL=...                     # Railway MongoDB 플러그인이 자동 주입
PORT=4000
ANTHROPIC_API_KEY=sk-ant-...        # AI 문제 생성용
ADMIN_SECRET=...                    # 관리자 API 보호용 시크릿 키
```

### 프론트 (Vercel에 등록)
```
API_BASE_URL=https://your-app.up.railway.app
OPENWEATHER_API_KEY=...             # 날씨 API (클라이언트에서 직접 호출)
```

---

## 배포 방법

### 1. Railway (백엔드 + MongoDB 함께 세팅)
1. https://railway.app 에서 새 프로젝트 생성
2. GitHub 레포 연결 → Root Directory를 `server/`로 지정
3. 대시보드에서 **+ New → Database → MongoDB** 플러그인 추가
4. MongoDB 플러그인 추가 시 `MONGODB_URL` 환경변수가 자동으로 서버에 주입됨
5. 추가 환경변수 등록 (`ANTHROPIC_API_KEY`, `ADMIN_SECRET`, `PORT`)
6. 배포 후 Railway 도메인 확인 (예: `https://balance-game.up.railway.app`)

### 2. Vercel (프론트엔드)
1. GitHub 레포 연결
2. Root Directory를 `client/`로 지정
3. 환경변수 등록 (`API_BASE_URL`, `OPENWEATHER_API_KEY`)
4. 배포 완료

---

## 개발 순서 (추천)

1. **서버 세팅** — Express + MongoDB Atlas 연결, 기본 CRUD API 완성
2. **프론트 기본** — 투표 UI, API 연동, localStorage 중복 방지
3. **댓글 + 대댓글** — 트리 구조 API, 인라인 답글 입력창, depth 제한
4. **날씨 배경** — OpenWeatherMap 연동, Canvas 파티클 애니메이션
5. **관리자 패널** — 문제 관리, AI 생성 연동
6. **스타일 마무리** — 반투명 카드, 날씨별 색감, 트위치 투표 버튼
7. **배포** — MongoDB Atlas → Railway → Vercel 순서로 배포 및 연동 확인

---

## 참고 링크

- OpenWeatherMap API: https://openweathermap.org/api
- Anthropic Claude API: https://docs.anthropic.com
- Railway: https://railway.app
- Vercel: https://vercel.com

---

## 변경 이력

### 2026-03-17 — UI 전면 리디자인 (1차)

**전체 디자인**
- 폰트: `Noto Sans KR` + `Noto Serif KR` (세리프/산세리프 혼합) 적용
- 날씨별 배경 그라디언트 색감을 더 자연스럽고 진하게 조정
- 헤더 날짜·제목 계층 개선 (세리프 타이틀, 작은 uppercase 날짜)

**투표 버튼**
- 기존: 트위치 스타일 보라/주황 버튼 2개 나란히
- 변경: A/B 두 패널이 좌우 분리된 VS 배틀 레이아웃 → 이후 VS 배지 제거
- 배경은 어둡게 유지 (`rgba(0,0,0,0.3)`), 테두리·글자만 색상 강조
  - A: 앰버(#ffb83c) 테두리 + 글자 + 글로우
  - B: 블루(#46a0ff) 테두리 + 글자 + 글로우
- 투표 결과: 패널 아래에서 위로 채워지는 fill 애니메이션 + 퍼센트 오버레이

**날씨 Canvas 씬 (실사 장면 방식으로 교체)**
- 비 (Rain): 빗줄기 파티클 + 우산 쓴 사람 실루엣 5명 + 가로등 + 물웅덩이
- 뇌우 (Thunder): 번개 볼트 + 화면 플래시 + 폭우 + 사람 실루엣
- 눈 (Snow): 눈송이 파티클 + 눈사람 실루엣 + 대머리 나무 + 쌓인 눈 바닥 웨이브
- 맑음 (Clear): 태양 글로우 + 회전 광선 + 날아가는 새 7마리 + 풀밭 + 나무
- 구름 (Clouds): 3겹 구름 레이어 + 산 능선 실루엣
- 안개 (Mist): 반투명 안개 레이어 + 나무 실루엣이 안개에 묻히는 효과
- 폭염 (Heat): 강렬한 태양 + 16방향 광선 + 건물 실루엣 + 아지랑이 웨이브

### 2026-03-17 — UI 수정 (2차)

**투표 패널**
- VS 배지 완전 제거 (불필요하게 공간 차지)
- 그리드: `1fr auto 1fr` → `1fr 1fr` (gap 10px)
- 패널 배경을 더 어둡게(`rgba(0,0,0,0.3)`), 밝은 fill/tint 제거
- 색상은 테두리 + 글자만 적용 (A: 앰버, B: 블루), 패널 자체는 다크 유지
- 호버 시 테두리 밝기 증가, 배경 소폭 어두워짐

### 2026-03-17 — 시간대·텍스트 가독성 개선 (3차)

**낮/밤 배경 시스템**
- `getTimePhase()` 함수: 현재 시각 기준 `dawn(05-06:30) / day(06:30-18:30) / dusk(18:30-20:30) / night` 4단계
- body에 `time-dawn / time-day / time-dusk / time-night` 클래스 자동 부여
- 밤 CSS: 모든 날씨 배경이 어두운 네이비/다크 계열로 override
- 새벽/황혼 CSS: 주황-핑크 계열 그라디언트로 override

**텍스트 자동 테마 전환**
- `isLightBackground(type, phase)` 로 밝은 배경 여부 판단 — light 조건: `day + (clear | snow | mist)`
- body에 `theme-light` 또는 `theme-dark` 클래스 자동 부여
- `.theme-light` — 텍스트·아이콘·카드·버튼·댓글 등 전체를 어두운 색으로 전환

**밤 Canvas 씬 공통 오버레이**
- `drawNightOverlay()`: 모든 씬의 draw 루프 끝에 호출
  - `night`: 별 160개(반짝임 애니메이션) + 초승달 + 달빛 글로우
  - `dawn/dusk`: 지평선 근처 주황·핑크 글로우
- 맑음 씬 — 밤에는 새를 그리지 않음
- 날씨 아이콘 — 밤 맑음 → 🌙, 새벽/황혼 → 🌅, 밤 눈 → 🌨️

### 2026-03-17 — 투표 버튼 레퍼런스 기반 재설계 (4차)

**투표 버튼 디자인 (레퍼런스: 투표앱 스크린샷)**
- 구조: `[A 버튼] VS [B 버튼]` — 좌우 컬럼 + 중앙 VS 텍스트
- A: 솔리드 블루(`#5B7FFF`) gradient 버튼 + 그림자
- B: 솔리드 핑크(`#FF5C88`) gradient 버튼 + 그림자
- 호버: translateY(-2px) + 그림자 강화
- 투표 후:
  - 선택한 버튼: `.chosen` (흰 outline 강조)
  - 선택 안 한 버튼: `.not-chosen` (opacity 0.45)
  - 버튼 아래 % 칩 등장 (색상 일치, spring 애니메이션)
  - 두 칸 사이 가로 스플릿 바 (A=파랑, B=핑크, width 전환 애니메이션)

### 2026-03-17 — 2단계 투표 UX 개선 (5차)

**투표 흐름 변경**
- 기존: 버튼 클릭 즉시 투표 확정
- 변경: 2단계 — 선택 → 확정
  1. A 또는 B 클릭 → 선택한 버튼 하이라이트(outline + 위로 뜸), 상대 버튼 dimmed(opacity 0.38)
  2. 카드 하단에 "투표하기!" 버튼이 spring 애니메이션으로 등장
  3. "투표하기!" 클릭 → 실제 투표 API 호출 후 결과 표시
- 선택 변경 가능 (확정 전): A→B 클릭하면 하이라이트 전환
- 실패 시 버튼 복구 (disabled 해제)

### 2026-03-17 — UI 세부 수정 (6차)

- 카드 상단 카테고리 태그(직장/음식 등) 제거
- 투표 버튼 색상 체계 변경: 솔리드 fill → 다크 배경 + 컬러 테두리
  - A (왼쪽): 빨간 테두리/글로우 (#DC3C3C)
  - B (오른쪽): 파란 테두리/글로우 (#3C78E6)
  - 선택 시: 해당 색으로 배경 tint + 테두리 강조 + 그림자
- "투표하기!" 버튼: 선택된 쪽 색상으로 자동 전환 (A선택→빨강, B선택→파랑)
- 결과 % 칩·스플릿 바도 동일 색상으로 통일
- 댓글 A팀/B팀 select — theme-light 시 어두운 글씨로 자동 전환

### 2026-03-17 — UI 폴리시 (7차)

- 질문 텍스트 가운데 정렬 (`text-align: center`)
- 날짜·문제번호 줄을 pill 뱃지로 강조
  - 반투명 흰 배경 + 테두리 + `border-radius: 999px`
  - `font-size: 0.9rem`, `font-weight: 600`
- "지난 문제 보기" / "결과 공유하기" 버튼 테두리 강화
  - `border: 1.5px solid rgba(255,255,255,0.5)` + 호버 `translateY(-1px)` + 그림자
- 댓글 등록 버튼 리디자인
  - `border: 1.5px solid rgba(255,255,255,0.45)` + 호버 `translateY(-1px)` + 클릭 `scale(0.97)`
