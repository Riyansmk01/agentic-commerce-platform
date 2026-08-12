import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Boxes, Zap, ShoppingBag, Globe, ArrowRight, Terminal, CheckCircle2, ShieldCheck, ArrowRightCircle } from "lucide-react";

const FEATURES = [
  {
    icon: Globe,
    title: "Machine-Readable Catalog API",
    description: "Publish your entire product catalog, prices, and availability in a structured format that AI agents can query, filter, and understand — without web scraping.",
  },
  {
    icon: Terminal,
    title: "Agent API & MCP Tools",
    description: "Expose your commerce data through REST and Model Context Protocol. Any LLM-powered agent can discover your products and check stock in real time.",
  },
  {
    icon: ShoppingBag,
    title: "Checkout & Order Engine",
    description: "Let agents create verified checkouts with server-validated prices and stock. Buyers complete payment through your existing flow — no re-integration needed.",
  },
];

const STEPS = [
  "Create your merchant workspace",
  "Upload your product catalog (CSV or API)",
  "Configure policies: returns, shipping, support",
  "Publish — your catalog is now agent-ready",
];

const WORKFLOW_STEPS = [
  { label: "Agent Request", desc: 'Query: "sepatu lari 43"', status: "Received" },
  { label: "Product Match", desc: "Found SKU-8812 (In Stock)", status: "Matched" },
  { label: "Checkout", desc: "Session created #chk_9012", status: "Verified" },
  { label: "Payment Verified", desc: "Server-side confirmation", status: "Paid" },
  { label: "Order Created", desc: "Fulfillment triggered", status: "Complete" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Sticky Navbar */}
      <nav className="border-b border-slate-200 sticky top-0 z-50 bg-white/92 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shadow-xs">
                <Boxes size={16} className="text-white" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-slate-900">CoreStudy</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
              <a href="#product" className="hover:text-slate-900 transition-colors">Product</a>
              <Link to="/developers" className="hover:text-slate-900 transition-colors">Developers</Link>
              <Link to="/developers" className="hover:text-slate-900 transition-colors">Docs</Link>
              <Link to="/security" className="hover:text-slate-900 transition-colors">Security</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button size="sm" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Grid & Radial Fade */}
      <section className="relative overflow-hidden hero-grid-pattern border-b border-slate-200 pt-20 pb-24">
        {/* Mask Overlay to gently fade grid */}
        <div className="absolute inset-0 mask-fade-b pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-2xs text-slate-700 text-xs font-medium mb-8">
            <Zap size={13} className="text-slate-900" />
            Infrastructure for the agentic commerce era
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] max-w-4xl mx-auto">
            Make your commerce catalog agent-ready.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            CoreStudy connects your product inventory, pricing, availability, and checkout directly to AI agents — enabling seamless autonomous product discovery and purchases for Indonesian merchants.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-9">
            <Link to="/auth">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white gap-2 px-7 shadow-sm">
                Start Building <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/developers">
              <Button size="lg" variant="outline" className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50 gap-2">
                <Terminal size={16} /> View Documentation
              </Button>
            </Link>
          </div>

          {/* Real Product UI Flow Diagram */}
          <div id="product" className="mt-16 pt-8 max-w-4xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Real-time Transaction Pipeline
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-5 gap-3 text-left">
              {WORKFLOW_STEPS.map((step, idx) => (
                <div key={step.label} className="relative p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      Step 0{idx + 1}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mb-0.5">{step.label}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{step.desc}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {step.status}
                    </span>
                    {idx < WORKFLOW_STEPS.length - 1 && (
                      <ArrowRight size={12} className="hidden md:block text-slate-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="bg-white py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Enterprise-grade infrastructure for AI commerce
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Built for high reliability, deterministic pricing validation, and zero scraping ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 text-slate-900">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Implementation Steps */}
      <section className="bg-slate-50/50 py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Merchant Setup
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                Connect once. Stay discoverable forever.
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed text-sm">
                CoreStudy provides structured APIs that make your catalog discoverable by LLM agents, assistants, and automated procurement bots.
              </p>

              <div className="space-y-4">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-3.5 p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-semibold">
                      {i + 1}
                    </div>
                    <span className="text-sm text-slate-800 font-medium">{step}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/auth">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
                    Get Agent-Ready <ArrowRight size={15} />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Developer Code Preview Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl font-mono text-xs text-slate-300 leading-relaxed space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span>agent_catalog_api.http</span>
              </div>
              <div className="text-slate-500">// 1. Agent queries catalog with natural language</div>
              <div>
                <span className="text-blue-400 font-semibold">GET</span> <span className="text-slate-100">/v1/catalog/search?q=sepatu+lari+43&maxPrice=1500000</span>
              </div>
              
              <div className="pt-2 text-slate-500">// 2. Agent creates verified checkout</div>
              <div>
                <span className="text-emerald-400 font-semibold">POST</span> <span className="text-slate-100">/v1/checkouts</span>
              </div>
              <div className="text-slate-400 pl-4">{`{ "merchantId": "mch_01", "items": [{ "variantId": "var_8812", "qty": 1 }] }`}</div>

              <div className="pt-2 text-slate-500">// 3. System returns server-validated checkout URL</div>
              <div className="text-emerald-400 bg-emerald-950/40 p-2.5 rounded border border-emerald-800/40">
                {`{ "status": "active", "checkoutUrl": "https://corestudy.commerce/checkout/chk_9012" }`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Ready to make your products discoverable?
          </h2>
          <p className="text-slate-600 text-sm mb-8">
            Join pilot merchants publishing machine-readable commerce data for next-generation AI agents.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white gap-2 px-8">
              Create Your Workspace <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium text-slate-900">
            <Boxes size={15} className="text-slate-900" />
            <span>CoreStudy</span>
          </div>
          <div className="flex gap-6">
            <Link to="/developers" className="hover:text-slate-900 transition-colors">Developers</Link>
            <Link to="/security" className="hover:text-slate-900 transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
