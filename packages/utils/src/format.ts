// 금액 포맷팅 유틸리티

export interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  compact?: boolean;
  showSign?: boolean;
}

/**
 * 금액을 통화 형식으로 포맷팅
 * @example formatCurrency(1234567) // "₩1,234,567"
 * @example formatCurrency(1234567, { currency: 'USD' }) // "$1,234,567"
 */
export function formatCurrency(
  amount: number,
  options: FormatCurrencyOptions = {}
): string {
  const { currency = 'KRW', locale = 'ko-KR', compact = false, showSign = false } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
  });

  const formatted = formatter.format(Math.abs(amount));

  if (showSign && amount !== 0) {
    return amount > 0 ? `+${formatted}` : `-${formatted}`;
  }

  return amount < 0 ? `-${formatted}` : formatted;
}

/**
 * 숫자를 세 자리 콤마로 포맷팅
 * @example formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(value: number, locale: string = 'ko-KR'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * 퍼센트 포맷팅
 * @example formatPercent(0.1234) // "12.3%"
 * @example formatPercent(12.34, { isRatio: false }) // "12.3%"
 */
export function formatPercent(
  value: number,
  options: { isRatio?: boolean; decimals?: number; showSign?: boolean } = {}
): string {
  const { isRatio = false, decimals = 1, showSign = false } = options;
  const percent = isRatio ? value * 100 : value;
  const formatted = `${percent.toFixed(decimals)}%`;

  if (showSign && percent !== 0) {
    return percent > 0 ? `+${formatted}` : formatted;
  }

  return formatted;
}

/**
 * 금액을 간략하게 표시 (만, 억 단위)
 * @example formatCompactAmount(12345678) // "1,235만원"
 * @example formatCompactAmount(123456789) // "1.2억원"
 */
export function formatCompactAmount(amount: number, currency: string = 'KRW'): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (currency === 'KRW') {
    if (absAmount >= 100000000) {
      return `${sign}${(absAmount / 100000000).toFixed(1)}억원`;
    }
    if (absAmount >= 10000) {
      return `${sign}${formatNumber(Math.round(absAmount / 10000))}만원`;
    }
    return `${sign}${formatNumber(absAmount)}원`;
  }

  // USD 등 기타 통화
  if (absAmount >= 1000000000) {
    return `${sign}$${(absAmount / 1000000000).toFixed(1)}B`;
  }
  if (absAmount >= 1000000) {
    return `${sign}$${(absAmount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 1000) {
    return `${sign}$${(absAmount / 1000).toFixed(1)}K`;
  }
  return `${sign}$${absAmount.toFixed(2)}`;
}

/**
 * 계좌번호 마스킹
 * @example maskAccountNumber("12345678901234") // "1234****1234"
 */
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 8) return accountNumber;
  const start = accountNumber.slice(0, 4);
  const end = accountNumber.slice(-4);
  return `${start}****${end}`;
}

/**
 * 이메일 마스킹
 * @example maskEmail("test@example.com") // "te**@example.com"
 */
export function maskEmail(email: string): string {
  const parts = email.split('@');
  const local = parts[0];
  const domain = parts[1];
  if (!local || !domain) return email;
  const maskedLocal = local.length > 2
    ? local.slice(0, 2) + '*'.repeat(Math.min(local.length - 2, 4))
    : local;
  return `${maskedLocal}@${domain}`;
}

/**
 * 변동률 색상 결정
 */
export function getChangeColor(value: number): string {
  if (value > 0) return '#10B981'; // green
  if (value < 0) return '#EF4444'; // red
  return '#6B7280'; // gray
}

/**
 * 변동 아이콘 결정
 */
export function getChangeIcon(value: number): '▲' | '▼' | '-' {
  if (value > 0) return '▲';
  if (value < 0) return '▼';
  return '-';
}
