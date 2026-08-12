import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../lib/auth-context";
import backend from "~backend/client";
import { useToast } from "@/components/ui/use-toast";
import { Check, ChevronRight, Boxes } from "lucide-react";
import { cn } from "../lib/utils";

const STEPS = [
  "Create Workspace",
  "Business Identity",
  "Catalog Source",
  "Policies",
  "Publish & Test",
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  const [workspace, setWorkspace] = useState({
    name: "", slug: "", countryCode: "ID", timezone: "Asia/Jakarta",
    currency: "IDR", websiteUrl: "",
  });
  const [identity, setIdentity] = useState({
    displayName: "", description: "", supportEmail: "", supportPhone: "",
  });
  const [catalogChoice, setCatalogChoice] = useState<"demo" | "csv" | "manual">("demo");

  const handleWorkspaceSubmit = async () => {
    if (!workspace.name || !workspace.slug) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await backend.merchants.createOrganization({
        name: workspace.name,
        slug: workspace.slug,
        countryCode: workspace.countryCode,
        timezone: workspace.timezone,
        currency: workspace.currency,
        websiteUrl: workspace.websiteUrl || undefined,
        createdBy: user!.id,
      });
      setOrgId(result.organization.id);
      updateUser({ organizationId: result.organization.id, organizationSlug: result.organization.slug });
      setStep(1);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to create workspace", description: err?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleIdentitySubmit = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      await backend.merchants.updateMerchantProfile({
        id: orgId,
        displayName: identity.displayName || workspace.name,
        description: identity.description || undefined,
        supportEmail: identity.supportEmail || undefined,
        supportPhone: identity.supportPhone || undefined,
      });
      setStep(2);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to save identity", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCatalogSubmit = async () => {
    if (!orgId) return;
    if (catalogChoice === "demo") {
      setLoading(true);
      try {
        await backend.catalog.createDemoProducts({ organizationId: orgId });
        toast({ title: "Demo catalog created!", description: "5 sample Indonesian products added." });
      } catch (err: any) {
        console.error(err);
        toast({ title: "Failed to create demo products", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    setStep(3);
  };

  const handlePoliciesSubmit = () => {
    setStep(4);
  };

  const handleFinish = () => {
    navigate("/app/overview");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 bg-grid-pattern relative">
      <div className="border-b border-slate-200 bg-white h-16 flex items-center px-8 shadow-2xs relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Boxes size={18} />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900">Agentic Commerce</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <div className={cn(
                "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
                i < step ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                i === step ? "bg-slate-900 border-slate-900 text-white" :
                "bg-white border-slate-200 text-slate-400"
              )}>
                {i < step ? <Check size={12} /> : <span>{i + 1}</span>}
                {s}
              </div>
              {i < STEPS.length - 1 && <ChevronRight size={13} className="text-slate-300" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your merchant workspace</h2>
              <p className="text-xs text-slate-500 mt-1">Configure your organization instance for agent discovery.</p>
            </div>
            <div className="space-y-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold">Store / Organization Name *</Label>
                <Input
                  value={workspace.name}
                  onChange={e => {
                    setWorkspace(w => ({ ...w, name: e.target.value, slug: slugify(e.target.value) }));
                  }}
                  placeholder="Toko Budi Fashion"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold">Workspace Slug *</Label>
                <Input
                  value={workspace.slug}
                  onChange={e => setWorkspace(w => ({ ...w, slug: slugify(e.target.value) }))}
                  placeholder="toko-budi-fashion"
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400">Used in API routing endpoints: agentapi.domain/toko-budi-fashion</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-semibold">Country</Label>
                  <Input value={workspace.countryCode} onChange={e => setWorkspace(w => ({ ...w, countryCode: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-semibold">Currency</Label>
                  <Input value={workspace.currency} onChange={e => setWorkspace(w => ({ ...w, currency: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-semibold">Website</Label>
                  <Input value={workspace.websiteUrl} onChange={e => setWorkspace(w => ({ ...w, websiteUrl: e.target.value }))} placeholder="https://" />
                </div>
              </div>
            </div>
            <Button onClick={handleWorkspaceSubmit} disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 h-10 px-6 font-medium">
              {loading ? "Creating..." : "Continue"} <ChevronRight size={14} />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Business identity & support</h2>
              <p className="text-xs text-slate-500 mt-1">Help AI agents present accurate customer support info.</p>
            </div>
            <div className="space-y-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold">Display Name</Label>
                <Input value={identity.displayName} onChange={e => setIdentity(i => ({ ...i, displayName: e.target.value }))} placeholder={workspace.name} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold">Short Store Description</Label>
                <Textarea value={identity.description} onChange={e => setIdentity(i => ({ ...i, description: e.target.value }))}
                  placeholder="Official distributor of fashion & footwear..." className="bg-white border-slate-200 text-slate-900 text-xs focus:border-slate-900" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-semibold">Support Email</Label>
                  <Input type="email" value={identity.supportEmail} onChange={e => setIdentity(i => ({ ...i, supportEmail: e.target.value }))} placeholder="cs@tokobudi.id" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-semibold">WhatsApp / Phone</Label>
                  <Input value={identity.supportPhone} onChange={e => setIdentity(i => ({ ...i, supportPhone: e.target.value }))} placeholder="+62 812..." />
                </div>
              </div>
            </div>
            <Button onClick={handleIdentitySubmit} disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 h-10 px-6 font-medium">
              {loading ? "Saving..." : "Continue"} <ChevronRight size={14} />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Populate product catalog</h2>
              <p className="text-xs text-slate-500 mt-1">Select your initial data seeding preference.</p>
            </div>
            <div className="grid gap-4">
              {[
                { id: "demo", label: "Load Demo Catalog", desc: "5 sample Indonesian fashion products with variants & prices." },
                { id: "csv", label: "Import CSV File", desc: "Batch upload product spreadsheet file." },
                { id: "manual", label: "Add Manually", desc: "Create items individually in the catalog editor." },
              ].map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setCatalogChoice(id as any)}
                  className={cn(
                    "text-left p-5 rounded-xl border transition-colors shadow-2xs cursor-pointer",
                    catalogChoice === id
                      ? "border-slate-900 bg-white ring-1 ring-slate-900"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                      catalogChoice === id ? "border-slate-900" : "border-slate-300")}>
                      {catalogChoice === id && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                    </div>
                    <span className="font-semibold text-sm text-slate-900">{label}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 ml-7">{desc}</p>
                </button>
              ))}
            </div>
            <Button onClick={handleCatalogSubmit} disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 h-10 px-6 font-medium">
              {loading ? "Initializing..." : "Continue"} <ChevronRight size={14} />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Configure merchant policies</h2>
              <p className="text-xs text-slate-500 mt-1">AI agents read these rules before finalizing order checkouts.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
              {["returns", "shipping", "cancellation"].map(type => (
                <div key={type} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 capitalize">{type} Policy</div>
                    <div className="text-[11px] text-slate-400">Default fallback policy active</div>
                  </div>
                  <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded font-medium">Optional</span>
                </div>
              ))}
            </div>
            <Button onClick={handlePoliciesSubmit} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 h-10 px-6 font-medium">
              Continue <ChevronRight size={14} />
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-6 py-8 bg-white border border-slate-200 rounded-2xl shadow-2xs p-10">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
              <Check size={32} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Your Merchant Workspace is Agent-Ready!</h2>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                Your commerce platform has been provisioned. Access the dashboard to inspect catalog items, calculate readiness scores, and test natural language queries.
              </p>
            </div>
            <Button onClick={handleFinish} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 px-8 h-10 font-medium">
              Open Dashboard <ChevronRight size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
