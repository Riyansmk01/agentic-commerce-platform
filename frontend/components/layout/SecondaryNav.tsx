import { useLocation, Link } from "react-router-dom";
import { cn } from "../../lib/utils";

// Map domains to their secondary tabs
const DOMAIN_TABS: Record<string, { label: string; href: string }[]> = {
  "/app/overview": [], // Home doesn't need tabs, it's a dashboard
  "/app/commerce": [
    { label: "Overview", href: "/app/commerce" },
    { label: "Products", href: "/app/catalog" },
    { label: "Inventory", href: "/app/commerce/inventory" },
    { label: "Orders", href: "/app/orders" },
    { label: "Payments", href: "/app/payments" },
    { label: "Fulfillment", href: "/app/commerce/fulfillment" },
  ],
  "/app/agents": [
    { label: "Overview", href: "/app/agents" },
    { label: "Requests", href: "/app/agents/requests" },
    { label: "Commerce Trace", href: "/app/agents/traces" },
    { label: "MCP & UCP", href: "/app/agents/protocols" },
    { label: "Agent Reputation", href: "/app/agents/reputation" },
  ],
  "/app/customers": [
    { label: "Directory", href: "/app/customers" },
    { label: "Segments", href: "/app/customers/segments" },
    { label: "Journeys", href: "/app/customers/journeys" },
  ],
  "/app/growth": [
    { label: "Analytics", href: "/app/growth" },
    { label: "Funnels", href: "/app/growth/funnels" },
    { label: "Experiments", href: "/app/growth/experiments" },
  ],
  "/app/operations": [
    { label: "Overview", href: "/app/operations" },
    { label: "Workflows", href: "/app/operations/workflows" },
    { label: "Suppliers", href: "/app/operations/suppliers" },
    { label: "Purchase Orders", href: "/app/operations/po" },
    { label: "Team", href: "/app/operations/team" },
  ],
  "/app/developers": [
    { label: "API Keys", href: "/app/integrations/api" },
    { label: "Logs", href: "/app/developers/logs" },
    { label: "Webhooks", href: "/app/developers/webhooks" },
    { label: "Sandbox", href: "/app/developers/sandbox" },
    { label: "Documentation", href: "/app/developers/docs" },
  ],
  "/app/intelligence": [
    { label: "Forecasts", href: "/app/intelligence" },
    { label: "Anomalies", href: "/app/intelligence/anomalies" },
    { label: "Data Explorer", href: "/app/intelligence/data" },
  ],
};

export function SecondaryNav() {
  const location = useLocation();
  
  // Determine which domain we are in
  let currentDomain = "/app/overview";
  for (const domain of Object.keys(DOMAIN_TABS)) {
    if (location.pathname.startsWith(domain) || 
       // Fallbacks for older paths mapped to new domains
       (domain === "/app/commerce" && (location.pathname.startsWith("/app/catalog") || location.pathname.startsWith("/app/orders") || location.pathname.startsWith("/app/payments"))) ||
       (domain === "/app/developers" && location.pathname.startsWith("/app/integrations"))
    ) {
      currentDomain = domain;
    }
  }

  const tabs = DOMAIN_TABS[currentDomain] || [];

  if (tabs.length === 0) return null;

  return (
    <div className="h-12 border-b border-slate-200 bg-white flex items-center px-6 shrink-0 gap-6 overflow-x-auto">
      {tabs.map((tab) => {
        // Simple active check
        const active = location.pathname === tab.href;
        return (
          <Link
            key={tab.href}
            to={tab.href}
            className={cn(
              "text-xs font-semibold h-full flex items-center relative transition-colors whitespace-nowrap",
              active ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"
            )}
          >
            {tab.label}
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
