import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import backend from "~backend/client";
import { PageHeader } from "../components/PageHeader";
import { MetricCard } from "../components/MetricCard";
import { Button } from "@/components/ui/button";
import { BarChart2, Zap, Package, ShoppingCart, RefreshCw, TrendingUp } from "lucide-react";

interface Metrics {
  totalAgentRequests: number;
  productLookups: number;
  checkoutsCreated: number;
  avgLatencyMs: number;
  topOperations: Array<{ operation: string; count: number }>;
  requestsOverTime: Array<{ date: string; count: number }>;
}

export default function Analytics() {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? "";
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const load = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await backend.analytics.getDashboardMetrics({ organizationId: orgId, days });
      setMetrics(res.metrics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [orgId, days]);

  const maxCount = (metrics?.requestsOverTime ?? []).reduce((m, r) => Math.max(m, r.count), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Telemetry"
        subtitle="Agent request volume, catalog query performance, and checkout conversion"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 h-8 text-slate-900 font-medium focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <Button variant="outline" size="sm" onClick={load} className="border-slate-200 text-slate-700 hover:bg-slate-50 h-8 text-xs font-medium">
              <RefreshCw size={13} />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Agent Requests"
          value={loading ? "—" : (metrics?.totalAgentRequests ?? 0)}
          icon={<BarChart2 size={16} />}
          subtitle={`Past ${days} days`}
        />
        <MetricCard
          title="Product Lookups"
          value={loading ? "—" : (metrics?.productLookups ?? 0)}
          icon={<Package size={16} />}
        />
        <MetricCard
          title="Checkouts Created"
          value={loading ? "—" : (metrics?.checkoutsCreated ?? 0)}
          icon={<ShoppingCart size={16} />}
        />
        <MetricCard
          title="Avg Latency"
          value={loading ? "—" : `${Math.round(metrics?.avgLatencyMs ?? 0)}ms`}
          icon={<Zap size={16} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Agent Requests Over Time</h3>
          {loading ? (
            <div className="h-36 flex items-end gap-1.5 animate-pulse">
              {[...Array(14)].map((_, i) => (
                <div key={i} className="flex-1 bg-slate-100 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }} />
              ))}
            </div>
          ) : (metrics?.requestsOverTime ?? []).length === 0 ? (
            <div className="h-36 flex flex-col items-center justify-center text-slate-400 text-xs">
              <TrendingUp size={24} className="mb-2 text-slate-300" />
              <span>No telemetry data collected in this date range</span>
            </div>
          ) : (
            <div className="flex items-end gap-1.5 h-36 pt-6">
              {(metrics?.requestsOverTime ?? []).map(({ date, count }) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-slate-900 hover:bg-slate-800 rounded-t transition-colors"
                      style={{ height: `${(count / maxCount) * 112}px` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {count}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono rotate-45 origin-left mt-1">{date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Top Agent Operations</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : (metrics?.topOperations ?? []).length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">No operation logs</div>
          ) : (
            <div className="space-y-3.5">
              {(metrics?.topOperations ?? []).map(({ operation, count }) => (
                <div key={operation}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-900 font-mono text-[11px] font-medium">{operation}</span>
                    <span className="text-slate-500 font-semibold text-xs">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div
                      className="h-full bg-slate-900 rounded-full"
                      style={{ width: `${(count / ((metrics?.topOperations ?? [])[0]?.count ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
