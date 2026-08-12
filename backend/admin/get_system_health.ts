import { api } from "encore.dev/api";
import merchantsDb from "../merchants/db";
import catalogDb from "../catalog/db";

interface GetSystemHealthResponse {
  status: string;
  services: Array<{ name: string; status: string; latencyMs: number }>;
  checkedAt: string;
}

// Returns system health status for all backend services.
export const getSystemHealth = api<void, GetSystemHealthResponse>(
  { expose: true, method: "GET", path: "/admin/system/health" },
  async () => {
    const services = [];

    const merchantsStart = Date.now();
    try {
      await merchantsDb.queryRow`SELECT 1`;
      services.push({ name: "merchants_db", status: "healthy", latencyMs: Date.now() - merchantsStart });
    } catch {
      services.push({ name: "merchants_db", status: "unhealthy", latencyMs: Date.now() - merchantsStart });
    }

    const catalogStart = Date.now();
    try {
      await catalogDb.queryRow`SELECT 1`;
      services.push({ name: "catalog_db", status: "healthy", latencyMs: Date.now() - catalogStart });
    } catch {
      services.push({ name: "catalog_db", status: "unhealthy", latencyMs: Date.now() - catalogStart });
    }

    const allHealthy = services.every(s => s.status === "healthy");

    return {
      status: allHealthy ? "healthy" : "degraded",
      services,
      checkedAt: new Date().toISOString(),
    };
  }
);
