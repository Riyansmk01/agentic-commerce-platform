import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Key, Plus, Copy, Eye, EyeOff, Trash2, AlertCircle } from "lucide-react";
import { formatDate } from "../lib/utils";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  status: string;
  lastUsedAt?: Date;
  createdAt: Date;
}

const AVAILABLE_SCOPES = [
  { id: "catalog:read", label: "Catalog Read", desc: "Search and read products" },
  { id: "policies:read", label: "Policies Read", desc: "Read merchant policies" },
  { id: "checkout:create", label: "Checkout Create", desc: "Create checkout sessions" },
  { id: "checkout:read", label: "Checkout Read", desc: "Get checkout status" },
  { id: "orders:read", label: "Orders Read", desc: "Get order status" },
];

export default function APIKeys() {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? "";
  
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["catalog:read"]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [creating, setCreating] = useState(false);

  const toggleScope = (scope: string) => {
    setSelectedScopes(s => s.includes(scope) ? s.filter(x => x !== scope) : [...s, scope]);
  };

  const createKey = async () => {
    if (!newKeyName || !orgId) return;
    setCreating(true);
    try {
      const prefix = `sk_live_${Math.random().toString(36).slice(2, 10)}`;
      const fullKey = `${prefix}_${Math.random().toString(36).slice(2, 32)}`;
      const newKey: ApiKey = {
        id: Math.random().toString(36).slice(2),
        name: newKeyName,
        keyPrefix: prefix,
        scopes: selectedScopes,
        status: "active",
        createdAt: new Date(),
      };
      setKeys(k => [newKey, ...k]);
      setCreatedKey(fullKey);
      setNewKeyName("");
      setSelectedScopes(["catalog:read"]);
      setShowCreate(false);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = (id: string) => {
    setKeys(k => k.map(key => key.id === id ? { ...key, status: "revoked" } : key));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        subtitle="Create secret credentials for LLM agent integrations and partner APIs"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)} className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 h-8 text-xs font-medium">
            <Plus size={14} /> Create API Key
          </Button>
        }
      />

      {createdKey && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-slate-900 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 mb-0.5">API key created — copy it now</div>
              <div className="text-xs text-slate-600 mb-2">This secret key will never be displayed again.</div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-white border border-emerald-200 px-3 py-1.5 rounded-lg flex-1 text-slate-900 truncate">
                  {showKey ? createdKey : createdKey.replace(/./g, "•")}
                </code>
                <Button variant="outline" size="sm" onClick={() => setShowKey(s => !s)} className="h-8 w-8 p-0 text-slate-600 bg-white border-emerald-200">
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(createdKey)} className="h-8 w-8 p-0 text-slate-600 bg-white border-emerald-200">
                  <Copy size={13} />
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="icon-xs" onClick={() => setCreatedKey(null)} className="text-slate-400 hover:text-slate-700">
              ×
            </Button>
          </div>
        </div>
      )}

      {keys.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-200 bg-grid-pattern shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mx-auto mb-4 text-slate-900">
            <Key size={22} />
          </div>
          <div className="text-slate-900 font-semibold mb-1 text-base">No active API keys</div>
          <div className="text-xs text-slate-500 max-w-xs mx-auto mb-6 leading-relaxed">
            Generate your first secret key to authorize AI agents for product discovery and checkout creation.
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)} className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 h-8 text-xs font-medium">
            <Plus size={14} /> Create Secret Key
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Prefix</th>
                <th className="px-4 py-3 font-semibold">Scopes</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last Used</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.map(key => (
                <tr key={key.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{key.name}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600 font-medium">{key.keyPrefix}...</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map(s => (
                        <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono font-medium">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge label={key.status} variant={key.status === "active" ? "success" : "error"} dot />
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{key.lastUsedAt ? formatDate(key.lastUsedAt) : "Never"}</td>
                  <td className="px-4 py-3.5 text-slate-500">{formatDate(key.createdAt)}</td>
                  <td className="px-4 py-3.5 text-right">
                    {key.status === "active" && (
                      <Button variant="ghost" size="sm" onClick={() => revokeKey(key.id)} className="h-7 text-slate-400 hover:text-red-600 gap-1 text-xs">
                        <Trash2 size={12} /> Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md shadow-xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-base font-semibold">Generate Secret API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Key Description</Label>
              <Input
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="e.g. Production Agent Server"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-2 block">Allowed API Scopes</Label>
              <div className="space-y-2.5">
                {AVAILABLE_SCOPES.map(({ id, label, desc }) => (
                  <label key={id} className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(id)}
                      onChange={() => toggleScope(id)}
                      className="mt-0.5 accent-slate-900"
                    />
                    <div>
                      <div className="text-xs text-slate-900 font-mono font-semibold">{id}</div>
                      <div className="text-[11px] text-slate-500">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)} className="border-slate-200 text-slate-700 hover:bg-slate-50 h-8 text-xs font-medium">
              Cancel
            </Button>
            <Button onClick={createKey} disabled={creating || !newKeyName} className="bg-slate-900 hover:bg-slate-800 text-white h-8 text-xs font-medium">
              {creating ? "Generating..." : "Generate Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
