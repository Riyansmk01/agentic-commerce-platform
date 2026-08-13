import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Filter, Users, Plus, ChevronDown, CheckCircle2, Save, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Segments() {
  const [rules, setRules] = useState([
    { id: 1, field: "Total Spent", operator: "is greater than", value: "Rp5.000.000" },
    { id: 2, field: "Last Order Date", operator: "is in the last", value: "90 days" },
    { id: 3, field: "Favorite Category", operator: "is", value: "Running Shoes" }
  ]);

  const addRule = () => {
    setRules([...rules, { id: Date.now(), field: "Any Field", operator: "equals", value: "" }]);
  };

  const removeRule = (id: number) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Segment Builder"
          subtitle="Group your customers dynamically for targeted analytics and automated workflows."
        />
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-300 text-slate-700 h-9">Cancel</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white h-9 shadow-sm gap-2">
            <Save size={14} /> Save Segment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Builder Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
                <Filter size={20} />
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  defaultValue="High Value Runners" 
                  className="text-lg font-bold text-slate-900 bg-transparent border-none outline-none focus:ring-0 p-0 w-full"
                />
                <div className="text-xs text-slate-500 mt-0.5">Customers matching ALL of the following rules</div>
              </div>
            </div>

            <div className="p-6 bg-white space-y-4">
              {rules.map((rule, idx) => (
                <div key={rule.id} className="relative">
                  {idx > 0 && (
                    <div className="absolute -top-4 left-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2">
                      AND
                    </div>
                  )}
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 group transition-colors hover:border-slate-300">
                    
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div className="relative">
                        <select className="w-full appearance-none bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm cursor-pointer">
                          <option>{rule.field}</option>
                          <option>Total Spent</option>
                          <option>Last Order Date</option>
                          <option>Favorite Category</option>
                          <option>Agent Traffic Source</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                      
                      <div className="relative">
                        <select className="w-full appearance-none bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm cursor-pointer">
                          <option>{rule.operator}</option>
                          <option>is</option>
                          <option>is greater than</option>
                          <option>is less than</option>
                          <option>is in the last</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>

                      <input 
                        type="text" 
                        defaultValue={rule.value} 
                        placeholder="Value"
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                    
                    <button 
                      onClick={() => removeRule(rule.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <button 
                onClick={addRule}
                className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 border-dashed rounded-lg px-4 py-3 w-full justify-center transition-colors mt-4"
              >
                <Plus size={14} /> Add Rule
              </button>
            </div>
          </div>
        </div>

        {/* Audience Preview */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xs overflow-hidden relative">
            <div className="absolute top-0 right-0 p-24 bg-emerald-500/10 blur-[60px] rounded-full mix-blend-screen pointer-events-none" />
            
            <div className="p-6 relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                <Users size={14} className="text-emerald-500" /> Estimated Audience
              </h3>
              
              <div className="text-4xl font-bold text-white mb-2">1,284</div>
              <div className="text-sm text-slate-400 mb-6">Customers match these criteria</div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Average LTV</span>
                  <span className="text-white font-semibold">Rp11.2M</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Potential Value</span>
                  <span className="text-emerald-400 font-bold tracking-wide">Rp14.3B</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-800 p-4 bg-slate-950/50">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <div>Audience Quality: <span className="text-emerald-500 font-bold ml-1">Very High</span></div>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Recommended Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors group">
                Create Email Campaign
                <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </button>
              <button className="w-full flex items-center justify-between p-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors group">
                Sync to Facebook Ads
                <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </button>
              <button className="w-full flex items-center justify-between p-3 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors group">
                Build Automation Workflow
                <ArrowRight size={14} className="text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
