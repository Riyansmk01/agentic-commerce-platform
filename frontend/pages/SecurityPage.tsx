import { Link } from "react-router-dom";
import { Boxes, Shield, Lock, Key, Server, Eye } from "lucide-react";

const PRACTICES = [
  {
    icon: Lock,
    title: "Payment security",
    items: [
      "Server-calculated totals — client-supplied amounts are never trusted",
      "Independent provider reconciliation before marking any order paid",
      "Idempotent webhook processing with unique constraints",
      "Raw payment secrets stored server-side only, never in frontend bundles",
    ],
  },
  {
    icon: Key,
    title: "API keys",
    items: [
      "Keys are hashed (SHA-256) on creation — raw key displayed only once",
      "Scoped permissions: catalog:read, checkout:create, orders:read",
      "Instant revocation available",
      "Last-used timestamp and audit log on every key action",
    ],
  },
  {
    icon: Server,
    title: "Infrastructure",
    items: [
      "Cloudflare WAF and rate limiting at the perimeter",
      "All secrets managed server-side — nothing sensitive in VITE_ env vars",
      "Row-level security on every database table",
      "Organization isolation enforced at the database level",
    ],
  },
  {
    icon: Eye,
    title: "Audit and observability",
    items: [
      "Every sensitive action produces an immutable audit log entry",
      "Request IDs on every API response for traceability",
      "Webhook delivery logs with payload hashes",
      "Error monitoring with redacted sensitive fields",
    ],
  },
];

export default function SecurityPage() {
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
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-900">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">Security & Trust Model</h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm leading-relaxed">
            CoreStudy is designed as core infrastructure for payment and catalog data. Security controls, price verification, and merchant isolation are enforced at the protocol level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRACTICES.map(({ icon: Icon, title, items }) => (
            <div key={title} className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900">
                  <Icon size={16} />
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
              </div>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-xl border border-slate-200 bg-slate-50 text-center">
          <h3 className="font-semibold text-slate-900 text-sm mb-1">Responsible Disclosure</h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            If you discover a potential vulnerability or security issue in CoreStudy infrastructure, please report it to our engineering security team.
          </p>
        </div>
      </div>
    </div>
  );
}
