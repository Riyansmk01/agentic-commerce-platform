import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { CommerceTrace } from "../components/CommerceTrace";
import { Terminal, Code, Zap, AlertCircle, Database, CheckCircle2 } from "lucide-react";
import { openActivityDrawer } from "../components/UniversalActivityDrawer";
import { Button } from "@/components/ui/button";

const MOCK_REQUESTS = [
  { id: "REQ_8192", time: "Just now", intent: "Search", status: "Success", latency: "1205ms", agent: "Gemini Pro 1.5" },
  { id: "REQ_8191", time: "2m ago", intent: "Checkout", status: "Success", latency: "450ms", agent: "MCP Client" },
  { id: "REQ_8190", time: "15m ago", intent: "Search", status: "Failed", latency: "112ms", agent: "REST API" },
  { id: "REQ_8189", time: "1h ago", intent: "Policy Check", status: "Success", latency: "89ms", agent: "Claude 3.5 Sonnet" },
  { id: "REQ_8188", time: "2h ago", intent: "Search", status: "Success", latency: "670ms", agent: "Gemini Pro 1.5" },
];

export default function Developers() {
  const [activeTab, setActiveTab] = useState<"trace" | "logs" | "webhooks">("trace");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer Console"
        subtitle="Agent observability, request traces, and API health monitoring"
        actions={
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {["trace", "logs", "webhooks"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                  activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "trace" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Terminal size={16} className="text-indigo-500" /> Live Commerce Trace
              </h2>
              <CommerceTrace animate={true} />
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Database size={16} className="text-blue-500" /> Agent Request Explorer
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Request ID</th>
                      <th className="px-5 py-3 font-medium">Time</th>
                      <th className="px-5 py-3 font-medium">Agent</th>
                      <th className="px-5 py-3 font-medium">Intent</th>
                      <th className="px-5 py-3 font-medium text-right">Latency</th>
                      <th className="px-5 py-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_REQUESTS.map((req) => (
                      <tr 
                        key={req.id} 
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                        onClick={() => openActivityDrawer({ type: "request", id: req.id })}
                      >
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-900 font-medium">{req.id}</td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">{req.time}</td>
                        <td className="px-5 py-3.5 text-slate-700 text-xs">{req.agent}</td>
                        <td className="px-5 py-3.5 text-slate-700 text-xs">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">{req.intent}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs text-right">{req.latency}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            req.status === "Success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            {req.status === "Success" ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "webhooks" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Code size={16} className="text-amber-500" /> Webhook Delivery Inspector
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-2xs">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Code size={20} className="text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">No webhooks configured</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">Add a webhook endpoint in settings to start receiving real-time events for checkouts and payments.</p>
                <Button variant="outline" size="sm">Configure Webhooks</Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-4 flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> Integration Health
            </h3>
            <div className="space-y-4">
              {[
                { name: "Pakasir Payment", status: "Operational", color: "emerald" },
                { name: "Agent API", status: "Operational", color: "emerald" },
                { name: "Model Context Protocol", status: "Operational", color: "emerald" },
                { name: "KlikQRIS", status: "Attention", color: "amber" },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{integration.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`relative flex h-2 w-2`}>
                      {integration.color === "emerald" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2 w-2 bg-${integration.color}-500`}></span>
                    </span>
                    <span className={`text-[11px] font-semibold text-${integration.color}-700`}>{integration.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xs text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-blue-500/20 blur-[50px] mix-blend-screen pointer-events-none" />
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-2 relative z-10">Live System Status</h3>
            <div className="text-2xl font-semibold mb-1 relative z-10">99.99%</div>
            <div className="text-xs text-slate-400 mb-4 relative z-10">Uptime over the last 30 days</div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden relative z-10">
              <div className="h-full w-full bg-emerald-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
