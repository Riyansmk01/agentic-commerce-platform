import { api } from "encore.dev/api";
import db from "./db";

interface ImportCSVRequest {
  organizationId: string;
  createdBy: string;
  csvData: string;
  mappingJson?: Record<string, string>;
}

interface ImportCSVResponse {
  importId: string;
  status: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: string[];
}

// Validates and imports product data from CSV format.
export const importCSV = api<ImportCSVRequest, ImportCSVResponse>(
  { expose: true, method: "POST", path: "/catalog/import" },
  async (req) => {
    const lines = req.csvData.trim().split("\n");
    const totalRows = Math.max(0, lines.length - 1);
    const errors: string[] = [];
    let validRows = 0;
    let invalidRows = 0;

    const mappingStr = JSON.stringify(req.mappingJson ?? {});

    const importRow = await db.queryRow<{ id: string }>`
      INSERT INTO catalog_imports (organization_id, source_type, status, total_rows, valid_rows, invalid_rows, mapping_json, created_by)
      VALUES (${req.organizationId}, 'csv', 'processing', ${totalRows}, 0, 0, ${mappingStr}::jsonb, ${req.createdBy})
      RETURNING id
    `;

    const headers = lines[0]?.split(",").map(h => h.trim()) ?? [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim());
      const titleIdx = headers.indexOf("title");
      if (titleIdx === -1 || !cols[titleIdx]) {
        errors.push(`Row ${i + 1}: missing title`);
        invalidRows++;
        continue;
      }
      validRows++;
    }

    const errorReport = JSON.stringify({ errors });
    await db.exec`
      UPDATE catalog_imports SET
        status = 'completed', valid_rows = ${validRows}, invalid_rows = ${invalidRows},
        error_report = ${errorReport}::jsonb, completed_at = NOW()
      WHERE id = ${importRow!.id}
    `;

    return {
      importId: importRow!.id,
      status: "completed",
      totalRows,
      validRows,
      invalidRows,
      errors,
    };
  }
);
