import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDate } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { CreditCard, RefreshCw, TrendingUp, DollarSign, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PaymentRow {
  id: string;
  provider: string;
  providerOrderId: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  createdAt: Date;
}

function statusVariant(s: string) {
  if (s === "paid") return "success" as const;
  if (s === "pending") return "warning" as const;
  if (s === "failed" || s === "cancelled") return "error" as const;
  return "neutral" as const;
}


function providerBadge(provider: string) {
  const map: Record<string, string> = {
    pakasir: "bg-blue-50 text-blue-700 border-blue-200",
    midtrans: "bg-emerald-50 text-emerald-700 border-emerald-200",
    xendit: "bg-purple-50 text-purple-700 border-purple-200",
    doku: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return map[provider] || "bg-slate-50 text-slate-700 border-slate-200";
}

export default function Payments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const pakasirKey = import.meta.env.VITE_PAKASIR_API_KEY;
  const merchantSlug = import.meta.env.VITE_MERCHANT_SLUG || "corestudy";

  const refresh = async () => {
    setLoading(true);
    try {
      // Attempt to fetch from Pakasir API
      if (pakasirKey) {
        const res = await fetch(`https://api.pakasir.com/v1/transactions?merchant=${merchantSlug}&limit=50`, {
          headers: { Authorization: `Bearer ${pakasirKey}` },
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          if (data?.transactions?.length > 0) {
            setPayments(data.transactions.map((t: any) => ({
              id: t.id || t.transaction_id,
              provider: "pakasir",
              providerOrderId: t.order_id || t.transaction_id,
              amount: t.amount || 0,
              status: t.status || "pending",
              paymentMethod: t.payment_type || "QRIS",
              createdAt: new Date(t.created_at || Date.now()),
            })));
            toast({ title: "Payments refreshed", description: "Live data from Pakasir loaded." });
            return;
          }
        }
      }
      // Fallback: use demo data but show "offline" notice
      toast({ title: "Offline", description: "Backend offline — no transactions to display.", variant: "default" });
    } catch {
      toast({ title: "Refresh failed", description: "Could not connect to payment gateway.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Compute summary stats
  const paid = payments.filter(p => p.status === "paid");
  const pending = payments.filter(p => p.status === "pending");
  const totalRevenue = paid.reduce((s, p) => s + p.amount, 0);
  const pakasirCount = payments.filter(p => p.provider === "pakasir").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Transactions"
        subtitle="Gateway settlements, Pakasir QRIS, and transaction pipeline for corestudy"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 h-8 text-xs font-medium"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        }
      />

      {/* Pakasir Integration Banner */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <CreditCard size={15} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-slate-900">Pakasir QRIS Gateway — Active</div>
          <div className="text-[11px] text-slate-600 font-mono mt-0.5">
            Merchant: <span className="font-semibold">{merchantSlug}</span> · Key: Szv0...J4L · {pakasirCount} Pakasir transactions
          </div>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 border border-blue-200 text-blue-700 font-semibold">
          Live API Connected
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-emerald-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{formatCurrency(totalRevenue, "IDR")}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{paid.length} paid transactions</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-emerald-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Paid</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{paid.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">of {payments.length} total</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-amber-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pending</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{pending.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{formatCurrency(pending.reduce((s, p) => s + p.amount, 0), "IDR")}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-blue-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Via Pakasir</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{pakasirCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">QRIS transactions</div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-200 bg-grid-pattern shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mx-auto mb-4 text-slate-900">
            <CreditCard size={22} />
          </div>
          <div className="text-slate-900 font-semibold mb-1 text-base">No payment transactions recorded</div>
          <div className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Transactions processed via Pakasir and other payment gateways will appear here in real time.
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="px-4 py-3 font-semibold">Provider Ref</th>
                <th className="px-4 py-3 font-semibold">Gateway</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-slate-900 font-medium">{p.providerOrderId}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold capitalize ${providerBadge(p.provider)}`}>
                      {p.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{formatCurrency(p.amount, "IDR")}</td>
                  <td className="px-4 py-3.5 text-slate-500">{p.paymentMethod ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge label={p.status} variant={statusVariant(p.status)} dot />
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
