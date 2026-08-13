import { useState, useEffect } from "react";
import { Activity, Clock, Server, CheckCircle2, AlertCircle, Box, CreditCard, ShoppingBag, Terminal, X } from "lucide-react";

// A global event emitter for opening the drawer from anywhere
type DrawerData = { type: "request" | "order" | "payment" | "trace_node"; id: string; title?: string; timestamp?: string; payload?: any; latencyMs?: number; [key: string]: any };

let drawerListener: ((data: DrawerData) => void) | null = null;
export const openActivityDrawer = (data: DrawerData) => {
  if (drawerListener) drawerListener(data);
};

export function UniversalActivityDrawer() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<DrawerData | null>(null);

  useEffect(() => {
    drawerListener = (newData: DrawerData) => {
      setData(newData);
      setOpen(true);
    };
    return () => { drawerListener = null; };
  }, []);

  if (!data) return null;

  return (
    <div className={`fixed inset-0 z-[150] flex justify-end transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setOpen(false)} />

      {/* Drawer */}
      <div className={`relative z-10 w-full sm:max-w-[540px] bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs border ${
              data.type === 'request' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' :
              data.type === 'order' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
              data.type === 'trace_node' ? 'bg-indigo-600 border-indigo-700 text-white shadow-md' :
              'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              {data.type === 'trace_node' ? <Terminal size={16} /> : <Activity size={16} />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight m-0">
                {data.type === 'request' ? `Agent Request ${data.id}` : 
                 data.type === 'order' ? `Order ${data.id}` : 
                 data.type === 'trace_node' ? data.title :
                 `Payment ${data.id}`}
              </h2>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Clock size={12} />
                {data.timestamp || "Just now"}
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          
          {data.type === 'trace_node' && (
            <>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Node Execution Details</h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14}/> Success</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Execution Latency</span>
                    <span className="font-semibold text-slate-900">{data.latencyMs}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Internal ID</span>
                    <span className="font-mono text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">{data.id}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">JSON Payload</h3>
                <div className="bg-[#0D1117] rounded-xl p-4 border border-slate-800 shadow-inner overflow-x-auto relative">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800 text-[10px] text-slate-400 font-mono font-semibold rounded-bl-lg">JSON</div>
                  <pre className="text-[11px] font-mono text-emerald-400">
{JSON.stringify(data.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}

          {data.type === 'request' && (
            <>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Request Details</h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Source Agent</span>
                    <span className="font-semibold text-slate-900">Gemini Pro 1.5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Intent</span>
                    <span className="font-mono text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Search Catalog</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Latency</span>
                    <span className="font-semibold text-slate-900">412ms</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Payload</h3>
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-inner overflow-x-auto">
                  <pre className="text-[11px] font-mono text-slate-300">
{`{
  "q": "sepatu lari",
  "filters": {
    "max_price": 1500000,
    "stock_status": "in_stock"
  }
}`}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
