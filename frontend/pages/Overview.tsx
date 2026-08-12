import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import backend from "~backend/client";
import { MetricCard } from "../components/MetricCard";
import { ReadinessMeter } from "../components/ReadinessMeter";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { OrderDrawer } from "../components/OrderDrawer";
import { formatCurrency, formatRelativeTime } from "../lib/utils";
import { BarChart2, ShoppingCart, Package, TrendingUp, Zap, ArrowRight, AlertCircle, Plus, Upload, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Order } from "~backend/orders/types";

function paymentVariant(s: string) {
  if (s === "paid") return "success" as const;
  if (s === "pending") return "warning" as const;
  if (s === "failed") return "error" as const;
  return "neutral" as const;
}


export default function Overview() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>({ totalAgentRequests: 0, productLookups: 0, checkoutsCreated: 0, avgLatencyMs: 0 });
  const [readiness, setReadiness] = useState<any>({ total: 0, status: "not_ready" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const orgId = user?.organizationId;

  useEffect(() => {
    if (!orgId) return;
    backend.analytics.getDashboardMetrics({ organizationId: orgId, days: 30 })
      .then(r => { if (r?.metrics) setMetrics(r.metrics); })
      .catch(() => {});
    backend.readiness.getReadinessScore({ organizationId: orgId })
      .then(r => { if (r?.score) setReadiness(r.score); })
      .catch(() => {});
    backend.orders.listOrders({ organizationId: orgId, limit: 5 })
      .then(r => { if (r?.orders?.length > 0) setOrders(r.orders); })
      .catch(() => {});
  }, [orgId]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good morning${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        subtitle="Overview of your merchant catalog, order pipeline, and AI agent readiness."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Agent Requests" value={metrics?.totalAgentRequests ?? 0}
          icon={<BarChart2 size={18} />} subtitle="Last 30 days" trend={{ value: 0, label: "vs last mo" }} />
        <MetricCard title="Product Lookups" value={metrics?.productLookups ?? 0}
          icon={<Package size={18} />} trend={{ value: 0, label: "vs last mo" }} />
        <MetricCard title="Checkouts" value={metrics?.checkoutsCreated ?? 0}
          icon={<ShoppingCart size={18} />} trend={{ value: 0, label: "vs last mo" }} />
        <MetricCard title="Avg Latency" value={metrics?.avgLatencyMs ? `${Math.round(metrics.avgLatencyMs)}ms` : "0ms"}
          icon={<Zap size={18} />} />
        <MetricCard title="Readiness Score"
          value={readiness?.total ?? 0}
          icon={<TrendingUp size={18} />}
          subtitle={readiness?.status?.replace("_", " ") ?? "Not Ready"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Container */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Orders</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click any order to inspect timeline & drawer details</p>
            </div>
            <div className="flex gap-2">
              <Link to="/app/catalog/new">
                <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50">
                  <Plus size={13} /> Product
                </Button>
              </Link>
              <Link to="/app/orders">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-600 hover:text-slate-900">
                  View all <ArrowRight size={12} />
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => handleOrderClick(order)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5">
                      <span className="text-slate-900 font-mono font-bold hover:underline">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-600">{order.items?.length ?? 0}</td>
                    <td className="py-3.5 text-slate-900 font-bold">{formatCurrency(order.totalAmount, order.currency)}</td>
                    <td className="py-3.5">
                      <StatusBadge label={order.paymentStatus} variant={paymentVariant(order.paymentStatus)} dot />
                    </td>
                    <td className="py-3.5 text-slate-500">{formatRelativeTime(order.placedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Live Feed & Readiness */}
        <div className="space-y-6">
          {/* Live Activity Stream */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-semibold text-slate-900">Live Activity Feed</h3>
              </div>
              <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">REALTIME</span>
            </div>
            <div className="space-y-3">
              {[]}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Agent Readiness Score</h3>
              <Link to="/app/agent-readiness">
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 h-7 text-xs p-0">
                  Details <ArrowRight size={11} />
                </Button>
              </Link>
            </div>
            <ReadinessMeter score={readiness?.total ?? 0} />
          </div>
        </div>
      </div>

      <OrderDrawer order={selectedOrder} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
