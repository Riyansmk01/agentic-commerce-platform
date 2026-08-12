import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backend from "~backend/client";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "../lib/utils";
import { ArrowLeft, Package, Bot } from "lucide-react";
import type { Order } from "~backend/orders/types";

function paymentVariant(s: string) {
  if (s === "paid") return "success" as const;
  if (s === "pending") return "warning" as const;
  if (s === "failed") return "error" as const;
  return "neutral" as const;
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingFulfillment, setUpdatingFulfillment] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    backend.orders.getOrder({ id: orderId })
      .then(r => { if (r?.order) setOrder(r.order); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  const updateFulfillment = async (status: string) => {
    if (!orderId) return;
    setUpdatingFulfillment(true);
    try {
      await backend.orders.updateFulfillmentStatus({ id: orderId, fulfillmentStatus: status });
      const res = await backend.orders.getOrder({ id: orderId });
      setOrder(res.order);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingFulfillment(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-24 text-slate-500 font-medium text-sm">Order record not found</div>
  );

  const customer = order.customerSnapshot as Record<string, string>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed on ${formatDate(order.placedAt)}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/app/orders")} className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 h-8 text-xs font-medium">
            <ArrowLeft size={14} /> Back to Orders
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Purchased Items</h3>
            <div className="divide-y divide-slate-100">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                    <Package size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900">{item.titleSnapshot}</div>
                    {item.skuSnapshot && <div className="text-[11px] text-slate-400 font-mono">SKU: {item.skuSnapshot}</div>}
                    <div className="text-xs text-slate-500 mt-0.5">
                      {formatCurrency(item.unitAmount, order.currency)} × {item.quantity}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {formatCurrency(item.lineAmount, order.currency)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotalAmount, order.currency)}</span>
              </div>
              {order.shippingAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shippingAmount, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span>{formatCurrency(order.totalAmount, order.currency)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Fulfillment Status</h3>
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge
                label={order.fulfillmentStatus.replace("_", " ")}
                variant={order.fulfillmentStatus === "fulfilled" ? "success" : order.fulfillmentStatus === "unfulfilled" ? "warning" : "neutral"}
                dot
              />
            </div>
            {order.fulfillmentStatus !== "fulfilled" && order.paymentStatus === "paid" && (
              <div className="flex gap-2.5">
                <Button
                  size="sm"
                  onClick={() => updateFulfillment("fulfilled")}
                  disabled={updatingFulfillment}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white h-8 text-xs font-medium"
                >
                  Mark Fulfilled
                </Button>
                {order.fulfillmentStatus !== "partially_fulfilled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateFulfillment("partially_fulfilled")}
                    disabled={updatingFulfillment}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 h-8 text-xs font-medium"
                  >
                    Mark Partial
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Payment Status</h3>
            <StatusBadge label={order.paymentStatus} variant={paymentVariant(order.paymentStatus)} dot />
            {order.paidAt && (
              <div className="text-xs text-slate-500 mt-2 font-medium">Paid on {formatDate(order.paidAt)}</div>
            )}
          </div>

          {(customer?.name || customer?.email) && (
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Customer Information</h3>
              {customer.name && <div className="text-xs font-semibold text-slate-900">{customer.name}</div>}
              {customer.email && <div className="text-xs text-slate-500 font-mono mt-0.5">{customer.email}</div>}
            </div>
          )}

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Transaction Origin</h3>
            {order.sourceAgent ? (
              <div className="flex items-center gap-2.5">
                <Bot size={16} className="text-slate-900" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">AI Agent Transaction</div>
                  <div className="text-[11px] text-slate-500 font-mono">{order.sourceAgent}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-700 font-medium">{order.source}</div>
            )}
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Metadata</h3>
            <div className="text-[11px] text-slate-400 font-mono">ID: {order.id}</div>
            <div className="text-xs text-slate-500">Created: {formatDate(order.createdAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
