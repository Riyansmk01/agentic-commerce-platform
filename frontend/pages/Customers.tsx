import { useState } from "react";
import { Search, MapPin, Package, ShoppingCart, TrendingUp, Users, ArrowRight, MousePointerClick, Zap, Star } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { formatCurrency, formatRelativeTime } from "../lib/utils";

const mockCustomers = [
  { id: "cus_01", name: "Riyan Putra", email: "riyan@example.com", phone: "+62 812-3456-7890", orders: 18, ltv: 12840000, lastActive: "2 days ago", avatar: "R" },
  { id: "cus_02", name: "Sarah Amalia", email: "sarah.amalia@example.com", phone: "+62 813-9876-5432", orders: 5, ltv: 3450000, lastActive: "5 hours ago", avatar: "S" },
  { id: "cus_03", name: "Budi Santoso", email: "budi.s@example.com", phone: "+62 811-1122-3344", orders: 1, ltv: 850000, lastActive: "1 week ago", avatar: "B" },
];

export default function Customers() {
  const [selectedCustomer, setSelectedCustomer] = useState(mockCustomers[0]);

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
            {mockCustomers.map(customer => (
              <div 
                key={customer.id} 
                onClick={() => setSelectedCustomer(customer)}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-3 ${selectedCustomer.id === customer.id ? 'bg-indigo-50/50 relative' : ''}`}
              >
                {selectedCustomer.id === customer.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r" />
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm ${
                  selectedCustomer.id === customer.id ? 'bg-indigo-600' : 'bg-slate-300'
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
            ))}
          </div>
        </div>

        {/* Customer 360 View */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col min-h-[700px]">
          
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
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> Jakarta, Indonesia</span>
                    <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-400 fill-amber-400" /> VIP Member</span>
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
            
            {/* Preferences & Insights */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Package size={16} className="text-slate-400" /> Inferred Preferences
                </h3>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Favorite Category</div>
                    <div className="font-semibold text-slate-900">Running Shoes (72% of purchases)</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sizing Profile</div>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold shadow-sm">Shoes: 43</span>
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold shadow-sm">Apparel: L</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Color Preference</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-black shadow-sm" title="Black" />
                      <div className="w-4 h-4 rounded-full bg-slate-200 shadow-sm" title="White" />
                      <span className="text-xs text-slate-600 font-medium">Black & Monochrome</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users size={16} className="text-slate-400" /> Traffic Attribution
                </h3>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">Gemini (AI Agent)</span>
                        <span className="text-indigo-600">42%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: '42%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">Direct Website</span>
                        <span className="text-emerald-600">30%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '30%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">Instagram Ads</span>
                        <span className="text-pink-600">28%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500" style={{ width: '28%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Journey Timeline */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MousePointerClick size={16} className="text-slate-400" /> Recent Journey
              </h3>
              
              <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:left-[11px] before:h-full before:w-0.5 before:bg-slate-100">
                
                <div className="relative">
                  <div className="absolute -left-6 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm mt-1.5" />
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-sm text-slate-900">Repeat Purchase</div>
                      <span className="text-[10px] font-mono text-slate-400">2 days ago</span>
                    </div>
                    <div className="text-xs text-slate-600 mb-2">Bought "Velocity Runner X" using QRIS.</div>
                    <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-flex items-center gap-1">
                      <ShoppingCart size={10} /> + Rp1.299.000
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-sm mt-1.5" />
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-sm text-slate-900">Purchased</div>
                      <span className="text-[10px] font-mono text-slate-400">14 days ago</span>
                    </div>
                    <div className="text-xs text-slate-600">Successfully recovered abandoned checkout via 10% discount email.</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-sm mt-1.5" />
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-sm text-slate-900">Abandoned Checkout</div>
                      <span className="text-[10px] font-mono text-slate-400">15 days ago</span>
                    </div>
                    <div className="text-xs text-slate-500">Left "Nike Air Zoom" in cart.</div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-6 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm mt-1.5" />
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-sm text-slate-900">Agent Search (Gemini)</div>
                      <span className="text-[10px] font-mono text-slate-400">15 days ago</span>
                    </div>
                    <div className="text-xs text-slate-500 italic">"rekomendasi sepatu lari empuk size 43"</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
