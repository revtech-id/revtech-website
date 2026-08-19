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

export function formatLastSeen(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && 
                        date.getMonth() === yesterday.getMonth() && 
                        date.getFullYear() === yesterday.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (isToday) {
      return `hari ini pukul ${timeStr}`;
    }
    if (isYesterday) {
      return `kemarin pukul ${timeStr}`;
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year} pukul ${timeStr}`;
  } catch (e) {
    return dateStr;
  }
}
