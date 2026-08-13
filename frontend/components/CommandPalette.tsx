import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Package, ShoppingCart, Activity, User, Key, X, Zap, Terminal, Plus, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  if (!open) return null;

  const isActionMode = query.trim().startsWith(">");
  const cleanQuery = isActionMode ? query.substring(1).trim().toLowerCase() : query.toLowerCase();

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
        <Command
          className="w-full bg-transparent"
          shouldFilter={false} // We handle filtering manually for complex rules
          onKeyDown={(e) => {
            if (e.key === "Escape") onOpenChange(false);
          }}
        >
          <div className="flex items-center border-b border-slate-100 px-3 relative">
            <div className="absolute left-4 pointer-events-none">
              {isActionMode ? (
                <Terminal className="w-5 h-5 text-indigo-500" />
              ) : (
                <Search className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <Command.Input 
              value={query}
              onValueChange={setQuery}
              autoFocus
              placeholder="Search or type > for actions..." 
              className={cn(
                "flex-1 h-14 bg-transparent outline-none pl-9 pr-8 text-sm font-medium",
                isActionMode ? "text-indigo-600 placeholder:text-indigo-300" : "text-slate-900 placeholder:text-slate-400"
              )}
            />
            <button onClick={() => onOpenChange(false)} className="absolute right-3 p-1 rounded hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <Command.List className="max-h-[350px] overflow-y-auto p-2">
            
            {/* ACTION MODE */}
            {isActionMode && (
              <Command.Group heading="Available Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-group-heading]]:uppercase">
                {["create product", "new item", "add product"].some(q => q.includes(cleanQuery)) && (
                  <Command.Item 
                    onSelect={() => { navigate("/app/catalog/new"); onOpenChange(false); }}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-indigo-50 cursor-pointer aria-selected:bg-indigo-50 aria-selected:text-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-3 text-indigo-500" />
                    <span className="font-semibold">Create Product</span>
                  </Command.Item>
                )}
                {["reconcile payment", "payment"].some(q => q.includes(cleanQuery)) && (
                  <Command.Item 
                    onSelect={() => { navigate("/app/payments"); onOpenChange(false); }}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-indigo-50 cursor-pointer aria-selected:bg-indigo-50 aria-selected:text-indigo-700"
                  >
                    <Activity className="w-4 h-4 mr-3 text-indigo-500" />
                    <span className="font-semibold">Reconcile Payment</span>
                    <span className="ml-2 text-xs text-slate-400 font-mono">ORD-2819</span>
                  </Command.Item>
                )}
                {["show failed webhooks today", "webhooks", "failed"].some(q => q.includes(cleanQuery)) && (
                  <Command.Item 
                    onSelect={() => { navigate("/app/developers/webhooks"); onOpenChange(false); }}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-indigo-50 cursor-pointer aria-selected:bg-indigo-50 aria-selected:text-indigo-700"
                  >
                    <AlertCircle className="w-4 h-4 mr-3 text-red-500" />
                    <span className="font-semibold">Show Failed Webhooks</span>
                    <span className="ml-2 text-xs text-slate-400">today</span>
                  </Command.Item>
                )}
                {["open low stock products", "low stock", "stock"].some(q => q.includes(cleanQuery)) && (
                  <Command.Item 
                    onSelect={() => { navigate("/app/commerce/inventory"); onOpenChange(false); }}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-indigo-50 cursor-pointer aria-selected:bg-indigo-50 aria-selected:text-indigo-700"
                  >
                    <Package className="w-4 h-4 mr-3 text-indigo-500" />
                    <span className="font-semibold">Open Low Stock Products</span>
                  </Command.Item>
                )}
              </Command.Group>
            )}

            {/* SEARCH MODE */}
            {!isActionMode && (
              <>
                {cleanQuery.length > 2 && (
                  <Command.Group heading="Entities" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-group-heading]]:uppercase">
                    {cleanQuery.startsWith("ord") && (
                      <Command.Item 
                        onSelect={() => { onOpenChange(false); }}
                        className="flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 cursor-pointer aria-selected:bg-slate-100 aria-selected:text-slate-900"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3 text-indigo-500" />
                        <div>
                          <div className="font-semibold">View Order <span className="font-mono text-indigo-600">{query.toUpperCase()}</span></div>
                        </div>
                      </Command.Item>
                    )}
                    {cleanQuery.startsWith("req") && (
                      <Command.Item 
                        onSelect={() => { navigate("/app/agents/requests"); onOpenChange(false); }}
                        className="flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 cursor-pointer aria-selected:bg-slate-100 aria-selected:text-slate-900"
                      >
                        <Activity className="w-4 h-4 mr-3 text-indigo-500" />
                        <div>
                          <div className="font-semibold">View Agent Request <span className="font-mono text-indigo-600">{query.toUpperCase()}</span></div>
                        </div>
                      </Command.Item>
                    )}
                  </Command.Group>
                )}

                {(!cleanQuery || cleanQuery.length <= 2) && (
                  <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-group-heading]]:uppercase">
                    <Command.Item 
                      onSelect={() => { navigate("/app/overview"); onOpenChange(false); }}
                      className="flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 cursor-pointer aria-selected:bg-slate-100 aria-selected:text-slate-900"
                    >
                      <Activity className="w-4 h-4 mr-3 text-slate-400" />
                      Dashboard Overview
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => { navigate("/app/commerce"); onOpenChange(false); }}
                      className="flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 cursor-pointer aria-selected:bg-slate-100 aria-selected:text-slate-900"
                    >
                      <ShoppingCart className="w-4 h-4 mr-3 text-slate-400" />
                      Commerce
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => { navigate("/app/developers"); onOpenChange(false); }}
                      className="flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 cursor-pointer aria-selected:bg-slate-100 aria-selected:text-slate-900"
                    >
                      <Terminal className="w-4 h-4 mr-3 text-slate-400" />
                      Developer Console
                    </Command.Item>
                  </Command.Group>
                )}
                
                {(!cleanQuery || cleanQuery.length <= 2) && (
                  <Command.Group heading="Recent Activity" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-group-heading]]:uppercase mt-2">
                    <Command.Item 
                      onSelect={() => { navigate("/app/orders"); onOpenChange(false); }}
                      className="flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 cursor-pointer aria-selected:bg-slate-100 aria-selected:text-slate-900"
                    >
                      <ShoppingCart className="w-4 h-4 mr-3 text-slate-400" />
                      <div>
                        <div className="text-slate-900 font-medium text-xs">Order ORD-1827 Created</div>
                        <div className="text-[10px] text-slate-500">2 minutes ago</div>
                      </div>
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => { navigate("/app/agents/traces"); onOpenChange(false); }}
                      className="flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 cursor-pointer aria-selected:bg-slate-100 aria-selected:text-slate-900"
                    >
                      <Zap className="w-4 h-4 mr-3 text-indigo-500" />
                      <div>
                        <div className="text-slate-900 font-medium text-xs">Commerce Trace REQ-8192</div>
                        <div className="text-[10px] text-slate-500">5 minutes ago • source: Gemini</div>
                      </div>
                    </Command.Item>
                  </Command.Group>
                )}
              </>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
