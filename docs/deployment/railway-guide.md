# Railway 배포 가이드

## 개요

Kapital 웹 앱을 Railway에 배포하는 방법을 설명합니다.

## 왜 Railway인가?

| 특징            | Railway 장점                 |
| --------------- | ---------------------------- |
| 풀스택 지원     | 웹 앱 + DB + 백그라운드 작업 |
| 컨테이너 기반   | Docker로 완전한 환경 제어    |
| 간단한 설정     | Nixpacks로 자동 빌드 감지    |
| PostgreSQL 내장 | 원클릭 DB 프로비저닝         |
| 합리적인 가격   | 사용량 기반 과금             |

## 언제 Railway를 선택할까?

- 데이터베이스가 필요한 풀스택 앱
- 백그라운드 워커나 크론 작업이 필요한 경우
- Docker 환경 커스터마이징이 필요한 경우
- 비용 예측 가능성이 중요한 경우

> **참고**: Kapital은 Supabase를 사용하므로 Railway의 DB 기능은 불필요합니다.
> 하지만 추가 백그라운드 작업이나 마이크로서비스가 필요할 때 유용합니다.

## 사전 준비

1. [Railway 계정](https://railway.app) 생성
2. GitHub 저장소 연결
3. Supabase 프로젝트 설정 완료

## 배포 단계

### 1. Railway 프로젝트 생성

Railway 대시보드에서:

1. "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. Kapital 저장소 선택

### 2. railway.json 설정

프로젝트 루트에 `railway.json` 생성:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build:web"
  },
  "deploy": {
    "startCommand": "npm run start --workspace=apps/web",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### 3. Nixpacks 설정 (선택사항)

`nixpacks.toml` 파일로 빌드 환경 커스터마이징:

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build:web"]

[start]
cmd = "npm run start --workspace=apps/web"
```

### 4. 환경 변수 설정

Railway 대시보드 > Variables에서 추가:

```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**공유 변수**:
여러 서비스에서 같은 변수를 사용할 경우:

1. "Shared Variables" 생성
2. 각 서비스에서 참조

### 5. 도메인 설정

1. Railway 대시보드 > Settings > Domains
2. "Generate Domain" 또는 커스텀 도메인 추가
3. DNS 레코드 설정:
   - `CNAME`: Railway에서 제공하는 값으로 설정

## GitHub Actions 연동

Railway CLI를 사용한 배포:

```yaml
- name: Deploy to Railway
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  run: |
    npm install -g @railway/cli
    railway up --service web
```

**필요한 Secrets**:

- `RAILWAY_TOKEN`: Railway > Account Settings > Tokens에서 생성

## Health Check

Railway의 헬스체크 설정:

```json
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30
  }
}
```

Railway가 `/api/health`를 주기적으로 호출하여 서비스 상태 확인.

## 모니터링

### Railway 대시보드

- **Deployments**: 배포 이력 및 로그
- **Metrics**: CPU, 메모리, 네트워크 사용량
- **Logs**: 실시간 애플리케이션 로그

### 로그 확인

```bash
# Railway CLI로 로그 확인
railway logs

# 실시간 로그
railway logs --follow
```

## 스케일링

### 수평 스케일링

Railway는 자동 스케일링을 지원합니다:

```json
{
  "deploy": {
    "numReplicas": 2
  }
}
```

### 리전 선택

Railway는 여러 리전을 지원합니다:

- `us-west-1`: 미국 서부
- `us-east-1`: 미국 동부
- `eu-west-1`: 유럽
- `asia-east-1`: 아시아

## 트러블슈팅

### 빌드 실패

1. **Nixpacks 감지 실패**: `nixpacks.toml` 또는 `Dockerfile` 추가
2. **의존성 문제**: `package-lock.json` 최신화
3. **메모리 부족**: 빌드 메모리 증가 요청

### 런타임 에러

1. **포트 문제**: `PORT` 환경 변수 사용 확인
2. **메모리 부족**: 서비스 리소스 증가
3. **타임아웃**: 헬스체크 타임아웃 증가

### 성능 최적화

1. **빌드 캐시**: Railway가 자동으로 캐시
2. **스타트업 시간**: 번들 크기 최적화
3. **리전 선택**: 사용자 가까운 리전 선택

## Vercel vs Railway 비교

| 항목         | Vercel                | Railway            |
| ------------ | --------------------- | ------------------ |
| 최적 용도    | Next.js / 정적 사이트 | 풀스택 앱          |
| 빌드         | 서버리스 함수         | 컨테이너           |
| DB 지원      | 없음 (외부 연동)      | PostgreSQL 내장    |
| 무료 티어    | 100GB 대역폭          | $5 크레딧/월       |
| 스케일링     | 자동 (Edge)           | 수동/자동 선택     |
| 커스터마이징 | 제한적                | 완전 제어 (Docker) |

**Kapital 추천**: Vercel (Next.js 최적화 + Supabase 연동으로 충분)

## 비용

| 항목        | 가격                  |
| ----------- | --------------------- |
| 실행 시간   | $0.000231/vCPU-minute |
| 메모리      | $0.000231/GB-minute   |
| 대역폭      | $0.10/GB (egress)     |
| 무료 크레딧 | $5/월                 |

예상 비용 (저트래픽 앱):

- 월 $5-15 정도

---

_최종 수정: 2025-12-16_
