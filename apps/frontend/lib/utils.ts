import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateDiscount(basicPrice: string, originalPrice?: string): string | null {
  if (!originalPrice) return null;
  const basic = parseInt(basicPrice.replace(/\D/g, ''));
  const original = parseInt(originalPrice.replace(/\D/g, ''));
  
  if (isNaN(basic) || isNaN(original) || original <= basic || original === 0) return null;
  
  const discount = Math.round(((original - basic) / original) * 100);
  return `DISKON ${discount}%`;
}
