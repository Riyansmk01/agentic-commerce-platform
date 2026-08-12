import { useAuth } from "../lib/auth-context";
import { PageHeader } from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, Key, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SecuritySettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/auth");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Sessions"
        subtitle="Session management, API credential access, and security policies"
      />

      <div className="max-w-xl space-y-6">
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={16} className="text-slate-900" />
            <h3 className="text-sm font-semibold text-slate-900">Active User Session</h3>
          </div>
          <div className="space-y-2.5 mb-5 divide-y divide-slate-100">
            <div className="flex justify-between text-xs pt-1">
              <span className="text-slate-500">Authenticated User</span>
              <span className="text-slate-900 font-semibold">{user?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between text-xs pt-2">
              <span className="text-slate-500">Email Address</span>
              <span className="text-slate-900 font-mono">{user?.email ?? "—"}</span>
            </div>
            <div className="flex justify-between text-xs pt-2">
              <span className="text-slate-500">Account Access Role</span>
              <span className="text-slate-900 capitalize font-medium">{user?.role ?? "—"}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 h-8 text-xs font-medium"
          >
            <LogOut size={13} /> Sign Out Session
          </Button>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center gap-3 mb-3">
            <Key size={16} className="text-slate-900" />
            <h3 className="text-sm font-semibold text-slate-900">API Key Credentials</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Manage granular secret keys for agent server authentications and checkout creation routes.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/app/integrations/api")}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 h-8 text-xs font-medium"
          >
            Manage API Keys
          </Button>
        </div>

        <div className="p-6 rounded-xl border border-amber-200 bg-amber-50 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Security Best Practices</h3>
              <ul className="text-xs text-slate-600 space-y-1 leading-relaxed">
                <li>• API secret keys are presented only once at creation — store them in your vault.</li>
                <li>• Instantly revoke any key if exposure or unauthorized access is suspected.</li>
                <li>• Never embed secret keys in client-side code or public repositories.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
