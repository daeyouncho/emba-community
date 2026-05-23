# EMBA 동기 모임 배포 가이드 (Railway)

## 1단계 — GitHub 저장소 만들기

```bash
cd emba-community
git init
git add .
git commit -m "Initial commit: EMBA 동기 모임 백엔드"
```

GitHub에서 새 저장소 생성 후:
```bash
git remote add origin https://github.com/YOUR_ID/emba-community.git
git push -u origin main
```

---

## 2단계 — Railway 프로젝트 생성

1. https://railway.app 접속 → GitHub 로그인
2. **New Project** → **Deploy from GitHub repo**
3. `emba-community` 저장소 선택

---

## 3단계 — PostgreSQL 추가

1. 프로젝트 대시보드에서 **+ New** → **Database** → **PostgreSQL**
2. PostgreSQL 서비스 클릭 → **Connect** 탭 → `DATABASE_URL` 자동 설정됨

---

## 4단계 — Redis 추가

1. **+ New** → **Database** → **Redis**
2. Redis 서비스 클릭 → **Connect** 탭 → `REDIS_URL` 자동 설정됨

---

## 5단계 — 환경변수 설정

Railway 대시보드 → 백엔드 서비스 → **Variables** 탭에서 추가:

| 변수명 | 값 |
|--------|-----|
| `JWT_SECRET` | 랜덤 긴 문자열 (예: `openssl rand -hex 32` 결과) |
| `JWT_REFRESH_SECRET` | 다른 랜덤 문자열 |
| `NODE_ENV` | `production` |

> `DATABASE_URL`, `REDIS_URL`은 Railway가 자동으로 주입합니다.

---

## 6단계 — 배포 확인

Railway가 자동으로 빌드 & 배포합니다 (2~3분 소요).

배포 완료 후:
- **Settings** → **Networking** → **Generate Domain** 클릭
- `https://emba-community-xxxx.up.railway.app` 형태의 URL 발급

API 테스트:
```bash
curl https://YOUR-DOMAIN.up.railway.app/api/v1/auth/register \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@emba.com","password":"123456","name":"테스트"}'
```

---

## 배포 완료 후 — 프론트엔드 연결

웹앱의 API 주소를 Railway URL로 변경하면 휴대폰에서 바로 접속 가능합니다.
