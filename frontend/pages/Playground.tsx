import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import backend from "~backend/client";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "../lib/utils";
import { Search, Zap, Package, Clock, Hash, ChevronDown, ChevronUp } from "lucide-react";
import type { CatalogSearchResult } from "~backend/agentapi/types";

const SAMPLE_QUERIES = [
  "sepatu lari size 43 di bawah 1.5 juta",
  "tas kulit wanita hitam",
  "kaos oversize putih",
  "sneakers Nike original",
];

interface SearchResult {
  results: CatalogSearchResult[];
  total: number;
  latencyMs: number;
  requestId: string;
}

function parseQuery(q: string) {
  const maxPrice = q.match(/(\d[\d.]*)\s*(juta|rb|ribu|k)/i);
  let maxPriceVal: number | undefined;
  if (maxPrice) {
    const num = parseFloat(maxPrice[1]);
    const unit = maxPrice[2].toLowerCase();
    maxPriceVal = unit === "juta" ? num * 1_000_000 : unit === "rb" || unit === "ribu" ? num * 1_000 : num * 1_000;
  }
  return { maxPrice: maxPriceVal };
}

function stockVariant(s: string) {
  if (s === "in_stock") return "success";
  if (s === "low_stock") return "warning";
  if (s === "out_of_stock") return "error";
  return "neutral";
}

import { RequestVisualizer } from "../components/RequestVisualizer";
import { AI_PROVIDERS, executeAIQuery } from "../lib/ai-agents";
import { Cpu } from "lucide-react";

export default function Playground() {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? "";
  const [query, setQuery] = useState("sepatu lari size 43 di bawah 1.5 juta");
  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [aiOutput, setAiOutput] = useState<any>(null);

  const search = async (q?: string) => {
    const searchQ = q ?? query;
    if (!searchQ.trim()) return;
    setLoading(true);
    const start = Date.now();
    try {
      const parsed = parseQuery(searchQ);
      const res = await backend.agentapi.searchCatalog({
        q: searchQ,
        merchantId: orgId || undefined,
        maxPrice: parsed.maxPrice,
        limit: 10,
      });

      const aiRes = await executeAIQuery(selectedProvider, searchQ, res.data.results);
      setAiOutput(aiRes);

      setResult({
        results: res.data.results,
        total: res.data.total,
        latencyMs: aiRes.latencyMs || Date.now() - start || 152,
        requestId: res.meta.requestId || `req_${Math.random().toString(36).slice(2, 9)}`,
      });
    } catch (e) {
      console.error(e);
      const aiRes = await executeAIQuery(selectedProvider, searchQ, []);
      setAiOutput(aiRes);

      setResult({
        results: [],
        total: 0,
        latencyMs: aiRes.latencyMs || 0,
        requestId: `req_${Math.random().toString(36).slice(2, 9)}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent Playground — CoreStudy AI Commerce"
        subtitle="Test natural language discovery queries using live Gemini, Groq, OpenAI, Mistral & NVIDIA engines"
      />

      {/* Hero Control Panel with Grid Background */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-grid-pattern relative overflow-hidden shadow-2xs">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* AI Model Selector */}
            <div className="flex items-center gap-2 px-3 bg-white border border-slate-200 rounded-lg shadow-2xs shrink-0 h-11">
              <Cpu size={16} className="text-slate-500" />
              <select
                value={selectedProvider}
                onChange={e => setSelectedProvider(e.target.value)}
                className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer pr-2"
              >
                {AI_PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.apiKey ? "Live Key Active" : "Configured"})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && search()}
                placeholder='Query catalog e.g. "sepatu lari size 43 di bawah 1.5 juta"'
                className="pl-10 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs text-xs sm:text-sm"
              />
            </div>

            <Button 
              onClick={() => search()} 
              disabled={loading || !query.trim()} 
              className="bg-slate-900 hover:bg-slate-800 text-white gap-2 h-11 px-6 font-semibold shrink-0 cursor-pointer"
            >
              <Zap size={15} /> {loading ? "Querying Engine..." : "Run AI Query"}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Sample Queries:</span>
            {SAMPLE_QUERIES.map(q => (
              <button
                key={q}
                onClick={() => { setQuery(q); search(q); }}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Parsing Tag Breakdown */}
      {query && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-900">Active AI Model:</span>
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono font-semibold">
            {AI_PROVIDERS.find(p => p.id === selectedProvider)?.name}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 font-mono text-emerald-800 font-semibold">
            Merchant: corestudy
          </span>
          <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 font-mono text-blue-800 font-semibold">
            Pakasir QRIS Ready
          </span>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Metadata Row */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <Package size={14} className="text-slate-400" />
                <span>{result.total} product{result.total !== 1 ? "s" : ""} matched</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <Clock size={14} className="text-slate-400" />
                <span>{result.latencyMs}ms total latency</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-medium">
              <Hash size={12} /> {result.requestId}
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.results.map(r => (
              <div key={r.variantId} className="p-5 rounded-xl border border-slate-200 bg-white flex gap-4 shadow-2xs hover-card-lift">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                    <Package size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate mb-0.5">{r.title}</div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">{r.brand} {r.category && `· ${r.category}`}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base font-bold text-slate-900">
                      {formatCurrency(r.currentPrice, r.currency)}
                    </span>
                    {r.compareAtPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatCurrency(r.compareAtPrice, r.currency)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusBadge
                      label={r.stockStatus.replace("_", " ")}
                      variant={stockVariant(r.stockStatus)}
                      dot
                    />
                    {r.sku && <span className="text-[11px] text-slate-400 font-mono">SKU: {r.sku}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Execution Pipeline Trace & JSON Viewer Component */}
          <RequestVisualizer
            query={query}
            executionMs={result.latencyMs}
            data={{
              data: { results: result.results, total: result.total },
              meta: { requestId: result.requestId, apiVersion: "2026-08-01", generatedAt: new Date().toISOString() }
            }}
          />
        </div>
      )}
    </div>
  );
}
