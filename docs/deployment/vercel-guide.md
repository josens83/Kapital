# Vercel 배포 가이드

## 개요

Kapital 웹 앱을 Vercel에 배포하는 방법을 설명합니다.

## 왜 Vercel인가?

| 특징           | Vercel 장점                        |
| -------------- | ---------------------------------- |
| Next.js 최적화 | Next.js 제작사로 최고의 호환성     |
| Edge Network   | 전세계 CDN으로 빠른 로딩           |
| 자동 배포      | Git push 시 자동 배포              |
| Preview 환경   | PR마다 별도 Preview URL 제공       |
| 서버리스 함수  | API Routes 자동 변환               |
| 무료 티어      | 개인 프로젝트에 충분한 무료 리소스 |

## 사전 준비

1. [Vercel 계정](https://vercel.com/signup) 생성
2. GitHub 저장소 연결
3. Supabase 프로젝트 설정 완료

## 배포 단계

### 1. Vercel 프로젝트 생성

```bash
# Vercel CLI 설치 (선택사항)
npm i -g vercel

# 프로젝트 연결
vercel link
```

또는 Vercel 대시보드에서:

1. "Add New Project" 클릭
2. GitHub 저장소 선택
3. "Import" 클릭

### 2. 프로젝트 설정

**Root Directory**: `apps/web`

**Build Settings**:

- Framework Preset: `Next.js`
- Build Command: `cd ../.. && npm run build:web`
- Output Directory: `.next`
- Install Command: `cd ../.. && npm install`

### 3. 환경 변수 설정

Vercel 대시보드 > Settings > Environment Variables에서 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**환경별 설정**:

- Production: 실제 Stripe 키
- Preview: Stripe 테스트 키
- Development: 로컬 개발용

### 4. vercel.json 설정

`apps/web/vercel.json` 파일이 이미 설정되어 있습니다:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["icn1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "no-store, must-revalidate" }]
    }
  ]
}
```

**설정 설명**:

- `regions: ["icn1"]`: 서울 리전 (한국 사용자 최적화)
- `functions.maxDuration`: API 타임아웃 30초
- `functions.memory`: 1GB 메모리 할당
- `headers`: 보안 헤더 및 캐시 제어

### 5. 도메인 설정

1. Vercel 대시보드 > Domains
2. 커스텀 도메인 추가
3. DNS 레코드 설정:
   - `A` 레코드: `76.76.21.21`
   - `CNAME` 레코드: `cname.vercel-dns.com`

## GitHub Actions 연동

`.github/workflows/deploy.yml`에서 자동 배포 설정:

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: '--prod'
```

**필요한 Secrets**:

- `VERCEL_TOKEN`: Vercel > Settings > Tokens에서 생성
- `VERCEL_ORG_ID`: `.vercel/project.json`에서 확인
- `VERCEL_PROJECT_ID`: `.vercel/project.json`에서 확인

## Health Check

`/api/health` 엔드포인트로 상태 확인:

```bash
curl https://your-app.vercel.app/api/health
```

응답 예시:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": { "status": "ok", "latency": 45 },
    "memory": { "status": "ok", "used": 128, "limit": 512 }
  }
}
```

## 모니터링

### Vercel Analytics

1. Vercel 대시보드 > Analytics
2. "Enable Analytics" 클릭
3. Web Vitals 자동 추적

### 로그 확인

```bash
# Vercel CLI로 로그 확인
vercel logs your-deployment-url

# 실시간 로그
vercel logs --follow
```

## 트러블슈팅

### 빌드 실패

1. **의존성 문제**: `npm ci` 대신 `npm install` 사용
2. **경로 문제**: Monorepo root에서 빌드 명령 실행 확인
3. **환경 변수**: 모든 필수 변수 설정 확인

### 런타임 에러

1. **API 타임아웃**: `maxDuration` 증가 (Pro 플랜 필요)
2. **메모리 부족**: `memory` 설정 증가
3. **CORS 에러**: `next.config.js`에 헤더 설정 추가

### 성능 최적화

1. **이미지 최적화**: `next/image` 사용
2. **번들 크기**: `@next/bundle-analyzer` 로 분석
3. **캐싱**: ISR(Incremental Static Regeneration) 활용

## 비용

| 플랜       | 가격   | 특징                        |
| ---------- | ------ | --------------------------- |
| Hobby      | 무료   | 개인 프로젝트, 100GB 대역폭 |
| Pro        | $20/월 | 팀 협업, 1TB 대역폭, 분석   |
| Enterprise | 커스텀 | SLA, 전용 지원              |

---

_최종 수정: 2025-12-16_
