import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import backend from "~backend/client";
import { OrderDrawer } from "../components/OrderDrawer";
import { LiveActivityFeed } from "../components/LiveActivityFeed";
import { formatCurrency } from "../lib/utils";
import { TrendingUp, AlertTriangle, ArrowRight, Package, Clock, ShieldCheck, TrendingDown, DollarSign, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Order } from "~backend/orders/types";

export default function Overview() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const orgId = user?.organizationId;

  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (!orgId) return;
    
    // Fetch dashboard metrics
    backend.analytics.getDashboardMetrics({ organizationId: orgId, days: 1 })
      .then(r => setMetrics(r.metrics))
      .catch(() => {});

    // Fetch orders for revenue and live feed
    backend.orders.listOrders({ organizationId: orgId, limit: 10 })
      .then(r => { if (r?.orders?.length > 0) setOrders(r.orders); })
      .catch(() => {});
  }, [orgId]);

  const ordersToday = orders.length;
  const revenueToday = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const agentRevenue = orders.filter(o => o.sourceAgent).reduce((sum, o) => sum + o.totalAmount, 0);
  
  // Calculate a mock conversion based on checkouts vs lookups (or default 0)
  const totalRequests = metrics?.totalAgentRequests || 0;
  const checkouts = metrics?.checkoutsCreated || 0;
  const conversion = totalRequests > 0 ? ((checkouts / totalRequests) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Good evening{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-slate-500 text-sm">Here is what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative overflow-hidden">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Revenue Today</div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(revenueToday, "IDR")}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative overflow-hidden">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Recent Orders</div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-slate-900">{ordersToday}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 bg-indigo-500/10 blur-[40px] rounded-full mix-blend-screen pointer-events-none" />
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-2 flex items-center gap-1.5">
            <SparklesIcon /> Agent Revenue
          </div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(agentRevenue, "IDR")}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative overflow-hidden">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Conversion</div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-slate-900">{conversion}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Analytics Stats */}
        <div className="space-y-8">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xs relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 blur-[80px] mix-blend-screen pointer-events-none" />
            <h3 className="text-sm font-bold tracking-wider uppercase text-indigo-400 mb-6 flex items-center gap-2 relative z-10">
              <SparklesIcon /> AI Agent Performance
            </h3>
            
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Requests</span>
                <span className="text-white font-medium">{metrics?.totalAgentRequests || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Product Lookups</span>
                <span className="text-white font-medium">{metrics?.productLookups || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Checkouts Created</span>
                <span className="text-white font-medium">{metrics?.checkoutsCreated || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-800">
                <span className="text-slate-400">Avg Latency</span>
                <span className="text-white font-mono text-xs bg-slate-800 px-2 py-1 rounded">{metrics?.avgLatencyMs ? `${metrics.avgLatencyMs.toFixed(0)}ms` : '0ms'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Feed & Health */}
        <div className="space-y-8">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-wider uppercase text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> 
                Live Activity
              </h2>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <LiveActivityFeed orders={orders} />
            </div>
          </div>

        </div>
      </div>

      <OrderDrawer order={selectedOrder} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
