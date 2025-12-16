# ADR 0003: 복식부기 데이터 모델 설계

## 상태

Accepted

## 날짜

2024-11-20

## 맥락

Kapital의 핵심 기능인 복식부기 회계를 구현하기 위한 데이터 모델이 필요합니다.
복식부기의 핵심 원칙:

- 모든 거래는 차변(Debit)과 대변(Credit)으로 기록
- 차변 합계 = 대변 합계 (항상)
- 계정 유형: 자산, 부채, 자본, 수익, 비용

## 고려한 옵션들

### 옵션 1: 단일 거래 테이블 (단순 수입/지출)

```sql
transactions (
  id, date, amount, type, category, description
)
```

- 장점: 단순함, 익숙함
- 단점: 복식부기 불가능, 대차대조표 생성 어려움

### 옵션 2: 분개장(Journal) + 거래라인(Transaction Lines)

```sql
journal_entries (id, date, description, user_id)
transaction_lines (id, journal_entry_id, account_id, amount)
```

- 장점: 진정한 복식부기 구현, 재무제표 생성 용이
- 단점: 복잡성 증가, 단순 거래도 2개 이상의 라인 필요

### 옵션 3: 하이브리드 (단순 거래 + 고급 분개)

- 장점: 사용자 선택 가능
- 단점: 데이터 일관성 유지 어려움, 복잡한 로직

## 결정

**옵션 2: 분개장 + 거래라인** 선택

핵심 이유:

1. **회계 정확성**: 복식부기 원칙 완벽 준수
2. **재무제표 생성**: 재무상태표, 손익계산서 자동 생성 가능
3. **확장성**: 복잡한 거래(3개 이상 계정)도 처리 가능
4. **데이터 무결성**: amount 합계 = 0 제약조건으로 균형 보장

## 데이터 모델

```sql
-- 계정과목
accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name VARCHAR NOT NULL,
  account_type ENUM('asset', 'liability', 'equity', 'revenue', 'expense'),
  account_subtype VARCHAR,
  parent_id UUID REFERENCES accounts,
  currency VARCHAR DEFAULT 'KRW',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

-- 분개장 (거래 헤더)
journal_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  entry_date DATE NOT NULL,
  description VARCHAR NOT NULL,
  memo TEXT,
  is_voided BOOLEAN DEFAULT false,
  source VARCHAR DEFAULT 'manual',
  created_at TIMESTAMP
)

-- 거래 라인 (차변/대변 상세)
transaction_lines (
  id UUID PRIMARY KEY,
  journal_entry_id UUID REFERENCES journal_entries,
  account_id UUID REFERENCES accounts,
  amount DECIMAL(15,2) NOT NULL,  -- 양수=차변, 음수=대변
  memo VARCHAR,
  created_at TIMESTAMP,

  -- 제약조건: 동일 분개의 amount 합계 = 0
  CONSTRAINT balanced_entry CHECK (
    (SELECT SUM(amount) FROM transaction_lines
     WHERE journal_entry_id = journal_entry_id) = 0
  )
)
```

## 거래 예시

### 예시 1: 급여 수령 (₩3,000,000)

```
journal_entry: { description: "12월 급여" }
transaction_lines:
  - account: 보통예금(자산)    amount: +3,000,000 (차변)
  - account: 급여수입(수익)    amount: -3,000,000 (대변)
합계: 0 ✓
```

### 예시 2: 커피 구매 (₩5,000)

```
journal_entry: { description: "스타벅스 커피" }
transaction_lines:
  - account: 식비(비용)        amount: +5,000 (차변)
  - account: 현금(자산)        amount: -5,000 (대변)
합계: 0 ✓
```

### 예시 3: 신용카드 결제 (₩50,000)

```
journal_entry: { description: "마트 장보기" }
transaction_lines:
  - account: 식비(비용)        amount: +50,000 (차변)
  - account: 신용카드(부채)    amount: -50,000 (대변)
합계: 0 ✓
```

## 결과

### 긍정적

- 모든 거래가 균형을 이루어 데이터 무결성 보장
- 계정별 잔액 계산이 단순한 SUM으로 가능
- 재무제표 생성 로직이 직관적

### 부정적

- 단순한 거래도 최소 2개의 거래 라인 필요
- 사용자에게 차변/대변 개념 설명 필요 (UI에서 추상화)

### 리스크

- 거래 라인 수가 많아지면 성능 고려 필요
- 계정과목 체계 변경 시 마이그레이션 복잡

## 참고 자료

- [복식부기 원리](https://ko.wikipedia.org/wiki/복식부기)
- [Chart of Accounts Best Practices](https://www.investopedia.com/terms/c/chart-accounts.asp)
