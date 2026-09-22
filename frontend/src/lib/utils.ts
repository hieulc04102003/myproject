import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility: Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency to Vietnamese Dong
 */
export function formatCurrency(amount: number | null | undefined): string {
  const numericAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numericAmount);
}

/**
 * Generate unique ID for cart items based on product + selected options
 */
export function generateCartItemId(productId: string, selectedOptions: { optionGroupId: string; option: { id: string } }[]): string {
  const optionsHash = selectedOptions
    .sort((a, b) => a.optionGroupId.localeCompare(b.optionGroupId))
    .map(opt => `${opt.optionGroupId}:${opt.option.id}`)
    .join('|');
  
  return `${productId}_${optionsHash || 'base'}`;
}

/**
 * Calculate total price for cart item
 */
export function calculateItemPrice(
  basePrice: number,
  selectedOptions: { option: { additionalPrice?: number; priceModifier?: number } }[],
  quantity: number
): number {
  const optionsPrice = selectedOptions.reduce(
    (sum, opt) => sum + (opt.option.priceModifier ?? opt.option.additionalPrice ?? 0),
    0
  );
  return (basePrice + optionsPrice) * quantity;
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
