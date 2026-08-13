import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Zap, Users, LineChart, 
  Settings, Boxes, PanelLeftClose, PanelLeftOpen, Search,
  Terminal, BarChart2, CheckCircle2, ShieldCheck, Box
} from "lucide-react";
import { cn } from "../../lib/utils";

const DOMAINS = [
  { label: "Home", href: "/app/overview", icon: LayoutDashboard },
  { label: "Commerce", href: "/app/commerce", icon: ShoppingCart },
  { label: "Agents", href: "/app/agents", icon: Zap },
  { label: "Customers", href: "/app/customers", icon: Users },
  { label: "Growth", href: "/app/growth", icon: LineChart },
  { label: "Operations", href: "/app/operations", icon: Box },
  { label: "Developer", href: "/app/developers", icon: Terminal },
  { label: "Intelligence", href: "/app/intelligence", icon: BarChart2 },
];

const SETTINGS_ITEMS = [
  { label: "Settings", href: "/app/settings/general", icon: Settings },
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
      "border-r border-slate-200 flex flex-col bg-slate-50 shrink-0 select-none transition-all duration-200",
      collapsed ? "w-16" : "w-[220px]"
    )}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/0">
        <Link to="/app/overview" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs shrink-0">
            <Boxes size={16} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm text-slate-900 tracking-tight truncate">Command Center</span>
          )}
        </Link>
        <button
          onClick={toggleCollapsed}
          className="text-slate-400 hover:text-slate-900 p-1 rounded-md hover:bg-slate-200 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
        <div className="space-y-1">
          {DOMAINS.map(({ label, href, icon: Icon }) => {
            const active = location.pathname === href || (href !== "/app/overview" && location.pathname.startsWith(href));
            return (
              <Link
                key={href}
                to={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative group",
                  active
                    ? "bg-white text-indigo-700 shadow-sm border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                <Icon size={16} className={cn("shrink-0", active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                {!collapsed && (
                  <span className="truncate">{label}</span>
                )}
              </Link>
            );
          })}
        </div>

        <div>
          {!collapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              System
            </div>
          )}
          <div className="space-y-1">
            {SETTINGS_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = location.pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  to={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative group",
                    active
                      ? "bg-white text-indigo-700 shadow-sm border border-slate-200/60"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                  )}
                >
                  <Icon size={16} className={cn("shrink-0", active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
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
