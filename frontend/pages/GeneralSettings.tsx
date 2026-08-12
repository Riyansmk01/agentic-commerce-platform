import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import backend from "~backend/client";
import { PageHeader } from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

export default function GeneralSettings() {
  const { user, updateUser } = useAuth();
  const orgId = user?.organizationId ?? "";

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [website, setWebsite] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) { setLoading(false); return; }
    const slug = user?.organizationSlug ?? "";
    const fetchOrg = slug
      ? backend.merchants.getOrganization({ slug }).catch(() => null)
      : Promise.resolve(null);
    Promise.all([
      fetchOrg,
      backend.merchants.getMerchantProfile({ id: orgId }).catch(() => null),
    ]).then(([org, profile]) => {
      if (org?.organization) {
        setName(org.organization.name);
        setSlug(org.organization.slug);
        setWebsite(org.organization.websiteUrl ?? "");
        setLogoUrl(org.organization.logoUrl ?? "");
      }
      if (profile?.profile) {
        setSupportEmail(profile.profile.supportEmail ?? "");
        setSupportPhone(profile.profile.supportPhone ?? "");
        setDescription(profile.profile.description ?? "");
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [orgId]);

  const save = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      await backend.merchants.updateOrganization({ id: orgId, name, websiteUrl: website, logoUrl });
      await backend.merchants.updateMerchantProfile({ id: orgId, displayName: name, supportEmail, supportPhone, description });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Settings"
        subtitle="Manage organization parameters and public metadata"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Organization Parameters</h3>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Merchant Display Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Store name" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Permanent Identifier Slug</Label>
              <Input value={slug} disabled className="bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed font-mono text-xs" />
              <p className="text-[11px] text-slate-500 mt-1">Unique slug used in agent discovery routing</p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Website URL</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourstore.com" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Brand Logo URL</Label>
              <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Support & Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Support Email</Label>
                <Input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="support@yourstore.com" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">WhatsApp / Hotline</Label>
                <Input value={supportPhone} onChange={e => setSupportPhone(e.target.value)} placeholder="+62 812..." />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Merchant Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder="Brief summary of your product offerings..."
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:border-slate-900" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 h-9 text-xs font-medium px-6">
              <Save size={14} /> {saving ? "Saving..." : saved ? "Saved Successfully" : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {logoUrl && (
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Logo Preview</h3>
              <img src={logoUrl} alt="Logo" className="w-20 h-20 rounded-xl object-cover bg-slate-50 border border-slate-200" />
            </div>
          )}
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Organization ID</h3>
            <code className="text-xs font-mono text-slate-600 break-all">{orgId || "—"}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
