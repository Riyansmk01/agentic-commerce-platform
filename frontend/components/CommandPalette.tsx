import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search, Package, Plus, Upload, Terminal, Zap, ShoppingCart, CreditCard,
  Key, Shield, Settings, ChevronRight, CornerDownLeft
} from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  category: "Navigation" | "Catalog" | "Infrastructure" | "Settings";
  icon: React.ElementType;
  href: string;
}

const ACTIONS: ActionItem[] = [
  { id: "new-prod", title: "Add New Product", category: "Catalog", icon: Plus, href: "/app/catalog/new" },
  { id: "import-csv", title: "Import Catalog CSV", category: "Catalog", icon: Upload, href: "/app/catalog/import" },
  { id: "playground", title: "Open Agent Playground", category: "Infrastructure", icon: Terminal, href: "/app/playground" },
  { id: "readiness", title: "View Agent Readiness Score", category: "Infrastructure", icon: Zap, href: "/app/agent-readiness" },
  { id: "orders", title: "View Recent Orders", category: "Navigation", icon: ShoppingCart, href: "/app/orders" },
  { id: "payments", title: "View Settlement Transactions", category: "Navigation", icon: CreditCard, href: "/app/payments" },
  { id: "api-keys", title: "Manage Secret API Keys", category: "Infrastructure", icon: Key, href: "/app/integrations/api" },
  { id: "policies", title: "Configure Merchant Policies", category: "Catalog", icon: Shield, href: "/app/policies" },
  { id: "settings", title: "General Settings", category: "Settings", icon: Settings, href: "/app/settings/general" },
  { id: "security", title: "Security & Sessions", category: "Settings", icon: Shield, href: "/app/settings/security" },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filtered = ACTIONS.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery("");
    navigate(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex].href);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-xl shadow-2xl rounded-2xl p-0 overflow-hidden gap-0">
        <div className="flex items-center px-4 border-b border-slate-200 bg-white">
          <Search size={16} className="text-slate-400 shrink-0 mr-3" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search action..."
            className="border-none shadow-none focus-visible:ring-0 text-sm h-12 bg-transparent placeholder:text-slate-400 font-medium"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No matching actions found
            </div>
          ) : (
            filtered.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={action.id}
                  onClick={() => handleSelect(action.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                    isSelected ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${
                      isSelected ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                      <Icon size={14} />
                    </div>
                    <span>{action.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-400">
                      {action.category}
                    </span>
                    {isSelected && <CornerDownLeft size={12} className="text-slate-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Navigate with <kbd className="px-1 py-0.5 bg-white border rounded">↑</kbd> <kbd className="px-1 py-0.5 bg-white border rounded">↓</kbd></span>
          <span>Select <kbd className="px-1 py-0.5 bg-white border rounded">↵</kbd></span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
