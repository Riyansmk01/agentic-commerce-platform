import { useEffect, useState } from "react";
import backend from "~backend/client";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Building2 } from "lucide-react";

export default function AdminMerchants() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await backend.admin.listMerchants({ limit: 50 });
      setMerchants(res.merchants);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registered Merchants"
        subtitle="Manage and audit merchant organization accounts"
        actions={
          <Button variant="outline" size="sm" onClick={load} className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 h-8 text-xs font-medium">
            <RefreshCw size={13} /> Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-100/70 border border-slate-200 animate-pulse" />)}
        </div>
      ) : merchants.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-200 bg-grid-pattern shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mx-auto mb-4 text-slate-900">
            <Building2 size={22} />
          </div>
          <div className="text-slate-900 font-semibold mb-1 text-base">No registered merchants found</div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Country</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {merchants.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{m.name}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600 font-medium">{m.slug}</td>
                  <td className="px-4 py-3.5 text-slate-700">{m.countryCode}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge label={m.status} variant={m.status === "active" ? "success" : "error"} dot />
                  </td>
                  <td className="px-4 py-3.5">
                    {m.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try { await backend.admin.suspendMerchant({ id: m.id }); load(); }
                          catch (e) { console.error(e); }
                        }}
                        className="text-xs text-slate-400 hover:text-red-600 h-7"
                      >
                        Suspend Access
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
