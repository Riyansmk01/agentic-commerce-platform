import { useState, useEffect } from "react";
import { CheckCircle2, Server, Database, Box, CreditCard, ShoppingBag, XCircle, ChevronRight } from "lucide-react";

interface TraceNode {
  id: string;
  status: "pending" | "success" | "error";
  time: string;
  label: string;
  details: string[];
  icon: React.ElementType;
  payload: any;
  latencyMs: number;
}

const mockNodes: TraceNode[] = [
  { 
    id: "1", status: "success", time: "20:31:04", label: "Agent request received", details: ["source=Gemini Pro 1.5", "token=valid"], icon: Server, latencyMs: 14,
    payload: { headers: { "user-agent": "Google-Gemini/1.5" }, body: { query: "sepatu lari pria size 43" } }
  },
  { 
    id: "2", status: "success", time: "20:31:04", label: "Intent parsed", details: ["size=43", "max_price=1500000"], icon: Database, latencyMs: 120,
    payload: { intent: "product_search", filters: { size: "43", gender: "pria", max_price: 1500000, query: "sepatu lari" } }
  },
  { 
    id: "3", status: "success", time: "20:31:04", label: "Catalog searched", details: ["28 → 4 matches"], icon: Box, latencyMs: 82,
    payload: { query: "SELECT * FROM products WHERE ...", results_count: 28, filtered_count: 4 }
  },
  { 
    id: "4", status: "success", time: "20:31:05", label: "Inventory verified", details: ["3 available"], icon: Box, latencyMs: 45,
    payload: { product_id: "prod_vRunnerX", stock: 3, warehouse: "WH-Jakarta" }
  },
  { 
    id: "5", status: "success", time: "20:31:16", label: "Checkout created", details: ["checkout_id=chk_9182"], icon: ShoppingBag, latencyMs: 240,
    payload: { checkout_id: "chk_9182", total: 1299000, expires_at: "2026-08-13T21:01:16Z" }
  },
  { 
    id: "6", status: "success", time: "20:32:41", label: "Payment initiated", details: ["provider=KlikQRIS"], icon: CreditCard, latencyMs: 450,
    payload: { provider: "KlikQRIS", amount: 1299000, payment_url: "https://qris.klik/pay/9182" }
  },
  { 
    id: "7", status: "success", time: "20:33:08", label: "Pakasir verified", details: ["signature=matched"], icon: CheckCircle2, latencyMs: 18,
    payload: { event: "payment_success", signature: "sha256=a8f9b...", received_at: "20:33:08.112" }
  },
  { 
    id: "8", status: "success", time: "20:33:09", label: "Order #ORD-1827 created", details: ["status=paid"], icon: ShoppingBag, latencyMs: 236,
    payload: { order_id: "ORD-1827", status: "paid", fulfillment_status: "pending", customer: { id: "cus_123" } }
  },
];

export function CommerceTrace({ animate = true }: { animate?: boolean }) {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    if (!animate) {
      setActiveNode(mockNodes.length);
      return;
    }
    
    // Staggered animation effect for nodes
    const interval = setInterval(() => {
      setActiveNode(prev => {
        if (prev >= mockNodes.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    
    return () => clearInterval(interval);
  }, [animate]);

  const handleNodeClick = (node: TraceNode) => {
    // Open UniversalActivityDrawer via global event
    const event = new CustomEvent("openActivityDrawer", {
      detail: {
        id: `node-${node.id}`,
        type: "trace_node",
        title: node.label,
        timestamp: node.time,
        payload: node.payload,
        latencyMs: node.latencyMs
      }
    });
    window.dispatchEvent(event);
  };

  const totalLatencyMs = mockNodes.reduce((acc, n) => acc + n.latencyMs, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 font-sans shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 p-32 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="relative z-10 mb-8 flex justify-between items-end">
        <div>
          <div className="text-emerald-400 font-mono text-[10px] font-bold tracking-widest uppercase mb-1">Commerce Trace</div>
          <div className="text-white font-semibold text-lg">Request #REQ_8192</div>
        </div>
        <div className="text-right">
          <div className="text-slate-400 font-mono text-xs">Total journey: 2m 05s</div>
          <div className="text-slate-500 font-mono text-[10px]">Net latency: {totalLatencyMs}ms</div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="absolute left-6 sm:left-[118px] top-6 bottom-6 w-0.5 bg-slate-800/50">
          <div 
            className="w-full bg-gradient-to-b from-emerald-400 to-indigo-500 transition-all duration-1000 ease-in-out" 
            style={{ height: `${(activeNode / mockNodes.length) * 100}%` }}
          />
        </div>

        <div className="space-y-0">
          {mockNodes.map((node, idx) => {
            const Icon = node.icon;
            const isActive = idx < activeNode;
            
            return (
              <div 
                key={node.id} 
                onClick={() => isActive && handleNodeClick(node)}
                className={`flex items-start gap-4 sm:gap-6 group relative transition-all duration-700 ease-out ${
                  isActive ? "opacity-100 translate-y-0 cursor-pointer" : "opacity-30 translate-y-4 pointer-events-none"
                }`}
                style={{ paddingBottom: idx === mockNodes.length - 1 ? 0 : '1.5rem' }}
              >
                <div className="hidden sm:block w-20 pt-1 text-right shrink-0">
                  <span className={`font-mono text-xs ${isActive ? "text-slate-400 group-hover:text-white transition-colors" : "text-slate-600"}`}>{node.time}</span>
                </div>
                
                <div className="relative shrink-0 z-10 mt-0.5">
                  <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-xl sm:rounded-full border flex items-center justify-center transition-all duration-500 ${
                    isActive 
                      ? "bg-slate-900 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-950" 
                      : "bg-slate-900/50 border-slate-800 text-slate-600"
                  }`}>
                    <Icon size={16} />
                  </div>
                </div>
                
                <div className="pt-1 sm:pt-0.5 pb-2 flex-1">
                  <div className={`font-semibold text-sm transition-colors duration-500 mb-1 flex items-center gap-2 ${isActive ? "text-slate-100 group-hover:text-indigo-300" : "text-slate-500"}`}>
                    {node.label}
                    {isActive && <ChevronRight size={14} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-indigo-400" />}
                  </div>
                  {node.details.length > 0 && (
                    <div className={`flex flex-wrap gap-2 transition-all duration-500 delay-300 ${isActive ? "opacity-100" : "opacity-0"}`}>
                      {node.details.map((detail, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-800/80 group-hover:bg-slate-800 border border-slate-700/50 group-hover:border-slate-600/50 rounded-md font-mono text-[10px] text-slate-300 transition-colors">
                          {detail}
                        </span>
                      ))}
                      <span className="px-2 py-1 text-slate-500 font-mono text-[10px]">{node.latencyMs}ms</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
