import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Plus, Play, Zap, Filter, Bell, ShoppingBag, ArrowRight, Settings, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Workflows() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Workflow Builder"
          subtitle="Design automated operations using simple triggers, conditions, and actions."
        />
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-300 text-slate-700 h-9">Cancel</Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white h-9 shadow-sm gap-2">
            <Check size={14} /> Publish Workflow
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div>
          <input 
            type="text" 
            defaultValue="VIP High-Value Order Alert" 
            className="text-lg font-bold text-slate-900 bg-transparent border-none outline-none focus:ring-0 p-0 w-[400px]"
          />
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Active</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={12} /> Last triggered 2 hours ago</span>
          </div>
        </div>
        <div>
          <Button variant="outline" className="h-8 text-xs font-semibold gap-1.5"><Play size={12} /> Test Run</Button>
        </div>
      </div>

      <div className="relative pt-6 flex flex-col items-center">
        
        {/* Connection Line */}
        <div className="absolute top-0 bottom-10 left-1/2 -translate-x-1/2 w-0.5 bg-slate-200 -z-10" />

        {/* 1. TRIGGER NODE */}
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow relative group">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer hover:bg-slate-50">
            <Settings size={12} className="text-slate-500" />
          </div>
          
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50 rounded-t-xl">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Zap size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Trigger</div>
              <div className="text-sm font-semibold text-slate-900">Order Created</div>
            </div>
          </div>
          <div className="p-4">
            <div className="text-xs text-slate-500 mb-2">Listen to events from:</div>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-200 w-fit">
              <ShoppingBag size={14} className="text-slate-700" />
              <span className="text-sm font-medium text-slate-900">All Sales Channels</span>
            </div>
          </div>
        </div>

        {/* Plus Button */}
        <div className="h-12 flex items-center justify-center relative">
          <button className="w-6 h-6 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors relative z-10">
            <Plus size={14} />
          </button>
        </div>

        {/* 2. CONDITION NODE */}
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow relative group">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer hover:bg-slate-50">
            <Settings size={12} className="text-slate-500" />
          </div>

          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50 rounded-t-xl">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200">
              <Filter size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">Condition</div>
              <div className="text-sm font-semibold text-slate-900">Total Value {">"} Rp 5.000.000</div>
            </div>
          </div>
          <div className="p-4">
            <div className="text-xs text-slate-500 mb-2">Continue only if:</div>
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-sm font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">Order.total_value</div>
              <div className="text-sm font-semibold text-slate-500">is greater than</div>
              <div className="text-sm font-medium text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">5000000</div>
            </div>
          </div>
        </div>

        {/* Plus Button */}
        <div className="h-12 flex items-center justify-center relative">
          <button className="w-6 h-6 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors relative z-10">
            <Plus size={14} />
          </button>
        </div>

        {/* 3. ACTION NODE */}
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow relative group">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer hover:bg-slate-50">
            <Settings size={12} className="text-slate-500" />
          </div>

          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50 rounded-t-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Bell size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Action</div>
              <div className="text-sm font-semibold text-slate-900">Send Slack Notification</div>
            </div>
          </div>
          <div className="p-4">
            <div className="text-xs text-slate-500 mb-2">Message template:</div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap">
              🚨 *VIP ORDER ALERT* 🚨{"\n\n"}
              Customer: {"{Order.customer_name}"}{"\n"}
              Value: {"{Order.formatted_total}"}{"\n"}
              Items: {"{Order.item_count}"}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
              <ArrowRight size={12} /> Sending to channel: <span className="font-semibold text-slate-700">#vip-orders</span>
            </div>
          </div>
        </div>

        {/* Final Plus Button */}
        <div className="h-16 flex items-center justify-center relative">
          <button className="h-10 px-4 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors relative z-10 gap-2">
            <Plus size={16} /> Add Next Step
          </button>
        </div>

      </div>
    </div>
  );
}
