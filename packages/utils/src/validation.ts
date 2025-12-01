// 유효성 검증 스키마 (Zod)
import { z } from 'zod';

// 공통 스키마
export const emailSchema = z.string().email('올바른 이메일 주소를 입력해주세요.');

export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .regex(/[A-Za-z]/, '비밀번호에 영문자가 포함되어야 합니다.')
  .regex(/[0-9]/, '비밀번호에 숫자가 포함되어야 합니다.');

export const amountSchema = z
  .number()
  .positive('금액은 0보다 커야 합니다.')
  .max(999999999999, '금액이 너무 큽니다.');

export const currencySchema = z
  .string()
  .length(3, '통화 코드는 3자리여야 합니다.')
  .toUpperCase();

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)');

// 계정 관련 스키마
export const accountTypeSchema = z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']);

export const createAccountSchema = z.object({
  name: z.string().min(1, '계정명을 입력해주세요.').max(100, '계정명이 너무 깁니다.'),
  name_en: z.string().max(100).optional(),
  account_type: accountTypeSchema,
  account_subtype: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  currency: currencySchema.default('KRW'),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드를 입력해주세요.').optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  name_en: z.string().max(100).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().optional(),
});

// 거래 관련 스키마
export const transactionLineSchema = z.object({
  account_id: z.string().uuid('올바른 계정을 선택해주세요.'),
  amount: z.number(),
  memo: z.string().max(500).optional(),
});

export const createTransactionSchema = z.object({
  entry_date: dateSchema,
  description: z.string().min(1, '거래 내용을 입력해주세요.').max(500),
  memo: z.string().max(1000).optional(),
  lines: z
    .array(transactionLineSchema)
    .min(2, '최소 2개의 거래 라인이 필요합니다.')
    .refine(
      (lines) => {
        const sum = lines.reduce((acc, line) => acc + line.amount, 0);
        return Math.abs(sum) < 0.01;
      },
      { message: '차변과 대변의 합이 일치해야 합니다.' }
    ),
});

export const simpleTransactionSchema = z.object({
  entry_date: dateSchema,
  description: z.string().min(1, '거래 내용을 입력해주세요.').max(500),
  amount: amountSchema,
  from_account_id: z.string().uuid('출금 계정을 선택해주세요.'),
  to_account_id: z.string().uuid('입금 계정/카테고리를 선택해주세요.'),
  memo: z.string().max(1000).optional(),
});

// 예산 관련 스키마
export const budgetPeriodSchema = z.enum(['weekly', 'monthly', 'quarterly', 'yearly']);

export const createBudgetSchema = z.object({
  name: z.string().min(1, '예산 이름을 입력해주세요.').max(100),
  account_id: z.string().uuid().optional(),
  amount: amountSchema,
  currency: currencySchema.default('KRW'),
  period_type: budgetPeriodSchema.default('monthly'),
  start_date: dateSchema,
  end_date: dateSchema.optional(),
});

export const updateBudgetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  amount: amountSchema.optional(),
  is_active: z.boolean().optional(),
  end_date: dateSchema.optional(),
});

// 사용자 관련 스키마
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, '이름을 입력해주세요.').max(100),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  default_currency: currencySchema.optional(),
  locale: z.string().max(10).optional(),
});

// 내보내기 옵션 스키마
export const exportOptionsSchema = z.object({
  format: z.enum(['csv', 'pdf', 'xlsx']),
  from_date: dateSchema,
  to_date: dateSchema,
  include_voided: z.boolean().default(false),
});

// 타입 추론
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type SimpleTransactionInput = z.infer<typeof simpleTransactionSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ExportOptions = z.infer<typeof exportOptionsSchema>;

// 유효성 검증 헬퍼
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const result = passwordSchema.safeParse(password);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.errors.map((e) => e.message),
  };
}

export function validateAmount(amount: number): boolean {
  return amountSchema.safeParse(amount).success;
}

export function validateDate(date: string): boolean {
  return dateSchema.safeParse(date).success;
}
