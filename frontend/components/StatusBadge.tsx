import { cn } from "../lib/utils";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
};

const dotClasses: Record<BadgeVariant, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-slate-400",
};

export function StatusBadge({ label, variant = "neutral", dot = false }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border",
      variantClasses[variant]
    )}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotClasses[variant])} />}
      {label}
    </span>
  );
}

export function paymentStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    pending: { label: "Pending", variant: "warning" },
    paid: { label: "Paid", variant: "success" },
    failed: { label: "Failed", variant: "error" },
    refunded: { label: "Refunded", variant: "neutral" },
  };
  const cfg = map[status] ?? { label: status, variant: "neutral" as BadgeVariant };
  return <StatusBadge label={cfg.label} variant={cfg.variant} dot />;
}

export function fulfillmentStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    unfulfilled: { label: "Unfulfilled", variant: "warning" },
    partially_fulfilled: { label: "Partial", variant: "info" },
    fulfilled: { label: "Fulfilled", variant: "success" },
    shipped: { label: "Shipped", variant: "info" },
    delivered: { label: "Delivered", variant: "success" },
    cancelled: { label: "Cancelled", variant: "error" },
  };
  const cfg = map[status] ?? { label: status, variant: "neutral" as BadgeVariant };
  return <StatusBadge label={cfg.label} variant={cfg.variant} dot />;
}
