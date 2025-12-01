-- Kapital 데이터베이스 스키마
-- 복식부기 기반 개인 재무관리 앱

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum 타입 생성
CREATE TYPE account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE');
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'premium_plus');

-- 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    default_currency VARCHAR(3) DEFAULT 'KRW',
    locale VARCHAR(10) DEFAULT 'ko-KR',
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 계정과목 (Chart of Accounts)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    account_type account_type NOT NULL,
    account_subtype VARCHAR(50),
    parent_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    icon VARCHAR(50),
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- 분개장 (Journal Entries)
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT,
    memo TEXT,
    is_voided BOOLEAN DEFAULT FALSE,
    voided_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(50) DEFAULT 'manual',
    external_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 거래 라인 (Transaction Lines)
CREATE TABLE transaction_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    exchange_rate DECIMAL(15, 6) DEFAULT 1,
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 예산 (Budgets)
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    period_type VARCHAR(20) DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 반복 거래 (Recurring Transactions)
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    template_entry JSONB NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    next_occurrence DATE NOT NULL,
    last_processed DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 잔액 스냅샷 (Balance Snapshots)
CREATE TABLE balance_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    snapshot_date DATE NOT NULL,
    balance DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(account_id, snapshot_date)
);

-- 자산 가격 (Asset Prices)
CREATE TABLE asset_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    price_date DATE NOT NULL,
    price DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    source VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(account_id, price_date)
);

-- 인덱스 생성
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_transaction_lines_entry_id ON transaction_lines(journal_entry_id);
CREATE INDEX idx_transaction_lines_account_id ON transaction_lines(account_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_balance_snapshots_account_date ON balance_snapshots(account_id, snapshot_date);

-- Row Level Security 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_prices ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can only access own data" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access own accounts" ON accounts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own entries" ON journal_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own transaction lines" ON transaction_lines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM journal_entries je
            WHERE je.id = transaction_lines.journal_entry_id
            AND je.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can only access own budgets" ON budgets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own recurring" ON recurring_transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own snapshots" ON balance_snapshots
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own asset prices" ON asset_prices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM accounts a
            WHERE a.id = asset_prices.account_id
            AND a.user_id = auth.uid()
        )
    );

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 분개 검증 함수 (차변 합 = 대변 합, 즉 총합이 0이어야 함)
CREATE OR REPLACE FUNCTION validate_journal_entry_balance(entry_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    entry_sum DECIMAL(19, 4);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO entry_sum
    FROM transaction_lines
    WHERE journal_entry_id = entry_id;

    RETURN entry_sum = 0;
END;
$$ LANGUAGE plpgsql;

-- 계정 잔액 계산 함수
CREATE OR REPLACE FUNCTION get_account_balance(
    p_account_id UUID,
    p_as_of_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(19, 4) AS $$
DECLARE
    v_balance DECIMAL(19, 4);
BEGIN
    SELECT COALESCE(SUM(tl.amount), 0) INTO v_balance
    FROM transaction_lines tl
    JOIN journal_entries je ON je.id = tl.journal_entry_id
    WHERE tl.account_id = p_account_id
    AND je.entry_date <= p_as_of_date
    AND je.is_voided = FALSE;

    RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- 순자산 계산 함수
CREATE OR REPLACE FUNCTION get_net_worth(
    p_user_id UUID,
    p_as_of_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(19, 4) AS $$
DECLARE
    v_assets DECIMAL(19, 4);
    v_liabilities DECIMAL(19, 4);
BEGIN
    -- 자산 총계 (양수)
    SELECT COALESCE(SUM(tl.amount), 0) INTO v_assets
    FROM transaction_lines tl
    JOIN journal_entries je ON je.id = tl.journal_entry_id
    JOIN accounts a ON a.id = tl.account_id
    WHERE a.user_id = p_user_id
    AND a.account_type = 'ASSET'
    AND je.entry_date <= p_as_of_date
    AND je.is_voided = FALSE;

    -- 부채 총계 (음수로 저장되므로 절대값)
    SELECT COALESCE(SUM(ABS(tl.amount)), 0) INTO v_liabilities
    FROM transaction_lines tl
    JOIN journal_entries je ON je.id = tl.journal_entry_id
    JOIN accounts a ON a.id = tl.account_id
    WHERE a.user_id = p_user_id
    AND a.account_type = 'LIABILITY'
    AND je.entry_date <= p_as_of_date
    AND je.is_voided = FALSE;

    RETURN v_assets - v_liabilities;
END;
$$ LANGUAGE plpgsql;

-- 사용자 생성 시 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 트리거 연결
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
