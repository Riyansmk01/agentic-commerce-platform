export interface Organization {
  id: string;
  name: string;
  slug: string;
  countryCode: string;
  timezone: string;
  currency: string;
  websiteUrl?: string;
  logoUrl?: string;
  status: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantProfile {
  organizationId: string;
  legalName?: string;
  displayName: string;
  description?: string;
  supportEmail?: string;
  supportPhone?: string;
  supportUrl?: string;
  addressJson?: Record<string, unknown>;
  publicStatus: string;
  readinessScore: number;
  publishedAt?: Date;
  updatedAt: Date;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  countryCode?: string;
  timezone?: string;
  currency?: string;
  websiteUrl?: string;
  createdBy: string;
}

export interface UpdateOrganizationRequest {
  id: string;
  name?: string;
  websiteUrl?: string;
  logoUrl?: string;
  status?: string;
}

export interface UpdateMerchantProfileRequest {
  id: string;
  legalName?: string;
  displayName?: string;
  description?: string;
  supportEmail?: string;
  supportPhone?: string;
  supportUrl?: string;
  addressJson?: Record<string, unknown>;
  publicStatus?: string;
}
