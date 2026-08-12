import { PageHeader } from "../../components/PageHeader";
import { AlertCircle } from "lucide-react";

export default function AdminWebhooks() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhook Failure Telemetry"
        subtitle="Monitor and replay failed webhook event notifications"
      />
      <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-2xs">
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-900">
          <AlertCircle size={22} />
        </div>
        <div className="text-slate-900 font-semibold mb-1 text-base">Zero Webhook Delivery Failures</div>
        <div className="text-xs text-slate-500 max-w-xs mx-auto">Failed payload dispatches will appear here for automated retry analysis.</div>
      </div>
    </div>
  );
}
