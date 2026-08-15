/**
 * Activity Log — Central system for tracking admin & user activities.
 * All events are stored in localStorage under "revtech_activity_log".
 * The Notification Popover reads from this key.
 */

export type ActivityType =
  | "lead_created"          // New lead from public form
  | "lead_added"            // Lead added manually by admin
  | "lead_status_changed"   // Lead status changed
  | "lead_deal"             // Lead marked as deal (DP/payment confirmed)
  | "lead_paid_full"        // Lead fully paid
  | "order_status_changed"  // Order stage changed
  | "order_lunas"           // Order fully paid
  | "order_handover"        // Order handed over / completed
  | "invoice_paid"          // Invoice paid
  | "client_added"          // Maintenance client added
  | "login"                 // Admin login
  | "system"                // Generic system event
  | "profile_updated"       // Admin updated their profile
  // Legacy types from static activity-log.json
  | "order_created"
  | "order_status"
  | "order_completed"
  | "studio_export"
  | "testimonial_updated"
  | "testimonial_deleted"
  | "blog_updated"
  | "blog_deleted"
  | "portofolio_updated"
  | "portofolio_deleted";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  notify?: boolean;
}

import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const IMPORTANT_NOTIFICATION_TYPES: ActivityType[] = [
  "lead_created", "lead_added", "lead_deal", "lead_paid_full",
  "order_created", "order_status_changed", "order_lunas", "order_handover",
  "invoice_paid"
];

export async function logActivity(entry: Omit<ActivityEntry, "id" | "timestamp">) {
  if (typeof window === "undefined") return;

  try {
    const notify = entry.notify !== undefined ? entry.notify : IMPORTANT_NOTIFICATION_TYPES.includes(entry.type);
    await addDoc(collection(db, "activity_logs"), {
      ...entry,
      notify,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to log activity to Firestore", err);
  }
}

// Keep a helper for backward compatibility / sync UI if needed, but components should use onSnapshot directly.
export function getActivityLog(): ActivityEntry[] {
  return [];
}
