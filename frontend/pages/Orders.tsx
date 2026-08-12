import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import backend from "~backend/client";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDate } from "../lib/utils";
import { ShoppingCart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "~backend/orders/types";

function paymentVariant(s: string) {
  if (s === "paid") return "success";
  if (s === "pending") return "warning";
  if (s === "failed") return "error";
  return "neutral";
}

function fulfillVariant(s: string) {
  if (s === "fulfilled") return "success";
  if (s === "partially_fulfilled") return "info";
  if (s === "unfulfilled") return "warning";
  if (s === "cancelled") return "error";
  return "neutral";
}

export default function Orders() {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await backend.orders.listOrders({ organizationId: orgId, limit: 50, paymentStatus: statusFilter || undefined });
      setOrders(res?.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [orgId, statusFilter]);

  const displayOrders = orders;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Management"
        subtitle="Order transactions placed via AI agent checkouts and direct links"
        actions={
          <Button variant="outline" size="sm" onClick={load} className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 h-8 text-xs font-medium">
            <RefreshCw size={13} /> Refresh Orders
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs bg-white border border-slate-200 rounded-lg px-3 h-9 text-slate-900 font-medium focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
        >
          <option value="">All Payment Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-100/70 border border-slate-200 animate-pulse" />)}
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-200 bg-grid-pattern shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mx-auto mb-4 text-slate-900">
            <ShoppingCart size={22} />
          </div>
          <div className="text-slate-900 font-semibold mb-1 text-base">No orders logged yet</div>
          <div className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Completed checkouts initiated by AI agents will automatically appear here.
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Total Amount</th>
                <th className="px-4 py-3 font-semibold">Payment Status</th>
                <th className="px-4 py-3 font-semibold">Fulfillment Status</th>
                <th className="px-4 py-3 font-semibold">Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <Link to={`/app/orders/${order.id}`} className="font-mono font-semibold text-slate-900 hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{formatDate(order.placedAt)}</td>
                  <td className="px-4 py-3.5 text-slate-600 font-medium">{order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{formatCurrency(order.totalAmount, order.currency)}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge label={order.paymentStatus} variant={paymentVariant(order.paymentStatus)} dot />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge label={order.fulfillmentStatus.replace("_", " ")} variant={fulfillVariant(order.fulfillmentStatus)} dot />
                  </td>
                  <td className="px-4 py-3.5">
                    {order.sourceAgent ? (
                      <StatusBadge label="AI Agent" variant="info" />
                    ) : (
                      <StatusBadge label={order.source} variant="neutral" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
