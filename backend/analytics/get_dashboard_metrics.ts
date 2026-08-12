import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "./db";

interface GetDashboardMetricsParams {
  organizationId: Query<string>;
  days?: Query<number>;
}

interface DashboardMetrics {
  totalAgentRequests: number;
  productLookups: number;
  checkoutsCreated: number;
  avgLatencyMs: number;
  topOperations: Array<{ operation: string; count: number }>;
  requestsOverTime: Array<{ date: string; count: number }>;
}

interface GetDashboardMetricsResponse { metrics: DashboardMetrics; }

// Returns dashboard analytics metrics for a merchant.
export const getDashboardMetrics = api<GetDashboardMetricsParams, GetDashboardMetricsResponse>(
  { expose: true, method: "GET", path: "/analytics/dashboard" },
  async (req) => {
    const days = req.days ?? 30;
    const orgId = req.organizationId;

    const totalRow = await db.rawQueryRow<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM agent_requests
       WHERE organization_id = $1 AND created_at > NOW() - INTERVAL '1 day' * $2`,
      orgId, days
    );

    const lookupsRow = await db.rawQueryRow<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM agent_requests
       WHERE organization_id = $1 AND operation LIKE '%product%' AND created_at > NOW() - INTERVAL '1 day' * $2`,
      orgId, days
    );

    const checkoutsRow = await db.rawQueryRow<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM agent_requests
       WHERE organization_id = $1 AND operation = 'createCheckout' AND created_at > NOW() - INTERVAL '1 day' * $2`,
      orgId, days
    );

    const avgLatencyRow = await db.rawQueryRow<{ avg: string | null }>(
      `SELECT AVG(latency_ms)::text as avg FROM agent_requests
       WHERE organization_id = $1 AND created_at > NOW() - INTERVAL '1 day' * $2`,
      orgId, days
    );

    const topOps = await db.rawQueryAll<{ operation: string; count: string }>(
      `SELECT operation, COUNT(*)::text as count FROM agent_requests
       WHERE organization_id = $1 AND created_at > NOW() - INTERVAL '1 day' * $2
       GROUP BY operation ORDER BY count DESC LIMIT 5`,
      orgId, days
    );

    const overTime = await db.rawQueryAll<{ date: string; count: string }>(
      `SELECT DATE(created_at)::text as date, COUNT(*)::text as count FROM agent_requests
       WHERE organization_id = $1 AND created_at > NOW() - INTERVAL '1 day' * $2
       GROUP BY DATE(created_at) ORDER BY date`,
      orgId, days
    );

    return {
      metrics: {
        totalAgentRequests: parseInt(totalRow?.count ?? "0", 10),
        productLookups: parseInt(lookupsRow?.count ?? "0", 10),
        checkoutsCreated: parseInt(checkoutsRow?.count ?? "0", 10),
        avgLatencyMs: parseFloat(avgLatencyRow?.avg ?? "0"),
        topOperations: topOps.map(o => ({ operation: o.operation, count: parseInt(o.count, 10) })),
        requestsOverTime: overTime.map(o => ({ date: o.date, count: parseInt(o.count, 10) })),
      },
    };
  }
);
