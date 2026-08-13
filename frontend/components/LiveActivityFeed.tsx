import { Activity, Package, ShoppingCart, CreditCard, Search, ArrowRight } from "lucide-react";
import { openActivityDrawer } from "./UniversalActivityDrawer";

const ACTIVITIES = [
  { id: "1", type: "order", title: "Order #ORD-1827 created", time: "2m ago", refId: "ORD-1827", icon: ShoppingCart, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "2", type: "payment", title: "Payment verified by Pakasir", time: "3m ago", refId: "PAY-9182", icon: CreditCard, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "3", type: "request", title: "Catalog searched (sepatu lari)", time: "15m ago", refId: "REQ_8192", icon: Search, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { id: "4", type: "request", title: "Checkout created", time: "1h ago", refId: "REQ_8191", icon: Activity, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { id: "5", type: "order", title: "Order #ORD-1826 fulfilled", time: "2h ago", refId: "ORD-1826", icon: Package, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

export function LiveActivityFeed() {
  return (
    <div className="space-y-4">
      {ACTIVITIES.map((activity, i) => {
        const Icon = activity.icon;
        return (
          <div 
            key={activity.id} 
            className="flex items-start gap-3 group cursor-pointer"
            onClick={() => openActivityDrawer({ type: activity.type as any, id: activity.refId })}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${activity.color}`}>
              <Icon size={12} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                {activity.title}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {activity.time}
              </div>
            </div>
            <ArrowRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
