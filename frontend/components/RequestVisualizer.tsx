import { useState } from "react";
import { Check, Copy, CheckCircle2, Cpu, Database, Search, ArrowRight, Zap, Code, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestVisualizerProps {
  query?: string;
  data?: any;
  executionMs?: number;
}

export function RequestVisualizer({ query, data, executionMs = 152 }: RequestVisualizerProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"pretty" | "raw">("pretty");

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { name: "Parse Natural Query", durationMs: 12, status: "complete", icon: Cpu },
    { name: "Catalog Semantic Search", durationMs: 84, status: "complete", icon: Search },
    { name: "Inventory Verification", durationMs: 17, status: "complete", icon: Database },
    { name: "Policy Check", durationMs: 22, status: "complete", icon: ShieldCheck },
    { name: "Checkout Link Generation", durationMs: 17, status: "complete", icon: Zap },
  ];

  return (
    <div className="space-y-4">
      {/* Visual Pipeline Flow */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center justify-between">
          <span>Agent Request Execution Flow</span>
          <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">Total Latency: {executionMs}ms</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={s.name} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5 hover-card-lift">
                <div className="flex items-center justify-between">
                  <Icon size={14} className="text-slate-900" />
                  <span className="text-[10px] font-mono font-semibold text-slate-500">{s.durationMs}ms</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-900 truncate">{s.name}</div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <Check size={10} /> Complete
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* JSON Viewer */}
      {data && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-md overflow-hidden text-slate-200">
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code size={14} className="text-blue-400" />
              <span className="text-xs font-mono font-semibold text-slate-300">Agent API Response Payload</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-900 border border-slate-800 rounded-md p-0.5 text-[11px]">
                <button
                  onClick={() => setViewMode("pretty")}
                  className={`px-2 py-0.5 rounded cursor-pointer font-medium ${viewMode === "pretty" ? "bg-slate-800 text-white" : "text-slate-400"}`}
                >
                  Pretty
                </button>
                <button
                  onClick={() => setViewMode("raw")}
                  className={`px-2 py-0.5 rounded cursor-pointer font-medium ${viewMode === "raw" ? "bg-slate-800 text-white" : "text-slate-400"}`}
                >
                  Raw
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyJson}
                className="h-7 text-xs border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 gap-1.5"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy Payload"}
              </Button>
            </div>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-80 leading-relaxed">
            {viewMode === "pretty" ? JSON.stringify(data, null, 2) : JSON.stringify(data)}
          </pre>
        </div>
      )}
    </div>
  );
}
