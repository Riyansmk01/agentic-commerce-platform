import { randomUUID } from "crypto";
import { AgentApiMeta } from "./types";

export function buildMeta(): AgentApiMeta {
  return {
    requestId: randomUUID(),
    apiVersion: "v1",
    generatedAt: new Date().toISOString(),
  };
}
