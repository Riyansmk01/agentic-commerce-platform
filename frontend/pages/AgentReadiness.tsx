import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import backend from "~backend/client";
import { PageHeader } from "../components/PageHeader";
import { ReadinessMeter } from "../components/ReadinessMeter";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, AlertCircle, XCircle, ArrowRight, RefreshCw } from "lucide-react";
import type { ReadinessScore } from "~backend/readiness/types";

const CRITERIA = [
  { key: "merchantIdentity", label: "Merchant Identity", hint: "Name, slug, country, currency" },
  { key: "supportContact", label: "Support Contact", hint: "Email or phone for customer support" },
  { key: "returnPolicy", label: "Return Policy", hint: "Returns policy is active and has a summary" },
  { key: "shippingPolicy", label: "Shipping Policy", hint: "Shipping policy is active and has a summary" },
  { key: "catalogPublished", label: "Catalog Published", hint: "At least one active product" },
  { key: "productTitles", label: "Product Titles", hint: "All products have descriptive titles" },
  { key: "productIdentifiers", label: "Product Identifiers", hint: "Variants have SKU codes" },
  { key: "prices", label: "Prices Set", hint: "All variants have valid prices" },
  { key: "stock", label: "Stock Known", hint: "Inventory status is tracked" },
  { key: "imagesAndUrls", label: "Images & URLs", hint: "Products have images and product URLs" },
] as const;

function ScoreIcon({ score }: { score: number }) {
  if (score >= 10) return <CheckCircle size={15} className="text-emerald-600 shrink-0" />;
  if (score > 0) return <AlertCircle size={15} className="text-amber-600 shrink-0" />;
  return <XCircle size={15} className="text-slate-300 shrink-0" />;
}

export default function AgentReadiness() {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? "";
  const [score, setScore] = useState<ReadinessScore | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!orgId) return;
    setLoading(true);
    backend.readiness.getReadinessScore({ organizationId: orgId })
      .then(r => { if (r?.score) setScore(r.score); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [orgId]);

  const statusLabel = {
    incomplete: "Incomplete",
    needs_attention: "Needs Attention",
    ready_for_testing: "Ready for Testing",
    strong: "Strong Data Readiness",
  };

  const statusColor = {
    incomplete: "text-red-600",
    needs_attention: "text-amber-600",
    ready_for_testing: "text-blue-600",
    strong: "text-emerald-600",
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent Readiness"
        subtitle="Catalog data completeness score for LLM agent integration"
        actions={
          <Button variant="outline" size="sm" onClick={load} className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 h-8 text-xs">
            <RefreshCw size={13} /> Recalculate
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Overall Score Linear Display */}
        <div className="lg:col-span-1 flex flex-col justify-between p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Readiness Status</div>
            <ReadinessMeter score={score?.total ?? 0} size="lg" />
            <div className={`text-center text-base font-semibold mt-4 ${statusColor[score?.status ?? "incomplete"]}`}>
              {statusLabel[score?.status ?? "incomplete"]}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100 text-center leading-relaxed">
            Measures machine-readability of product titles, prices, stock, and policies.
          </div>
        </div>

        {/* Right Column: Detailed Criteria Checklist */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Criteria Breakdown</h3>
          <div className="space-y-3">
            {CRITERIA.map(({ key, label, hint }) => {
              const s = score?.breakdown?.[key as keyof ReadinessScore["breakdown"]] ?? 0;
              return (
                <div key={key} className="flex items-center gap-3.5 py-1.5 border-b border-slate-100 last:border-0">
                  <ScoreIcon score={s} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900">{label}</div>
                    <div className="text-[11px] text-slate-500 truncate">{hint}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div className="h-full bg-slate-900 rounded-full" style={{ width: `${s * 10}%` }} />
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-600 w-8 text-right">{s}/10</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {score?.actions && score.actions.length > 0 && (
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Recommended Actions</h3>
          <div className="divide-y divide-slate-100">
            {score.actions.map((action, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <AlertCircle size={14} className="text-amber-600 shrink-0" />
                <span className="text-xs font-medium text-slate-700">{action}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4 pt-3 border-t border-slate-100">
            <Link to="/app/catalog">
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 h-8 text-xs">
                Manage Catalog <ArrowRight size={13} />
              </Button>
            </Link>
            <Link to="/app/policies">
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 h-8 text-xs">
                Update Policies <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {score && score.total >= 70 && (
        <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-3.5">
            <CheckCircle size={20} className="text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900 text-sm mb-0.5">Your catalog is ready for AI agent integration</div>
              <div className="text-xs text-slate-600">Run search test queries in the Agent Playground to verify catalog discovery.</div>
            </div>
            <Link to="/app/playground" className="ml-auto shrink-0">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 h-8 text-xs">
                Open Playground <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
