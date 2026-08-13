import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import backend from "~backend/client";
import { PageHeader } from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency } from "../lib/utils";
import { Save, Plus, Trash2, ArrowLeft } from "lucide-react";
import type { Product, ProductVariant } from "~backend/catalog/types";

interface VariantForm {
  id?: string;
  title: string;
  sku: string;
  listAmount: string;
  saleAmount: string;
  quantityAvailable: string;
  imageUrl: string;
}

export default function ProductEditor() {
  const { productId } = useParams<{ productId: string }>();
  const isNew = !productId || productId === "new";
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.organizationId ?? "";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [primaryImageUrl, setPrimaryImageUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "archived">("draft");
  const [variants, setVariants] = useState<VariantForm[]>([
    { title: "Default", sku: "", listAmount: "", saleAmount: "", quantityAvailable: "", imageUrl: "" },
  ]);

  useEffect(() => {
    if (isNew) return;
    backend.catalog.getProduct({ id: productId! })
      .then(r => {
        if (!r?.product) return;
        const p = r.product;
        setProduct(p);
        setTitle(p.title);
        setDescription(p.description ?? "");
        setBrand(p.brand ?? "");
        setCategory(p.category ?? "");
        setProductUrl(p.productUrl ?? "");
        setPrimaryImageUrl(p.primaryImageUrl ?? "");
        setStatus(p.status);
        setVariants(p.variants?.map(v => ({
          id: v.id,
          title: v.title,
          sku: v.sku ?? "",
          listAmount: v.price?.listAmount?.toString() ?? "",
          saleAmount: v.price?.saleAmount?.toString() ?? "",
          quantityAvailable: v.inventory?.quantityAvailable?.toString() ?? "",
          imageUrl: v.imageUrl ?? "",
        })) ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId, isNew]);

  const save = async () => {
    if (!orgId || !title) return;
    setSaving(true);
    try {
      if (isNew) {
        const res = await backend.catalog.createProduct({ organizationId: orgId, title, description, brand, category, productUrl, primaryImageUrl });
        const pid = res?.product?.id;
        if (!pid) throw new Error("Failed to create product, no ID returned.");
        for (const v of variants) {
          await backend.catalog.createVariant({
            id: pid,
            organizationId: orgId,
            title: v.title || "Default",
            sku: v.sku || undefined,
            listAmount: v.listAmount ? parseInt(v.listAmount) : undefined,
            saleAmount: v.saleAmount ? parseInt(v.saleAmount) : undefined,
            quantityAvailable: v.quantityAvailable ? parseInt(v.quantityAvailable) : undefined,
            imageUrl: v.imageUrl || undefined,
          });
        }
        navigate(`/app/catalog/${pid}`);
      } else {
        await backend.catalog.updateProduct({ id: productId!, title, description, brand, category, productUrl, primaryImageUrl, status });
        for (const v of variants) {
          if (v.id) {
            await backend.catalog.updateVariant({
              id: v.id,
              title: v.title,
              sku: v.sku || undefined,
              listAmount: v.listAmount ? parseInt(v.listAmount) : undefined,
              saleAmount: v.saleAmount ? parseInt(v.saleAmount) : undefined,
              quantityAvailable: v.quantityAvailable ? parseInt(v.quantityAvailable) : undefined,
              imageUrl: v.imageUrl || undefined,
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const addVariant = () => {
    setVariants(v => [...v, { title: "", sku: "", listAmount: "", saleAmount: "", quantityAvailable: "", imageUrl: "" }]);
  };

  const updateVariant = (i: number, field: keyof VariantForm, value: string) => {
    setVariants(v => v.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const removeVariant = (i: number) => {
    setVariants(v => v.filter((_, idx) => idx !== i));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? "New Product" : title || "Edit Product"}
        subtitle={isNew ? "Create a new catalog item with pricing and stock" : `Product ID: ${productId?.slice(0, 8)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/app/catalog")} className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 h-8 text-xs font-medium">
              <ArrowLeft size={14} /> Back
            </Button>
            <Button size="sm" onClick={save} disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 h-8 text-xs font-medium">
              <Save size={14} /> {saving ? "Saving..." : "Save Product"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Product Attributes</h3>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sepatu Lari Ultralight 2026" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed product specifications..."
                rows={4} className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:border-slate-900" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Brand</Label>
                <Input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Brand name" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Category</Label>
                <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Footwear" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Canonical Product URL</Label>
              <Input value={productUrl} onChange={e => setProductUrl(e.target.value)} placeholder="https://yourstore.com/products/item" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Primary Image URL</Label>
              <Input value={primaryImageUrl} onChange={e => setPrimaryImageUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">SKU Variants & Inventory</h3>
                <p className="text-xs text-slate-500 mt-0.5">Specify variant titles, list prices, and stock counts</p>
              </div>
              <Button variant="outline" size="sm" onClick={addVariant} className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 h-8 text-xs font-medium">
                <Plus size={13} /> Add Variant
              </Button>
            </div>
            <div className="space-y-4">
              {variants.map((v, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">Variant #{i + 1}</span>
                    {variants.length > 1 && (
                      <Button variant="ghost" size="icon-xs" onClick={() => removeVariant(i)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={13} />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[11px] font-medium text-slate-600 mb-1 block">Title</Label>
                      <Input value={v.title} onChange={e => updateVariant(i, "title", e.target.value)} placeholder="e.g. Size 42 / Black" className="h-9 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium text-slate-600 mb-1 block">SKU Code</Label>
                      <Input value={v.sku} onChange={e => updateVariant(i, "sku", e.target.value)} placeholder="SKU-8812" className="h-9 text-xs font-mono" />
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium text-slate-600 mb-1 block">Price (IDR)</Label>
                      <Input value={v.listAmount} onChange={e => updateVariant(i, "listAmount", e.target.value)} placeholder="150000" type="number" className="h-9 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium text-slate-600 mb-1 block">Sale Price (IDR)</Label>
                      <Input value={v.saleAmount} onChange={e => updateVariant(i, "saleAmount", e.target.value)} placeholder="Optional" type="number" className="h-9 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium text-slate-600 mb-1 block">Available Stock</Label>
                      <Input value={v.quantityAvailable} onChange={e => updateVariant(i, "quantityAvailable", e.target.value)} placeholder="100" type="number" className="h-9 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium text-slate-600 mb-1 block">Variant Image URL</Label>
                      <Input value={v.imageUrl} onChange={e => updateVariant(i, "imageUrl", e.target.value)} placeholder="https://..." className="h-9 text-xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {!isNew && (
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Publishing Status</h3>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as "draft" | "active" | "archived")}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium cursor-pointer"
              >
                <option value="draft">Draft (Private)</option>
                <option value="active">Active (Discoverable)</option>
                <option value="archived">Archived</option>
              </select>
              <div className="pt-1">
                <StatusBadge
                  label={status}
                  variant={status === "active" ? "success" : status === "draft" ? "warning" : "neutral"}
                  dot
                />
              </div>
            </div>
          )}
          {primaryImageUrl && (
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Primary Image</h3>
              <img src={primaryImageUrl} alt="Preview" className="w-full aspect-square object-cover rounded-lg bg-slate-50 border border-slate-200" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
