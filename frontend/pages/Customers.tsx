import { useState } from "react";
import { Search, MapPin, Package, ShoppingCart, TrendingUp, Users, ArrowRight, MousePointerClick, Zap, Star } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { formatCurrency, formatRelativeTime } from "../lib/utils";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Customer Intelligence"
        subtitle="Manage relationships, track lifetime value, and analyze purchase journeys."
      />

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Customer List Sidebar */}
        <div className="w-full lg:w-80 shrink-0 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col h-[700px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {customers.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No customer data available yet.
              </div>
            ) : (
              customers.map(customer => (
                <div 
                  key={customer.id} 
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-3 ${selectedCustomer?.id === customer.id ? 'bg-indigo-50/50 relative' : ''}`}
                >
                  {selectedCustomer?.id === customer.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r" />
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm ${
                    selectedCustomer?.id === customer.id ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}>
                    {customer.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate text-sm">{customer.name}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{customer.email}</div>
                    <div className="text-[10px] font-semibold text-emerald-600 mt-1.5 flex items-center gap-1">
                      <TrendingUp size={10} /> {formatCurrency(customer.ltv, "IDR")} LTV
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer 360 View */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col min-h-[700px]">
          {!selectedCustomer ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4">
              <Users size={48} className="text-slate-200" />
              <div>
                <div className="text-sm font-semibold text-slate-700">No Customer Selected</div>
                <div className="text-xs mt-1">Select a customer from the directory to view their complete profile and journey.</div>
              </div>
            </div>
          ) : (
            <>
              <div className="p-8 border-b border-slate-200 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-200">
                      {selectedCustomer.avatar}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedCustomer.name}</h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {selectedCustomer.location || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Lifetime Value</div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(selectedCustomer.ltv, "IDR")}</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-8 relative z-10">
                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 mb-1">Total Orders</div>
                    <div className="font-semibold text-slate-900 text-lg">{selectedCustomer.orders}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 mb-1">Average Order</div>
                    <div className="font-semibold text-slate-900 text-lg">{formatCurrency(selectedCustomer.ltv / selectedCustomer.orders, "IDR")}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 mb-1">Last Active</div>
                    <div className="font-semibold text-slate-900 text-lg">{selectedCustomer.lastActive}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 mb-1">Primary Source</div>
                    <div className="font-semibold text-indigo-600 text-lg flex items-center gap-1.5">
                      <Zap size={16} /> AI Agents
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1 grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="text-sm text-slate-500 italic text-center col-span-full py-12">
                  Customer insights will appear here when real activity is recorded.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
