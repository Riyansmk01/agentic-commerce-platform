import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Boxes, ArrowLeft, Terminal, Key, Search, ShoppingCart, CheckCircle } from "lucide-react";

const ENDPOINTS = [
  { method: "GET", path: "/v1/catalog/search", desc: "Search products across a merchant catalog" },
  { method: "GET", path: "/v1/products/:productId", desc: "Get full product details with pricing and stock" },
  { method: "GET", path: "/v1/merchants/:merchantId", desc: "Get public merchant profile and info" },
  { method: "GET", path: "/v1/policies", desc: "Get merchant policies (returns, shipping, etc.)" },
  { method: "POST", path: "/v1/checkouts", desc: "Create a verified checkout session" },
  { method: "GET", path: "/v1/checkouts/:id", desc: "Get checkout status and details" },
  { method: "GET", path: "/v1/orders/:id", desc: "Get order status after payment" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-700 bg-emerald-50 border border-emerald-200",
  POST: "text-blue-700 bg-blue-50 border border-blue-200",
  PUT: "text-amber-700 bg-amber-50 border border-amber-200",
  DELETE: "text-red-700 bg-red-50 border border-red-200",
};

export default function Developers() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <nav className="border-b border-slate-200 sticky top-0 z-50 bg-white/92 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shadow-xs">
              <Boxes size={16} className="text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900">CoreStudy</span>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">
              Get API Key
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Documentation</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">Developer Infrastructure</h1>
          <p className="text-slate-600 text-base max-w-2xl leading-relaxed">
            CoreStudy exposes structured REST APIs and Model Context Protocol (MCP) tools enabling AI agents to query product availability, retrieve policy constraints, and create validated checkout sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {[
            { icon: Search, title: "Catalog Search API", desc: "Full-text and parametric filtering across published merchant catalogs" },
            { icon: Key, title: "Scoped API Keys", desc: "Granular access tokens for LLM partners and backend services" },
            { icon: Terminal, title: "MCP Protocol", desc: "Model Context Protocol tools for Claude, OpenAI, and custom agents" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mb-4 text-slate-900">
                <Icon size={18} />
              </div>
              <div className="font-semibold text-sm text-slate-900 mb-1">{title}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-5">API Endpoints</h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            {ENDPOINTS.map((ep, i) => (
              <div key={ep.path} className={`flex flex-wrap md:flex-nowrap items-center gap-4 px-5 py-4 ${i < ENDPOINTS.length - 1 ? "border-b border-slate-200" : ""}`}>
                <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${METHOD_COLORS[ep.method] ?? "text-slate-600"}`}>
                  {ep.method}
                </span>
                <code className="text-xs text-slate-900 font-mono font-medium flex-1">{ep.path}</code>
                <span className="text-xs text-slate-500 max-w-sm">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-5">Response Schema</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300 leading-relaxed space-y-1 shadow-lg">
            <div className="text-slate-500">// Standard envelope returned by all endpoints</div>
            <div>{`{`}</div>
            <div className="pl-4"><span className="text-blue-400">"data"</span>: {`{ ... },`}</div>
            <div className="pl-4"><span className="text-blue-400">"meta"</span>: {`{`}</div>
            <div className="pl-8"><span className="text-emerald-400">"requestId"</span>: <span className="text-amber-300">"req_908123"</span>,</div>
            <div className="pl-8"><span className="text-emerald-400">"apiVersion"</span>: <span className="text-amber-300">"2026-08-01"</span>,</div>
            <div className="pl-8"><span className="text-emerald-400">"generatedAt"</span>: <span className="text-amber-300">"2026-08-12T10:00:00Z"</span></div>
            <div className="pl-4">{`}`}</div>
            <div>{`}`}</div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-5">Quick Integration Steps</h2>
          <div className="space-y-3.5">
            {[
              { step: 1, title: "Create your account", desc: "Sign up and set up your merchant organization workspace." },
              { step: 2, title: "Publish your catalog", desc: "Upload product inventory via CSV or API to enable machine-readability." },
              { step: 3, title: "Generate an API Key", desc: "Navigate to Integrations → API Keys to create a scoped token." },
              { step: 4, title: "Query the Search Endpoint", desc: "curl -H 'Authorization: Bearer <KEY>' https://api.commercelayer.id/v1/catalog/search?q=sepatu" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-semibold">
                  {step}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 mb-0.5">{title}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-slate-900 mb-1">Ready to test your catalog?</div>
            <div className="text-xs text-slate-600">Create a merchant workspace and run your first natural language query.</div>
          </div>
          <Link to="/auth">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
