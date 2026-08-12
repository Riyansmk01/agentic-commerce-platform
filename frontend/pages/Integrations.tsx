import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Key, Terminal, Globe, CreditCard, ChevronRight } from "lucide-react";

const INTEGRATIONS = [
  {
    id: "pakasir",
    title: "Pakasir Gateway (CoreStudy)",
    desc: "Indonesian payment gateway — Active API Key (LNVt...WSk) and QRIS / VA processing for corestudy",
    icon: CreditCard,
    status: "active",
    href: "/app/payments",
  },
  {
    id: "api",
    title: "API Keys & Protocols",
    desc: "Manage partner secret keys for AI catalog discovery and checkout creation",
    icon: Key,
    status: "active",
    href: "/app/integrations/api",
  },
  {
    id: "mcp",
    title: "MCP Server",
    desc: "Model Context Protocol endpoint for Anthropic Claude & LLM-powered agents",
    icon: Terminal,
    status: "active",
    href: "/app/playground",
  },
  {
    id: "ucp",
    title: "UCP Readiness",
    desc: "Universal Commerce Protocol adapter for Google Agent compatibility",
    icon: Globe,
    status: "active",
    href: "/app/agent-readiness",
  },
];

function statusVariant(s: string) {
  if (s === "active") return "success" as const;
  if (s === "not_connected") return "warning" as const;
  if (s === "coming_soon") return "neutral" as const;
  return "neutral" as const;
}

function statusLabel(s: string) {
  if (s === "active") return "Active";
  if (s === "not_connected") return "Not connected";
  if (s === "coming_soon") return "Coming soon";
  return s;
}

export default function Integrations() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations & Ecosystem"
        subtitle="Connect API keys, agent protocols, and Indonesian payment gateways"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map(({ id, title, desc, icon: Icon, status, href }) => (
          <div key={id} className="p-6 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{title}</div>
                    <div className="mt-0.5">
                      <StatusBadge label={statusLabel(status)} variant={statusVariant(status)} />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">{desc}</p>
            </div>
            {href ? (
              <Link to={href}>
                <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 w-full justify-between h-9 text-xs font-medium">
                  <span>Manage Integration</span>
                  <ChevronRight size={14} />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed w-full h-9 text-xs">
                {status === "coming_soon" ? "Coming Soon" : "Connect"}
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="text-xs font-semibold text-slate-900 mb-1">Custom Protocol or Gateway Request?</div>
        <div className="text-xs text-slate-500">
          We build custom connectors for Indonesian platforms and enterprise LLM agent orchestrators upon request.
        </div>
      </div>
    </div>
  );
}
