-- 기본 계정과목 시드 함수
-- 새 사용자가 생성될 때 호출됨

CREATE OR REPLACE FUNCTION create_default_accounts(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_asset_id UUID;
    v_cash_id UUID;
    v_bank_id UUID;
    v_investment_id UUID;
    v_liability_id UUID;
    v_short_term_id UUID;
    v_long_term_id UUID;
    v_equity_id UUID;
    v_income_id UUID;
    v_expense_id UUID;
BEGIN
    -- ===== 자산 (ASSET) =====
    INSERT INTO accounts (id, user_id, name, name_en, account_type, account_subtype, icon, color, is_system, display_order)
    VALUES (uuid_generate_v4(), p_user_id, '자산', 'Assets', 'ASSET', NULL, '💰', '#10B981', TRUE, 1)
    RETURNING id INTO v_asset_id;

    -- 현금 및 현금성 자산
    INSERT INTO accounts (id, user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, is_system, display_order)
    VALUES (uuid_generate_v4(), p_user_id, '현금 및 현금성 자산', 'Cash & Equivalents', 'ASSET', 'cash', v_asset_id, '💵', '#10B981', TRUE, 10)
    RETURNING id INTO v_cash_id;

    INSERT INTO accounts (user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, display_order)
    VALUES
        (p_user_id, '현금', 'Cash', 'ASSET', 'cash', v_cash_id, '💵', '#10B981', 11),
        (p_user_id, '예금', 'Savings', 'ASSET', 'savings', v_cash_id, '🏦', '#10B981', 12);

    -- 은행 계좌 (부모)
    INSERT INTO accounts (id, user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, is_system, display_order)
    VALUES (uuid_generate_v4(), p_user_id, '은행 계좌', 'Bank Accounts', 'ASSET', 'bank', v_asset_id, '🏦', '#3B82F6', TRUE, 20)
    RETURNING id INTO v_bank_id;

    -- 투자 자산
    INSERT INTO accounts (id, user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, is_system, display_order)
    VALUES (uuid_generate_v4(), p_user_id, '투자 자산', 'Investments', 'ASSET', 'investment', v_asset_id, '📈', '#8B5CF6', TRUE, 30)
    RETURNING id INTO v_investment_id;

    INSERT INTO accounts (user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, display_order)
    VALUES
        (p_user_id, '주식', 'Stocks', 'ASSET', 'investment', v_investment_id, '📊', '#8B5CF6', 31),
        (p_user_id, '펀드', 'Funds', 'ASSET', 'investment', v_investment_id, '📁', '#8B5CF6', 32),
        (p_user_id, '암호화폐', 'Cryptocurrency', 'ASSET', 'crypto', v_investment_id, '₿', '#F59E0B', 33);

    -- 기타 자산
    INSERT INTO accounts (user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, display_order)
    VALUES
        (p_user_id, '보증금', 'Deposits', 'ASSET', 'deposit', v_asset_id, '🔐', '#6B7280', 40),
        (p_user_id, '미수금', 'Receivables', 'ASSET', 'receivable', v_asset_id, '📋', '#6B7280', 41);

    -- ===== 부채 (LIABILITY) =====
    INSERT INTO accounts (id, user_id, name, name_en, account_type, account_subtype, icon, color, is_system, display_order)
    VALUES (uuid_generate_v4(), p_user_id, '부채', 'Liabilities', 'LIABILITY', NULL, '💳', '#EF4444', TRUE, 100)
    RETURNING id INTO v_liability_id;

    -- 단기 부채
    INSERT INTO accounts (id, user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, is_system, display_order)
    VALUES (uuid_generate_v4(), p_user_id, '단기 부채', 'Short-term Liabilities', 'LIABILITY', NULL, v_liability_id, '💳', '#EF4444', TRUE, 110)
    RETURNING id INTO v_short_term_id;

    INSERT INTO accounts (user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, display_order)
    VALUES
        (p_user_id, '미지급금', 'Payables', 'LIABILITY', 'payable', v_short_term_id, '📝', '#EF4444', 111);

    -- 장기 부채
    INSERT INTO accounts (id, user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, is_system, display_order)
    VALUES (uuid_generate_v4(), p_user_id, '장기 부채', 'Long-term Liabilities', 'LIABILITY', NULL, v_liability_id, '🏠', '#DC2626', TRUE, 120)
    RETURNING id INTO v_long_term_id;

    INSERT INTO accounts (user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, display_order)
    VALUES
        (p_user_id, '대출', 'Loans', 'LIABILITY', 'loan', v_long_term_id, '💰', '#DC2626', 121),
        (p_user_id, '주택담보대출', 'Mortgage', 'LIABILITY', 'mortgage', v_long_term_id, '🏠', '#DC2626', 122);

    -- ===== 자본 (EQUITY) =====
    INSERT INTO accounts (id, user_id, name, name_en, account_type, account_subtype, icon, color, is_system, display_order)
    VALUES (uuid_generate_v4(), p_user_id, '자본', 'Equity', 'EQUITY', NULL, '⚖️', '#6366F1', TRUE, 200)
    RETURNING id INTO v_equity_id;

    INSERT INTO accounts (user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, is_system, display_order)
    VALUES
        (p_user_id, '이익잉여금', 'Retained Earnings', 'EQUITY', 'retained_earnings', v_equity_id, '📈', '#6366F1', TRUE, 201),
        (p_user_id, '기초잔액', 'Opening Balance', 'EQUITY', 'opening_balance', v_equity_id, '🔄', '#6366F1', TRUE, 202);

    -- ===== 수익 (INCOME) =====
    INSERT INTO accounts (id, user_id, name, name_en, account_type, account_subtype, icon, color, is_system, display_order)
    VALUES (uuid_generate_v4(), p_user_id, '수익', 'Income', 'INCOME', NULL, '💵', '#10B981', TRUE, 300)
    RETURNING id INTO v_income_id;

    INSERT INTO accounts (user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, display_order)
    VALUES
        (p_user_id, '급여', 'Salary', 'INCOME', 'salary', v_income_id, '💼', '#10B981', 301),
        (p_user_id, '보너스', 'Bonus', 'INCOME', 'bonus', v_income_id, '🎁', '#10B981', 302),
        (p_user_id, '부업/프리랜서', 'Freelance', 'INCOME', 'freelance', v_income_id, '💻', '#10B981', 303),
        (p_user_id, '투자수익', 'Investment Income', 'INCOME', 'investment_income', v_income_id, '📈', '#10B981', 304),
        (p_user_id, '이자수익', 'Interest Income', 'INCOME', 'interest', v_income_id, '🏦', '#10B981', 305),
        (p_user_id, '기타수익', 'Other Income', 'INCOME', 'other_income', v_income_id, '✨', '#10B981', 306);

    -- ===== 비용 (EXPENSE) =====
    INSERT INTO accounts (id, user_id, name, name_en, account_type, account_subtype, icon, color, is_system, display_order)
    VALUES (uuid_generate_v4(), p_user_id, '비용', 'Expenses', 'EXPENSE', NULL, '💸', '#EF4444', TRUE, 400)
    RETURNING id INTO v_expense_id;

    INSERT INTO accounts (user_id, name, name_en, account_type, account_subtype, parent_id, icon, color, display_order)
    VALUES
        (p_user_id, '주거비', 'Housing', 'EXPENSE', 'housing', v_expense_id, '🏠', '#EF4444', 401),
        (p_user_id, '공과금', 'Utilities', 'EXPENSE', 'utilities', v_expense_id, '💡', '#F59E0B', 402),
        (p_user_id, '식료품', 'Groceries', 'EXPENSE', 'groceries', v_expense_id, '🛒', '#10B981', 403),
        (p_user_id, '외식', 'Dining Out', 'EXPENSE', 'dining', v_expense_id, '🍽️', '#F97316', 404),
        (p_user_id, '교통비', 'Transportation', 'EXPENSE', 'transportation', v_expense_id, '🚗', '#3B82F6', 405),
        (p_user_id, '통신비', 'Communication', 'EXPENSE', 'utilities', v_expense_id, '📱', '#8B5CF6', 406),
        (p_user_id, '의료비', 'Healthcare', 'EXPENSE', 'healthcare', v_expense_id, '🏥', '#EC4899', 407),
        (p_user_id, '교육비', 'Education', 'EXPENSE', 'education', v_expense_id, '📚', '#6366F1', 408),
        (p_user_id, '여가/문화', 'Entertainment', 'EXPENSE', 'entertainment', v_expense_id, '🎬', '#A855F7', 409),
        (p_user_id, '쇼핑', 'Shopping', 'EXPENSE', 'shopping', v_expense_id, '🛍️', '#F43F5E', 410),
        (p_user_id, '여행', 'Travel', 'EXPENSE', 'travel', v_expense_id, '✈️', '#14B8A6', 411),
        (p_user_id, '구독서비스', 'Subscriptions', 'EXPENSE', 'other_expense', v_expense_id, '📺', '#6366F1', 412),
        (p_user_id, '기타비용', 'Other Expenses', 'EXPENSE', 'other_expense', v_expense_id, '📦', '#6B7280', 413);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 생성 후 기본 계정 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user_accounts()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_default_accounts(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_user_created_accounts
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user_accounts();
