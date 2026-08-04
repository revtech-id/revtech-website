import { cn } from "@/lib/utils";

// ── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  iconColor?: string;
  iconBg?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  href?: string;
  sparkline?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  iconColor = "#2563EB",
  iconBg,
  trend,
  trendLabel,
  href,
  sparkline,
}: StatCardProps) {
  const defaultIconBg = iconBg ?? `${iconColor}18`;
  
  const CardWrapper = href ? "a" : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <CardWrapper
      {...wrapperProps}
      style={{
        background: "var(--adm-card)",
        boxShadow: "var(--adm-shadow)",
      }}
      className="group rounded-2xl p-5 block transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500/50 cursor-pointer relative overflow-hidden"
    >
      {/* Sparkline Background Placeholder */}
      {sparkline && (
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 pointer-events-none">
          {sparkline}
        </div>
      )}
      
      <div className="flex items-start justify-between mb-3 relative z-10">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--adm-text-2)" }}>
          {label}
        </p>
        <div className="w-8 h-8 flex items-center justify-end shrink-0 relative">
          <span
            className="material-symbols-outlined text-[20px] transition-all duration-300 group-hover:opacity-0 group-hover:-translate-x-2"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400", color: "var(--adm-text)" }}
          >
            {icon}
          </span>
          <span
            className="material-symbols-outlined text-[20px] absolute opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
            style={{ color: "var(--adm-text)" }}
          >
            arrow_forward
          </span>
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-2xl font-bold leading-tight" style={{ color: "var(--adm-text)" }}>
          {value}
        </p>
      {sub && (
        <p className="text-xs mt-0.5" style={{ color: "var(--adm-text-3)" }}>
          {sub}
        </p>
      )}
      {trend && trendLabel && (
        <div className="flex items-center gap-1 mt-2">
          <span
            className="material-symbols-outlined text-[12px]"
            style={{
              color:
                trend === "up"
                  ? "var(--adm-success)"
                  : trend === "down"
                  ? "var(--adm-danger)"
                  : "var(--adm-text-3)",
            }}
          >
            {trend === "up" ? "trending_up" : trend === "down" ? "trending_down" : "trending_flat"}
          </span>
          <span
            className="text-[11px] font-semibold"
            style={{
              color:
                trend === "up"
                  ? "var(--adm-success)"
                  : trend === "down"
                  ? "var(--adm-danger)"
                  : "var(--adm-text-3)",
            }}
          >
            {trendLabel}
          </span>
        </div>
      )}
      </div>
    </CardWrapper>
  );
}

// ── DonutStatCard ─────────────────────────────────────────────────────────────

export interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface DonutStatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  segments: DonutSegment[];
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}

export function DonutChart({ segments, size = 64, strokeWidth = 8 }: { segments: DonutSegment[]; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth - 2) / 2;
  const circ = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--adm-border)" strokeWidth={strokeWidth} />
      {segments.map((seg, i) => {
        const pct = seg.value / (total || 1);
        const dash = pct * circ;
        const gap = circ - dash;
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circ}
            strokeLinecap="round"
          />
        );
        offset += pct;
        return el;
      })}
    </svg>
  );
}

export function DonutStatCard({
  label,
  value,
  sub,
  segments,
  trend,
  trendLabel,
}: DonutStatCardProps) {
  return (
    <div
      style={{
        background: "var(--adm-card)",
        border: "1px solid var(--adm-border)",
        boxShadow: "var(--adm-shadow)",
      }}
      className="rounded-2xl p-5 transition-all duration-200 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--adm-text-2)" }}>
            {label}
          </p>
          <p className="text-2xl font-bold leading-tight" style={{ color: "var(--adm-text)" }}>
            {value}
          </p>
          {sub && (
            <p className="text-xs mt-0.5" style={{ color: "var(--adm-text-3)" }}>
              {sub}
            </p>
          )}
          {trend && trendLabel && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className="material-symbols-outlined text-[13px]"
                style={{ color: trend === "up" ? "var(--adm-success)" : trend === "down" ? "var(--adm-danger)" : "var(--adm-text-3)" }}
              >
                {trend === "up" ? "trending_up" : trend === "down" ? "trending_down" : "trending_flat"}
              </span>
              <span className="text-xs font-semibold" style={{ color: trend === "up" ? "var(--adm-success)" : trend === "down" ? "var(--adm-danger)" : "var(--adm-text-3)" }}>
                {trendLabel}
              </span>
            </div>
          )}
          {/* Legend */}
          <div className="mt-3 flex flex-col gap-1">
            {segments.map((seg) => (
              <div key={seg.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
                <span className="text-[10px]" style={{ color: "var(--adm-text-3)" }}>{seg.label}</span>
              </div>
            ))}
          </div>
        </div>
        <DonutChart segments={segments} size={68} />
      </div>
    </div>
  );
}

// ── ProgressRingCard ──────────────────────────────────────────────────────────

interface ProgressRingCardProps {
  label: string;
  value: string;
  sub?: string;
  percent: number;
  color: string;
  legendMain?: string;
  legendSub?: string;
  badge?: string;
  badgeColor?: string;
}

function ProgressRing({ percent, color, size = 80, strokeWidth = 10 }: { percent: number; color: string; size?: number, strokeWidth?: number }) {
  const r = (size - strokeWidth - 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--adm-border)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
    </svg>
  );
}

export function ProgressRingCard({ label, value, sub, percent, color, legendMain, legendSub, badge, badgeColor }: ProgressRingCardProps) {
  return (
    <div
      style={{
        background: "var(--adm-card)",
        boxShadow: "var(--adm-shadow)",
      }}
      className="rounded-2xl p-6 transition-all duration-200 hover:shadow-lg h-full flex flex-col justify-between"
    >
      {/* Bagian Atas: Label & Value */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold text-left" style={{ color: "var(--adm-text-2)" }}>
            {label}
          </p>
          {badge && (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: `${badgeColor ?? color}15`, color: badgeColor ?? color }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-[32px] leading-tight font-bold tracking-tight mt-2 text-left" style={{ color: "var(--adm-text)" }}>{value}</p>
        {sub && <p className="text-[12px] mt-1 text-left font-medium" style={{ color: "var(--adm-text-3)" }}>{sub}</p>}
      </div>

      {/* Bagian Bawah: Legend & Diagram */}
      <div className="flex items-end justify-between mt-8">
        <div className="flex flex-col gap-2 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-[10px] font-bold w-6" style={{ color: "var(--adm-text)" }}>{percent}%</span>
            <span className="text-[10px]" style={{ color: "var(--adm-text-3)" }}>{legendMain || "Selesai"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: "var(--adm-border)" }} />
            <span className="text-[10px] font-bold w-6" style={{ color: "var(--adm-text)" }}>{100 - percent}%</span>
            <span className="text-[10px]" style={{ color: "var(--adm-text-3)" }}>{legendSub || "Sisa"}</span>
          </div>
        </div>

        <div className="relative shrink-0">
          <ProgressRing percent={percent} color={color} size={110} strokeWidth={18} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[16px] font-bold" style={{ color: "var(--adm-text)" }}>{percent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

type BadgeVariant = "emerald" | "amber" | "indigo" | "rose" | "slate" | "blue" | "purple";

const BADGE_COLORS: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  emerald: { bg: "rgba(16,185,129,0.12)", text: "#059669", border: "rgba(16,185,129,0.25)" },
  amber:   { bg: "rgba(245,158,11,0.12)", text: "#D97706", border: "rgba(245,158,11,0.25)" },
  indigo:  { bg: "rgba(99,102,241,0.12)", text: "#6366F1", border: "rgba(99,102,241,0.25)" },
  rose:    { bg: "rgba(239,68,68,0.12)",  text: "#DC2626", border: "rgba(239,68,68,0.25)" },
  slate:   { bg: "rgba(100,116,139,0.1)", text: "#64748B", border: "rgba(100,116,139,0.2)" },
  blue:    { bg: "rgba(59,130,246,0.12)", text: "#2563EB", border: "rgba(59,130,246,0.25)" },
  purple:  { bg: "rgba(139,92,246,0.12)", text: "#7C3AED", border: "rgba(139,92,246,0.25)" },
};

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
}

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  const c = BADGE_COLORS[variant];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      {label}
    </span>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: string;
}

export function PageHeader({ title, description, action, icon }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--adm-accent)" }}
          >
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {icon}
            </span>
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--adm-text)" }}>{title}</h1>
          {description && <p className="text-sm mt-0.5" style={{ color: "var(--adm-text-2)" }}>{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ── AdminTable ────────────────────────────────────────────────────────────────

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function AdminTable<T extends object>({
  columns,
  data,
  keyField,
  onRowClick,
  emptyMessage = "Tidak ada data",
}: AdminTableProps<T>) {
  return (
    <div
      style={{ background: "var(--adm-card)", boxShadow: "var(--adm-shadow)" }}
      className="rounded-2xl overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--adm-bg)" }}>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide", col.className)}
                  style={{ color: "var(--adm-text-3)" }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm" style={{ color: "var(--adm-text-3)" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={String(row[keyField as keyof T])}
                  onClick={() => onRowClick?.(row)}
                  style={{}}
                  className={cn("transition-colors", onRowClick ? "cursor-pointer" : "")}
                  onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.background = "var(--adm-card-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn("px-4 py-3.5", col.className)}
                      style={{ color: "var(--adm-text)" }}
                    >
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── AdminCard ─────────────────────────────────────────────────────────────────

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export function AdminCard({ children, className, title, action, style }: AdminCardProps) {
  return (
    <div
      className={cn("rounded-2xl overflow-hidden", className)}
      style={{
        background: "var(--adm-card)",
        boxShadow: "var(--adm-shadow)",
        ...style,
      }}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          {title && <h3 className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "var(--adm-bg)" }}
      >
        <span className="material-symbols-outlined text-[32px]" style={{ color: "var(--adm-text-3)" }}>{icon}</span>
      </div>
      <h3 className="text-base font-semibold" style={{ color: "var(--adm-text)" }}>{title}</h3>
      {description && <p className="text-sm mt-1.5 max-w-xs" style={{ color: "var(--adm-text-2)" }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── AdminToolbar ─────────────────────────────────────────────────────────────

interface AdminToolbarProps {
  view: "list" | "form";
  onBack: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  dropdown?: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  addIcon?: string;
}

export function AdminToolbar({
  view,
  onBack,
  search,
  onSearchChange,
  searchPlaceholder = "Cari...",
  dropdown,
  onAdd,
  addLabel = "Baru",
  addIcon = "add",
}: AdminToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-2">
      {view === "list" ? (
        <>
          <div className="flex items-center flex-1 max-w-full sm:max-w-[460px] rounded-full bg-[var(--adm-card)] shadow-[var(--adm-shadow)] transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
            {dropdown && (
              <>
                {dropdown}
                <div className="w-px h-5 bg-[var(--adm-border)] shrink-0" />
              </>
            )}
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent pl-4 pr-10 py-2.5 text-sm focus:outline-none text-[var(--adm-text)] placeholder-[var(--adm-text-3)]"
              />
              <span className="material-symbols-outlined absolute right-3 text-[var(--adm-text-3)] text-[18px] pointer-events-none">search</span>
            </div>
          </div>
          
          {onAdd && (
            <button
              onClick={onAdd}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 px-2 py-2 text-[var(--adm-text-2)] hover:text-[var(--adm-text)] text-sm font-semibold active:scale-95 transition-all w-full sm:w-auto mt-2 sm:mt-0"
            >
              <span className="material-symbols-outlined text-[18px]">{addIcon}</span>
              <span className="hidden sm:inline">{addLabel}</span>
            </button>
          )}
        </>
      ) : (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-1 py-2 text-sm font-medium transition-all text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali
        </button>
      )}
    </div>
  );
}
