import { Package, ArrowRight } from "lucide-react";
import { openActivityDrawer } from "./UniversalActivityDrawer";
import type { Order } from "~backend/orders/types";

export function LiveActivityFeed({ orders }: { orders: Order[] }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-xs text-slate-500 text-center py-6">
        No recent activity detected.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.slice(0, 5).map((order) => {
        return (
          <div 
            key={order.id} 
            className="flex items-start gap-3 group cursor-pointer"
            onClick={() => openActivityDrawer({ type: "order", id: order.orderNumber, payload: order })}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 text-emerald-600 bg-emerald-50 border-emerald-200">
              <Package size={12} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                Order {order.orderNumber} created
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {new Date(order.placedAt).toLocaleTimeString()}
              </div>
            </div>
            <ArrowRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
