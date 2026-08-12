import { useEffect, useState } from "react";
import backend from "~backend/client";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Server, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await backend.admin.getSystemHealth();
      setHealth(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        subtitle="Platform infrastructure health, service metrics, and merchant audit log"
        actions={
          <Button variant="outline" size="sm" onClick={load} className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 h-8 text-xs font-medium">
            <RefreshCw size={13} /> Refresh Metrics
          </Button>
        }
      />

      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-center gap-3">
        <Shield size={16} className="text-amber-600 shrink-0" />
        <span className="text-xs font-medium text-slate-900">Protected Super-Admin Environment — All actions are cryptographically signed & audited</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center gap-2.5 mb-4">
            <Server size={16} className="text-slate-900" />
            <h3 className="text-sm font-semibold text-slate-900">System Telemetry</h3>
          </div>
          {loading ? (
            <div className="h-14 bg-slate-100 rounded animate-pulse" />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Core Platform Status</span>
                <StatusBadge label={health?.status ?? "unknown"} variant={health?.status === "healthy" ? "success" : "error"} dot />
              </div>
              {health?.services && (health.services as Array<{ name: string; status: string; latencyMs: number }>).map(s => (
                <div key={s.name} className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-700 font-medium">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">{s.latencyMs}ms</span>
                    <StatusBadge label={s.status} variant={s.status === "healthy" ? "success" : "warning"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Navigation</h3>
          <div className="space-y-2.5">
            <Link to="/internal/admin/merchants" className="block">
              <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 justify-start h-9 text-xs font-medium">
                Manage Registered Merchants
              </Button>
            </Link>
            <Link to="/internal/admin/webhooks" className="block">
              <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 justify-start h-9 text-xs font-medium">
                Monitor Webhook Deliveries
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Platform Infrastructure</h3>
          <div className="space-y-2.5 text-xs divide-y divide-slate-100">
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">API Protocol Version</span>
              <span className="text-slate-900 font-mono font-semibold">2026-08-01</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Deployment Region</span>
              <span className="text-slate-900 font-medium">SEA (Indonesia)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
