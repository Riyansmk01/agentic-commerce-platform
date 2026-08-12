import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import backend from "~backend/client";
import { formatCurrency, formatDate } from "../lib/utils";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Package, Clock, RefreshCw, ShoppingBag, CheckCircle, XCircle } from "lucide-react";
import type { CheckoutSession } from "~backend/checkout/types";

function getStatusVariant(s: string) {
  if (s === "paid") return "success" as const;
  if (s === "open" || s === "payment_pending") return "warning" as const;
  if (s === "expired" || s === "failed" || s === "cancelled") return "error" as const;
  return "neutral" as const;
}

function getStatusLabel(s: string) {
  const map: Record<string, string> = {
    open: "Awaiting Payment",
    payment_pending: "Payment Pending",
    paid: "Payment Confirmed",
    expired: "Expired",
    cancelled: "Cancelled",
    failed: "Failed",
  };
  return map[s] ?? s;
}

function ExpiryCountdown({ expiresAt }: { expiresAt: Date }) {
  const expires = new Date(expiresAt);
  const now = new Date();
  const diffMs = expires.getTime() - now.getTime();
  if (diffMs <= 0) return <span className="text-red-400 text-sm">Expired</span>;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return <span className="text-amber-400 text-sm">Expires in {hours}h {minutes % 60}m</span>;
  return <span className="text-amber-400 text-sm">Expires in {minutes}m</span>;
}

export default function CheckoutPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [checkout, setCheckout] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (quiet = false) => {
    if (!publicId) return;
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await backend.checkout.getCheckoutSession({ publicId });
      setCheckout(res.session);
    } catch (e: any) {
      setError(e.message ?? "Checkout session not found");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [publicId]);

  useEffect(() => {
    if (!checkout) return;
    if (checkout.status === "open" || checkout.status === "payment_pending") {
      const timer = setInterval(() => load(true), 5000);
      return () => clearInterval(timer);
    }
  }, [checkout?.status]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !checkout) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs max-w-sm">
        <XCircle size={44} className="text-red-500 mx-auto mb-3" />
        <div className="text-slate-900 font-semibold mb-1 text-base">{error ?? "Checkout not found"}</div>
        <div className="text-xs text-slate-500">This checkout session may have expired or been cancelled.</div>
      </div>
    </div>
  );

  const isPaid = checkout.status === "paid";
  const isExpiredOrCancelled = checkout.status === "expired" || checkout.status === "cancelled";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 bg-grid-pattern relative">
      <div className="max-w-lg mx-auto py-16 px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <ShoppingBag size={16} />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">Secure Merchant Checkout</span>
          </div>
          <StatusBadge label={getStatusLabel(checkout.status)} variant={getStatusVariant(checkout.status)} dot />
        </div>

        {isPaid && (
          <div className="text-center py-8 mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-2xs">
            <CheckCircle size={52} className="text-emerald-600 mx-auto mb-3" />
            <div className="text-lg font-bold text-slate-900 mb-1">Payment Confirmed</div>
            <div className="text-xs text-slate-600">Your order has been recorded. Thank you for your purchase!</div>
          </div>
        )}

        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs mb-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Order Summary</h3>
          <div className="divide-y divide-slate-100">
            {checkout.items.map(item => (
              <div key={item.variantId} className="flex items-center gap-3 py-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                  <Package size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900">{item.titleSnapshot}</div>
                  {item.skuSnapshot && <div className="text-[11px] text-slate-400 font-mono">SKU: {item.skuSnapshot}</div>}
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatCurrency(item.unitAmount, checkout.currency)} × {item.quantity}
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {formatCurrency(item.lineAmount, checkout.currency)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(checkout.subtotalAmount, checkout.currency)}</span>
            </div>
            {checkout.shippingAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{formatCurrency(checkout.shippingAmount, checkout.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Amount</span>
              <span>{formatCurrency(checkout.totalAmount, checkout.currency)}</span>
            </div>
          </div>
        </div>

        {!isPaid && !isExpiredOrCancelled && (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 mb-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-amber-600 shrink-0" />
              <ExpiryCountdown expiresAt={checkout.expiresAt} />
            </div>
            <span className="text-[11px] text-slate-500">Complete before expiry</span>
          </div>
        )}

        {isExpiredOrCancelled && (
          <div className="text-center py-6 bg-white border border-slate-200 rounded-xl">
            <XCircle size={36} className="text-slate-400 mx-auto mb-2" />
            <div className="text-xs text-slate-600">This checkout session is {checkout.status}.</div>
          </div>
        )}

        {!isPaid && !isExpiredOrCancelled && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(true)}
            disabled={refreshing}
            className="w-full border-slate-200 text-slate-700 bg-white hover:bg-slate-50 gap-1.5 h-10 text-xs font-medium shadow-2xs"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Checking Settlement Status..." : "Refresh Payment Status"}
          </Button>
        )}

        <div className="text-center mt-8 text-[11px] text-slate-400 font-medium">
          Powered by CoreStudy · Enterprise Infrastructure for AI Agents
        </div>
      </div>
    </div>
  );
}
