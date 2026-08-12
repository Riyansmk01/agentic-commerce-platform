import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import backend from "~backend/client";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "../lib/utils";
import { Plus, Upload, Search, Package, RefreshCw } from "lucide-react";
import type { Product } from "~backend/catalog/types";

function statusVariant(s: string) {
  if (s === "active") return "success" as const;
  if (s === "draft") return "warning" as const;
  if (s === "archived") return "neutral" as const;
  return "neutral" as const;
}

export default function CatalogList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const orgId = user?.organizationId ?? "";

  const load = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await backend.catalog.listProducts({
        organizationId: orgId,
        search: search || undefined,
        status: statusFilter || undefined,
        limit: 50,
      });
      setProducts(res?.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [orgId, search, statusFilter]);

  const displayProducts = products;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog"
        subtitle="Manage SKU items, pricing, inventory availability, and media"
        actions={
          <div className="flex gap-2">
            <Link to="/app/catalog/import">
              <Button variant="outline" size="sm" className="gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 h-8 text-xs font-medium">
                <Upload size={14} /> Import CSV
              </Button>
            </Link>
            <Link to="/app/catalog/new">
              <Button size="sm" className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white h-8 text-xs font-medium">
                <Plus size={14} /> New Product
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, brand, SKU..."
            className="pl-9 h-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs shadow-2xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs bg-white border border-slate-200 rounded-lg px-3 h-9 text-slate-700 font-medium focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <Button variant="ghost" size="icon-sm" onClick={load} className="text-slate-500 hover:text-slate-900 border border-slate-200 bg-white">
          <RefreshCw size={13} />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100/70 border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-200 bg-grid-pattern shadow-2xs relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mx-auto mb-4 text-slate-900">
            <Package size={22} />
          </div>
          <div className="text-slate-900 font-semibold mb-1 text-base">No products in catalog yet</div>
          <div className="text-xs text-slate-500 max-w-xs mx-auto mb-6 leading-relaxed">
            Import your CSV catalog or create your first product to get started.
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link to="/app/catalog/import">
              <Button variant="outline" size="sm" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 gap-1.5">
                <Upload size={14} /> Import CSV
              </Button>
            </Link>
            <Link to="/app/catalog/new">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5">
                <Plus size={14} /> Create Product
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Brand / Category</th>
                <th className="px-4 py-3 font-semibold">Variants</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayProducts.map((product) => {
                const firstVariant = product.variants?.[0];
                const price = firstVariant?.price;
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    onClick={() => navigate(`/app/catalog/${product.id}`)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {product.primaryImageUrl ? (
                          <img src={product.primaryImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-200 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                            <Package size={16} />
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{product.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{product.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-medium text-slate-700">{product.brand ?? "—"}</div>
                      <div className="text-[11px] text-slate-400">{product.category ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">{product.variants?.length ?? 0}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-900">
                      {price ? formatCurrency(price.saleAmount ?? price.listAmount, price.currency) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge label={product.status} variant={statusVariant(product.status)} dot />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
