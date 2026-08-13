import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatDate } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { Package, Clock, User, X } from "lucide-react";
import type { Order } from "~backend/orders/types";

interface OrderDrawerProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDrawer({ order, open, onOpenChange }: OrderDrawerProps) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Slide-over Drawer Content */}
      <div className="relative z-10 w-full sm:max-w-lg bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-lg">{order.orderNumber}</span>
                <StatusBadge label={order.paymentStatus} variant={order.paymentStatus === "paid" ? "success" : "warning"} dot />
              </div>
              <div className="text-xs text-slate-500 mt-1">Placed on {formatDate(order.placedAt)}</div>
            </div>
            <Button variant="ghost" size="icon-xs" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-700">
              <X size={18} />
            </Button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Customer Snapshot */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <User size={14} className="text-slate-400" /> Customer Information
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Name</span>
                <span className="text-slate-900 font-medium">{(order.customerSnapshot as any)?.name || (order.customerSnapshot as any)?.firstName || "Guest Buyer"}</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-900 font-mono">{(order.customerSnapshot as any)?.email ?? "—"}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-900">Purchased Items</div>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
                {order.items?.map(item => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                        <Package size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{item.titleSnapshot}</div>
                        <div className="text-[11px] text-slate-400 font-mono">SKU: {item.skuSnapshot || "—"}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">{formatCurrency(item.lineAmount, order.currency)}</div>
                      <div className="text-[11px] text-slate-400">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Timeline */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                <Clock size={14} className="text-slate-400" /> Transaction Timeline
              </div>
              <div className="space-y-3 pl-2 border-l-2 border-slate-200 ml-2">
                <div className="relative pl-4">
                  <div className="absolute -left-[13px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                  <div className="text-xs font-semibold text-slate-900">Checkout Session Created</div>
                  <div className="text-[11px] text-slate-400">Initiated via AI Agent Adapter</div>
                </div>
                <div className="relative pl-4">
                  <div className="absolute -left-[13px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                  <div className="text-xs font-semibold text-slate-900">Payment Settled & Verified</div>
                  <div className="text-[11px] text-slate-400">QRIS / Gateway response received</div>
                </div>
                <div className="relative pl-4">
                  <div className="absolute -left-[13px] top-0.5 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">●</div>
                  <div className="text-xs font-semibold text-slate-900">Order Confirmed</div>
                  <div className="text-[11px] text-slate-400">Recorded in Merchant Database</div>
                </div>
                <div className="relative pl-4">
                  <div className="absolute -left-[13px] top-0.5 w-4 h-4 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[10px]">○</div>
                  <div className="text-xs font-medium text-slate-500">Fulfillment Pending</div>
                  <div className="text-[11px] text-slate-400">Awaiting shipment dispatch</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">Total: {formatCurrency(order.totalAmount, order.currency)}</span>
          <Button size="sm" onClick={() => onOpenChange(false)} className="bg-slate-900 hover:bg-slate-800 text-white h-8 text-xs font-medium">
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
}
