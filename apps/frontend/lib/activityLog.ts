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
  | "testimonial_deleted";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

const KEY = "revtech_activity_log";
const MAX_ENTRIES = 50;

export function logActivity(entry: Omit<ActivityEntry, "id" | "timestamp">) {
  if (typeof window === "undefined") return;

  const existing: ActivityEntry[] = JSON.parse(localStorage.getItem(KEY) || "[]");

  const newEntry: ActivityEntry = {
    ...entry,
    id: `ACT-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  // Prepend and keep max 50 entries
  const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(KEY, JSON.stringify(updated));

  // Notify the notification popover to refresh
  window.dispatchEvent(new Event("activityLogUpdated"));
}

export function getActivityLog(): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}
