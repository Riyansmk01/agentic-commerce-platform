import { cn } from "../lib/utils";

interface ReadinessMeterProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score < 30) return "text-red-600";
  if (score < 60) return "text-amber-600";
  if (score < 85) return "text-slate-900";
  return "text-emerald-600";
}

function getScoreStatus(score: number): string {
  if (score < 30) return "Incomplete";
  if (score < 60) return "Needs Attention";
  if (score < 85) return "Ready for Testing";
  return "Strong";
}

function getBadgeBg(score: number): string {
  if (score < 30) return "bg-red-50 text-red-700 border-red-200";
  if (score < 60) return "bg-amber-50 text-amber-700 border-amber-200";
  if (score < 85) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function getBarColor(score: number): string {
  if (score < 30) return "bg-red-500";
  if (score < 60) return "bg-amber-500";
  if (score < 85) return "bg-slate-900";
  return "bg-emerald-500";
}

export function ReadinessMeter({ score, size = "md", showLabel = true }: ReadinessMeterProps) {
  const textSizes = { sm: "text-xl", md: "text-3xl", lg: "text-5xl" };

  return (
    <div className="flex flex-col items-center gap-2.5 w-full">
      <div className={cn("font-semibold tabular-nums tracking-tight", textSizes[size], getScoreColor(score))}>
        {score}
        <span className="text-slate-400 text-base font-normal">/100</span>
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-md border", getBadgeBg(score))}>
          {getScoreStatus(score)}
        </span>
      )}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 mt-1">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
