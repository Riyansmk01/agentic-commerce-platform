import { api } from "encore.dev/api";
import db from "./db";
import { randomUUID } from "crypto";

interface TrackEventRequest {
  organizationId?: string;
  operation: string;
  agentName?: string;
  statusCode?: number;
  latencyMs?: number;
  querySummary?: string;
  resultCount?: number;
  checkoutSessionId?: string;
  protocol?: string;
}

interface TrackEventResponse { eventId: string; }

// Tracks an agent or API request event for analytics purposes.
export const trackEvent = api<TrackEventRequest, TrackEventResponse>(
  { expose: true, method: "POST", path: "/analytics/track" },
  async (req) => {
    const requestId = randomUUID();

    await db.exec`
      INSERT INTO agent_requests (
        organization_id, request_id, protocol, operation, agent_name,
        status_code, latency_ms, query_summary, result_count, checkout_session_id
      )
      VALUES (
        ${req.organizationId ?? null}, ${requestId}, ${req.protocol ?? "rest"},
        ${req.operation}, ${req.agentName ?? null}, ${req.statusCode ?? null},
        ${req.latencyMs ?? null}, ${req.querySummary ?? null},
        ${req.resultCount ?? null}, ${req.checkoutSessionId ?? null}
      )
    `;

    return { eventId: requestId };
  }
);
