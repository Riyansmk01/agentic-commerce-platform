import { ReactNode } from "react";
import { cn } from "../lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon, trend, className }: MetricCardProps) {
  return (
    <div className={cn("bg-white border border-slate-200 rounded-xl p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          {trend && (
            <p className={cn("text-xs mt-1.5 font-medium flex items-center gap-1", trend.value >= 0 ? "text-emerald-600" : "text-red-600")}>
              <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
              <span className="text-slate-400 font-normal">{trend.label}</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="text-slate-400 p-2 rounded-lg bg-slate-50 border border-slate-100 ml-3">{icon}</div>
        )}
      </div>
    </div>
  );
}
