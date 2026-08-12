import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, CreditCard,
  Terminal, BarChart2, Plug, Settings, ChevronRight,
  Boxes, Shield, Zap, PanelLeftClose, PanelLeftOpen, Lock
} from "lucide-react";
import { cn } from "../../lib/utils";

const COMMERCE_ITEMS = [
  { label: "Overview", href: "/app/overview", icon: LayoutDashboard },
  { label: "Catalog", href: "/app/catalog", icon: Package },
  { label: "Policies", href: "/app/policies", icon: Shield },
  { label: "Orders", href: "/app/orders", icon: ShoppingCart },
  { label: "Payments", href: "/app/payments", icon: CreditCard },
];

const INFRASTRUCTURE_ITEMS = [
  { label: "Agent Readiness", href: "/app/agent-readiness", icon: Zap },
  { label: "Playground", href: "/app/playground", icon: Terminal },
  { label: "Integrations & API", href: "/app/integrations", icon: Plug },
  { label: "Analytics", href: "/app/analytics", icon: BarChart2 },
];

const SETTINGS_ITEMS = [
  { label: "Settings", href: "/app/settings/general", icon: Settings },
  { label: "Security", href: "/app/settings/security", icon: Lock },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("cl_sidebar_collapsed") === "true";
  });

  const toggleCollapsed = () => {
    setCollapsed(c => {
      const next = !c;
      localStorage.setItem("cl_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <aside className={cn(
      "border-r border-slate-200 flex flex-col bg-white shrink-0 select-none transition-all duration-200",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        <Link to="/app/overview" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-xs shrink-0">
            <Boxes size={18} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm text-slate-900 tracking-tight truncate">CoreStudy</span>
          )}
        </Link>
        <button
          onClick={toggleCollapsed}
          className="text-slate-400 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          {!collapsed && (
            <div className="px-2 mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Commerce
            </div>
          )}
          <div className="space-y-0.5">
            {COMMERCE_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = location.pathname === href || (href !== "/app/overview" && location.pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  to={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all relative group",
                    active
                      ? "bg-slate-100 text-slate-900 font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-slate-900 rounded-r-full" />
                  )}
                  <Icon size={17} className={cn("shrink-0", active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900")} />
                  {!collapsed && (
                    <>
                      <span className="truncate">{label}</span>
                      {active && <ChevronRight size={12} className="ml-auto text-slate-400 shrink-0" />}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          {!collapsed && (
            <div className="px-2 mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Agent Infrastructure
            </div>
          )}
          <div className="space-y-0.5">
            {INFRASTRUCTURE_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = location.pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  to={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all relative group",
                    active
                      ? "bg-slate-100 text-slate-900 font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-slate-900 rounded-r-full" />
                  )}
                  <Icon size={17} className={cn("shrink-0", active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900")} />
                  {!collapsed && (
                    <>
                      <span className="truncate">{label}</span>
                      {active && <ChevronRight size={12} className="ml-auto text-slate-400 shrink-0" />}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          {!collapsed && (
            <div className="px-2 mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              System
            </div>
          )}
          <div className="space-y-0.5">
            {SETTINGS_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = location.pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  to={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all relative group",
                    active
                      ? "bg-slate-100 text-slate-900 font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-slate-900 rounded-r-full" />
                  )}
                  <Icon size={17} className={cn("shrink-0", active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900")} />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
