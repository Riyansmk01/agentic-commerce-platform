import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import backend from "~backend/client";
import { PageHeader } from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, FileText } from "lucide-react";

const EXPECTED_COLUMNS = ["title", "description", "sku", "price", "sale_price", "stock", "brand", "category", "image_url", "product_url", "variant_name", "variant_value"];

type Step = "upload" | "map" | "preview" | "validate" | "done";

interface ParsedRow { [key: string]: string }

export default function CSVImport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.organizationId ?? "";
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ validRows: number; invalidRows: number } | null>(null);

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return { headers: [], rows: [] };
    const hdrs = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
    const parsed = lines.slice(1, 21).map(line => {
      const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      const row: ParsedRow = {};
      hdrs.forEach((h, i) => { row[h] = vals[i] ?? ""; });
      return row;
    });
    return { headers: hdrs, rows: parsed };
  };

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const { headers: hdrs, rows: r } = parseCSV(text);
      setHeaders(hdrs);
      setRows(r);
      const autoMap: Record<string, string> = {};
      for (const col of EXPECTED_COLUMNS) {
        const match = hdrs.find(h => h.toLowerCase() === col.toLowerCase());
        if (match) autoMap[col] = match;
      }
      setMapping(autoMap);
      setStep("map");
    };
    reader.readAsText(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) handleFile(f);
  };

  const doImport = async () => {
    if (!orgId) return;
    setImporting(true);
    setStep("validate");
    try {
      const mappedHeaders = Object.entries(mapping)
        .filter(([, v]) => v)
        .map(([col]) => col)
        .join(",");
      const csvLines = [mappedHeaders];
      for (const row of rows) {
        const vals = Object.entries(mapping)
          .filter(([, v]) => v)
          .map(([, header]) => row[header] ?? "");
        csvLines.push(vals.join(","));
      }
      const csvString = csvLines.join("\n");
      const res = await backend.catalog.importCSV({
        organizationId: orgId,
        createdBy: user?.id ?? "unknown",
        csvData: csvString,
        mappingJson: mapping,
      });
      setResult({ validRows: res.validRows, invalidRows: res.invalidRows });
      setStep("done");
    } catch (e) {
      console.error(e);
    } finally {
      setImporting(false);
    }
  };

  const STEPS: { key: Step; label: string }[] = [
    { key: "upload", label: "Upload CSV" },
    { key: "map", label: "Map Columns" },
    { key: "preview", label: "Preview Data" },
    { key: "validate", label: "Importing" },
    { key: "done", label: "Complete" },
  ];

  const stepIdx = STEPS.findIndex(s => s.key === step);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Catalog Import"
        subtitle="Batch upload product catalog items from a CSV file"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/app/catalog")} className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 h-8 text-xs font-medium">
            <ArrowLeft size={14} /> Back to Catalog
          </Button>
        }
      />

      {/* Step Tracker */}
      <div className="flex items-center gap-2 pb-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium ${i <= stepIdx ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
              {i < stepIdx ? <CheckCircle size={13} /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${i <= stepIdx ? "text-slate-900 font-semibold" : "text-slate-400"}`}>{s.label}</span>
            {i < STEPS.length - 1 && <div className={`w-10 h-0.5 ${i < stepIdx ? "bg-slate-900" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      {step === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center cursor-pointer bg-grid-pattern hover:border-slate-400 transition-colors relative overflow-hidden shadow-2xs"
        >
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mx-auto mb-4 text-slate-900">
            <Upload size={22} />
          </div>
          <div className="text-slate-900 font-semibold text-base mb-1">Drop your catalog CSV file here</div>
          <div className="text-xs text-slate-500 mb-5">or click to browse your local filesystem</div>
          <div className="text-[11px] text-slate-400 font-mono">Recognized attributes: title, sku, price, stock, brand, category, image_url</div>
        </div>
      )}

      {step === "map" && (
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-5">
          <div>
            <h3 className="font-semibold text-slate-900 text-base mb-0.5">Map CSV Headers</h3>
            <p className="text-xs text-slate-500">Associate your CSV file headers with standard catalog attributes</p>
          </div>
          <div className="space-y-3 pt-2">
            {EXPECTED_COLUMNS.map(col => (
              <div key={col} className="flex items-center gap-4 py-1">
                <div className="w-40 text-xs font-mono font-semibold text-slate-700">{col}</div>
                <ArrowRight size={13} className="text-slate-300 shrink-0" />
                <select
                  value={mapping[col] ?? ""}
                  onChange={e => setMapping(m => ({ ...m, [col]: e.target.value }))}
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium cursor-pointer"
                >
                  <option value="">— Not mapped —</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button onClick={() => setStep("preview")} className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 h-9 text-xs">
              Preview Data <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-5">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-slate-900" />
              <span className="text-sm font-semibold text-slate-900">Mapped Preview (First {rows.length} records)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                    {Object.keys(mapping).filter(k => mapping[k]).map(k => (
                      <th key={k} className="py-2.5 px-3 font-semibold">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      {Object.entries(mapping).filter(([, v]) => v).map(([col, header]) => (
                        <td key={col} className="py-2.5 px-3 text-slate-700 max-w-40 truncate font-mono">{row[header] ?? "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("map")} className="border-slate-200 text-slate-700 hover:bg-slate-50 h-9 text-xs">
              Back to Mapping
            </Button>
            <Button onClick={doImport} disabled={importing} className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 h-9 text-xs">
              {importing ? "Processing Bulk Import..." : "Confirm & Import Catalog"}
            </Button>
          </div>
        </div>
      )}

      {step === "validate" && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-slate-900 font-semibold text-base">Processing CSV Catalog Import...</div>
          <div className="text-xs text-slate-500 mt-1">Validating product schemas and generating variant SKU IDs</div>
        </div>
      )}

      {step === "done" && result && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <CheckCircle size={44} className="text-emerald-600 mx-auto mb-4" />
          <div className="text-slate-900 font-bold text-xl mb-1">Bulk Import Successfully Completed</div>
          <div className="flex items-center justify-center gap-8 my-6">
            <div className="text-center px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-700">{result.validRows}</div>
              <div className="text-xs text-emerald-800 font-medium">Products Imported</div>
            </div>
            {result.invalidRows > 0 && (
              <div className="text-center px-4 py-2 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-2xl font-bold text-amber-700">{result.invalidRows}</div>
                <div className="text-xs text-amber-800 font-medium">Rows Skipped</div>
              </div>
            )}
          </div>
          <Button onClick={() => navigate("/app/catalog")} className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-6 text-xs">
            View Updated Catalog
          </Button>
        </div>
      )}
    </div>
  );
}
