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

  useEffect(() => {
    if (!orgId) return;
    backend.orders.listOrders({ organizationId: orgId, limit: 5 })
      .then(r => { if (r?.orders?.length > 0) setOrders(r.orders); })
      .catch(() => {});
  }, [orgId]);

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
            <div className="text-2xl font-bold text-slate-900">Rp18.420.000</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
            <TrendingUp size={12} /> +18.4%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative overflow-hidden">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Orders Today</div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-slate-900">184</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
            <TrendingUp size={12} /> +4.2%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 bg-indigo-500/10 blur-[40px] rounded-full mix-blend-screen pointer-events-none" />
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-2 flex items-center gap-1.5">
            <SparklesIcon /> Agent Revenue
          </div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-slate-900">Rp7.820.000</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
            <TrendingUp size={12} /> +42%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative overflow-hidden">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Conversion</div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-slate-900">6.8%</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 w-fit px-2 py-0.5 rounded-full">
            <TrendingDown size={12} /> -1.2%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Needs Attention & Analytics */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-sm font-bold tracking-wider uppercase text-slate-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Needs Attention
            </h2>
            
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xs divide-y divide-slate-100">
              <div className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-110 transition-transform">
                  <ShoppingCart size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">14 checkout abandoned</div>
                  <div className="text-xs text-slate-500 mt-1">High abandonment rate detected from Safari mobile users.</div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7">Review</Button>
              </div>

              <div className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 group-hover:scale-110 transition-transform">
                  <Clock size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">Pakasir webhook latency increased</div>
                  <div className="text-xs text-slate-500 mt-1">Payment confirmations are taking &gt;2s on average.</div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7">View Logs</Button>
              </div>

              <div className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
                  <Package size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">8 products low stock</div>
                  <div className="text-xs text-slate-500 mt-1">Velocity Runner X and 7 others have less than 5 units remaining.</div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7">Restock</Button>
              </div>

              <div className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 group-hover:scale-110 transition-transform">
                  <SparklesIcon />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">"running shoes 43" searched 182× but only 1 match</div>
                  <div className="text-xs text-slate-500 mt-1">High intent search query is returning poor results for agents.</div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7">Analyze</Button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xs relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 blur-[80px] mix-blend-screen pointer-events-none" />
            <h3 className="text-sm font-bold tracking-wider uppercase text-indigo-400 mb-6 flex items-center gap-2 relative z-10">
              <SparklesIcon /> AI Operator
            </h3>
            
            <div className="relative z-10">
              <div className="text-lg font-medium text-white mb-2">"Fix products with missing SKU"</div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
                <div className="text-sm text-slate-300 mb-3">Found 82 products without SKU. Proposed changes:</div>
                <div className="font-mono text-xs text-emerald-400 bg-slate-900/50 p-3 rounded border border-slate-800">
                  + 82 SKU generated automatically based on product names.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">Approve 82 changes</Button>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Review manually</Button>
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
              <LiveActivityFeed />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-4 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" /> Merchant Health
            </h3>
            
            <div className="flex items-end gap-2 mb-6">
              <div className="text-3xl font-bold text-slate-900">92</div>
              <div className="text-sm font-medium text-emerald-600 mb-1 flex items-center"><TrendingUp size={14} className="mr-1"/> Excellent</div>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Catalog Health", score: 98, color: "emerald" },
                { name: "Agent Readiness", score: 85, color: "indigo" },
                { name: "API & Webhooks", score: 100, color: "emerald" },
                { name: "Security", score: 90, color: "emerald" }
              ].map(metric => (
                <div key={metric.name}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                    <span>{metric.name}</span>
                    <span>{metric.score}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-${metric.color}-500 rounded-full`} style={{ width: `${metric.score}%` }} />
                  </div>
                </div>
              ))}
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
