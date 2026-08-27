import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(amount?: number | null, currency: string = 'USD', period: string = 'YEARLY') {
  if (!amount) return 'Competitive';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

  const suffix = period === 'YEARLY' ? '/yr' : period === 'MONTHLY' ? '/mo' : '/hr';
  return `${formatted}${suffix}`;
}

export function formatSalaryRange(min?: number | null, max?: number | null, currency: string = 'USD') {
  if (!min && !max) return 'Salary Undisclosed';
  if (min && !max) return `From ${formatSalary(min, currency)}`;
  if (!min && max) return `Up to ${formatSalary(max, currency)}`;
  return `${formatSalary(min, currency)} - ${formatSalary(max, currency)}`;
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
