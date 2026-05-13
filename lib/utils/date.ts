import { format, getDate, getDaysInMonth, endOfMonth } from 'date-fns';

/**
 * Get current date with dev override support
 *
 * Priority:
 * 1. Environment variable (works on both client and server)
 * 2. localStorage (client-only, for UI testing)
 * 3. Real date
 */
function getCurrentDate(): Date {
  // 1. Check environment variable (works on server and client)
  const envOverride = process.env.NEXT_PUBLIC_DEV_DATE_OVERRIDE;
  if (envOverride) {
    const day = parseInt(envOverride);
    if (!isNaN(day) && day >= 1 && day <= 31) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), day);
    }
  }

  // 2. Check localStorage (client-only)
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('dev_date_override');
    if (override) {
      return new Date(override);
    }
  }

  // 3. Return real date
  return new Date();
}

/**
 * Check if current date is in submission period (1st-24th of month)
 */
export function isSubmissionPeriod(date?: Date): boolean {
  // Dev mode: can completely disable date checks
  if (process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_DISABLE_DATE_CHECK === 'true') {
    return true;
  }

  const currentDate = date || getCurrentDate();
  const day = getDate(currentDate);
  return day >= 1 && day <= 24;
}

/**
 * Check if current date is in voting period (25th-end of month)
 */
export function isVotingPeriod(date?: Date): boolean {
  // Dev mode: can completely disable date checks
  if (process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_DISABLE_DATE_CHECK === 'true') {
    return true;
  }

  const currentDate = date || getCurrentDate();
  const day = getDate(currentDate);
  return day >= 25;
}

/**
 * Get current month-year in YYYY-MM format
 */
export function getCurrentMonthYear(date?: Date): string {
  const currentDate = date || getCurrentDate();
  return format(currentDate, 'yyyy-MM');
}

/**
 * Get last day of current month
 */
export function getLastDayOfMonth(date: Date = new Date()): number {
  return getDaysInMonth(date);
}

/**
 * Get end of month timestamp
 */
export function getEndOfMonth(date: Date = new Date()): Date {
  return endOfMonth(date);
}

/**
 * Check if date is last day of month
 */
export function isLastDayOfMonth(date: Date = new Date()): boolean {
  const day = getDate(date);
  const lastDay = getDaysInMonth(date);
  return day === lastDay;
}
