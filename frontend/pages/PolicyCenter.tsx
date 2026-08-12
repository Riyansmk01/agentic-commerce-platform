import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import backend from "~backend/client";
import { PageHeader } from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Shield, RefreshCw, ShoppingBag, XCircle, Wrench, Lock, FileText, Save } from "lucide-react";
import type { PolicyType, MerchantPolicy } from "~backend/policies/types";

const POLICY_DEFS: { type: PolicyType; label: string; desc: string; icon: React.ElementType }[] = [
  { type: "returns", label: "Return Policy", desc: "How customers can return products", icon: RefreshCw },
  { type: "refunds", label: "Refund Policy", desc: "Refund timelines and conditions", icon: ShoppingBag },
  { type: "shipping", label: "Shipping Policy", desc: "Delivery methods and timelines", icon: ShoppingBag },
  { type: "cancellation", label: "Cancellation Policy", desc: "Order cancellation rules", icon: XCircle },
  { type: "warranty", label: "Warranty", desc: "Product warranty terms", icon: Wrench },
  { type: "privacy", label: "Privacy Policy", desc: "How customer data is handled", icon: Lock },
  { type: "terms", label: "Terms of Service", desc: "Merchant terms and conditions", icon: FileText },
];

interface PolicyForm {
  title: string;
  summary: string;
  fullUrl: string;
  active: boolean;
}

export default function PolicyCenter() {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? "";
  const [policies, setPolicies] = useState<Record<PolicyType, MerchantPolicy | null>>({} as Record<PolicyType, MerchantPolicy | null>);
  const [forms, setForms] = useState<Record<PolicyType, PolicyForm>>({} as Record<PolicyType, PolicyForm>);
  const [saving, setSaving] = useState<PolicyType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    const emptyForm = (): PolicyForm => ({ title: "", summary: "", fullUrl: "", active: true });
    const initialForms: Record<string, PolicyForm> = {};
    POLICY_DEFS.forEach(p => { initialForms[p.type] = emptyForm(); });
    setForms(initialForms as Record<PolicyType, PolicyForm>);

    backend.policies.listPolicies({ organizationId: orgId })
      .then(r => {
        const map: Record<string, MerchantPolicy | null> = {};
        POLICY_DEFS.forEach(p => { map[p.type] = null; });
        const list = r?.policies || [];
        for (const pol of list) {
          map[pol.policyType] = pol;
          initialForms[pol.policyType] = {
            title: pol.title,
            summary: pol.summary ?? "",
            fullUrl: pol.fullUrl ?? "",
            active: pol.active,
          };
        }
        setPolicies(map as Record<PolicyType, MerchantPolicy | null>);
        setForms({ ...initialForms } as Record<PolicyType, PolicyForm>);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  const savePolicy = async (type: PolicyType) => {
    if (!orgId) return;
    setSaving(type);
    try {
      const form = forms[type];
      const def = POLICY_DEFS.find(p => p.type === type)!;
      await backend.policies.upsertPolicy({
        organizationId: orgId,
        policyType: type,
        title: form.title || def.label,
        summary: form.summary || undefined,
        fullUrl: form.fullUrl || undefined,
        active: form.active,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  };

  const updateForm = (type: PolicyType, field: keyof PolicyForm, value: string | boolean) => {
    setForms(f => ({ ...f, [type]: { ...f[type], [field]: value } }));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Policy Center"
        subtitle="Define returns, shipping, and warranty rules parsed by LLM agents"
      />

      <div className="space-y-4">
        {POLICY_DEFS.map(({ type, label, desc, icon: Icon }) => {
          const form = forms[type] ?? { title: "", summary: "", fullUrl: "", active: true };
          const isSaving = saving === type;
          return (
            <div key={type} className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900">
                    <Icon size={15} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{label}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Active</span>
                  <Switch
                    checked={form.active}
                    onCheckedChange={v => updateForm(type, "active", v)}
                  />
                </div>
              </div>
              <div className="space-y-3 pt-1">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1 block">Policy Summary for AI Agents</Label>
                  <Textarea
                    value={form.summary}
                    onChange={e => updateForm(type, "summary", e.target.value)}
                    placeholder="e.g. 30-day money back returns. Customer pays return shipping."
                    rows={2}
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:border-slate-900"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1 block">Full Terms URL</Label>
                  <Input
                    value={form.fullUrl}
                    onChange={e => updateForm(type, "fullUrl", e.target.value)}
                    placeholder="https://yourstore.com/returns"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <Button size="sm" onClick={() => savePolicy(type)} disabled={isSaving} className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 h-8 text-xs font-medium">
                    <Save size={13} /> {isSaving ? "Saving..." : "Save Policy"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
