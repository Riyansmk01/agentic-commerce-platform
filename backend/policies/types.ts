export type PolicyType = "returns" | "refunds" | "shipping" | "cancellation" | "warranty" | "privacy" | "terms";

export interface MerchantPolicy {
  id: string;
  organizationId: string;
  policyType: PolicyType;
  title: string;
  summary?: string;
  fullUrl?: string;
  structuredData: Record<string, unknown>;
  active: boolean;
  updatedAt: Date;
}

export interface UpsertPolicyRequest {
  organizationId: string;
  policyType: PolicyType;
  title: string;
  summary?: string;
  fullUrl?: string;
  structuredData?: Record<string, unknown>;
  active?: boolean;
}

export interface GetPolicyParams {
  type: string;
  organizationId: string;
}
