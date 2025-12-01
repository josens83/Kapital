// 날짜 유틸리티
import {
  format,
  formatDistanceToNow,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfWeek,
  endOfWeek,
  subMonths,
  subYears,
  addMonths,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';

export type DateFormat = 'full' | 'long' | 'medium' | 'short' | 'iso';

/**
 * 날짜 포맷팅
 * @example formatDate(new Date()) // "2024년 1월 15일"
 * @example formatDate(new Date(), 'short') // "1/15"
 */
export function formatDate(
  date: Date | string,
  formatType: DateFormat = 'medium',
  locale: string = 'ko'
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const dateLocale = locale === 'ko' ? ko : undefined;

  switch (formatType) {
    case 'full':
      return format(d, 'yyyy년 M월 d일 EEEE', { locale: dateLocale });
    case 'long':
      return format(d, 'yyyy년 M월 d일', { locale: dateLocale });
    case 'medium':
      return format(d, 'M월 d일', { locale: dateLocale });
    case 'short':
      return format(d, 'M/d', { locale: dateLocale });
    case 'iso':
      return format(d, 'yyyy-MM-dd');
    default:
      return format(d, 'M월 d일', { locale: dateLocale });
  }
}

/**
 * 상대적 날짜 표시
 * @example formatRelativeDate(yesterday) // "어제"
 * @example formatRelativeDate(lastWeek) // "5일 전"
 */
export function formatRelativeDate(date: Date | string, locale: string = 'ko'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const dateLocale = locale === 'ko' ? ko : undefined;

  if (isToday(d)) return '오늘';
  if (isYesterday(d)) return '어제';

  return formatDistanceToNow(d, { addSuffix: true, locale: dateLocale });
}

/**
 * 스마트 날짜 포맷팅 (상황에 따라 다르게 표시)
 */
export function formatSmartDate(date: Date | string, locale: string = 'ko'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(d)) return '오늘';
  if (isYesterday(d)) return '어제';
  if (isThisWeek(d)) return formatDate(d, 'medium', locale);
  if (isThisYear(d)) return formatDate(d, 'medium', locale);
  return formatDate(d, 'long', locale);
}

/**
 * 월 이름 가져오기
 */
export function getMonthName(month: number, locale: string = 'ko'): string {
  const date = new Date(2024, month - 1, 1);
  return format(date, 'M월', { locale: locale === 'ko' ? ko : undefined });
}

/**
 * 기간 문자열 생성
 * @example getPeriodString(2024, 1) // "2024년 1월"
 */
export function getPeriodString(year: number, month: number, locale: string = 'ko'): string {
  if (locale === 'ko') {
    return `${year}년 ${month}월`;
  }
  const date = new Date(year, month - 1, 1);
  return format(date, 'MMMM yyyy');
}

/**
 * 이번 달 시작/종료 날짜
 */
export function getThisMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
}

/**
 * 지난 달 시작/종료 날짜
 */
export function getLastMonthRange(): { start: Date; end: Date } {
  const lastMonth = subMonths(new Date(), 1);
  return {
    start: startOfMonth(lastMonth),
    end: endOfMonth(lastMonth),
  };
}

/**
 * 올해 시작/종료 날짜
 */
export function getThisYearRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfYear(now),
    end: endOfYear(now),
  };
}

/**
 * 지난 N개월 범위
 */
export function getLastNMonthsRange(n: number): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfMonth(subMonths(now, n - 1)),
    end: endOfMonth(now),
  };
}

/**
 * 이번 주 시작/종료 날짜
 */
export function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 0 }),
    end: endOfWeek(now, { weekStartsOn: 0 }),
  };
}

/**
 * 날짜 범위를 ISO 문자열로 변환
 */
export function toISODateRange(range: { start: Date; end: Date }): { from: string; to: string } {
  return {
    from: format(range.start, 'yyyy-MM-dd'),
    to: format(range.end, 'yyyy-MM-dd'),
  };
}

/**
 * 특정 월의 날짜 범위
 */
export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const date = new Date(year, month - 1, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

/**
 * 날짜가 특정 범위 내에 있는지 확인
 */
export function isDateInRange(date: Date | string, start: Date, end: Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d >= start && d <= end;
}

/**
 * 오늘 날짜 ISO 문자열
 */
export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * 월의 첫째 날 ISO 문자열
 */
export function getFirstDayOfMonthISO(year?: number, month?: number): string {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  return `${y}-${String(m).padStart(2, '0')}-01`;
}

/**
 * 월의 마지막 날 ISO 문자열
 */
export function getLastDayOfMonthISO(year?: number, month?: number): string {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  const lastDay = new Date(y, m, 0).getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}
