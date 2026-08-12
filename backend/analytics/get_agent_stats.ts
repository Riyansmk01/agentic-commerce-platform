import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "./db";

interface GetAgentStatsParams {
  organizationId: Query<string>;
  days?: Query<number>;
}

interface AgentStat {
  agentName: string;
  requestCount: number;
  avgLatencyMs: number;
  successRate: number;
}

interface GetAgentStatsResponse { agents: AgentStat[]; }

// Returns per-agent request statistics for a merchant.
export const getAgentStats = api<GetAgentStatsParams, GetAgentStatsResponse>(
  { expose: true, method: "GET", path: "/analytics/agents" },
  async (req) => {
    const days = req.days ?? 30;

    const rows = await db.rawQueryAll<{
      agent_name: string | null; count: string; avg_latency: string | null;
      success_count: string;
    }>(
      `SELECT agent_name, COUNT(*)::text as count,
         AVG(latency_ms)::text as avg_latency,
         SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END)::text as success_count
       FROM agent_requests
       WHERE organization_id = $1 AND created_at > NOW() - INTERVAL '1 day' * $2
       GROUP BY agent_name ORDER BY count DESC`,
      req.organizationId, days
    );

    return {
      agents: rows.map(r => {
        const count = parseInt(r.count, 10);
        const successCount = parseInt(r.success_count, 10);
        return {
          agentName: r.agent_name ?? "unknown",
          requestCount: count,
          avgLatencyMs: parseFloat(r.avg_latency ?? "0"),
          successRate: count > 0 ? successCount / count : 0,
        };
      }),
    };
  }
);
