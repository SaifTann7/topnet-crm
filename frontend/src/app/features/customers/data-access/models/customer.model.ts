export interface Customer {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  status: string;
  industry?: string;
  notes?: string;
  assignedToId?: number;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  status?: string;
  industry?: string;
  notes?: string;
  assignedToId?: number;
}

export interface CustomerAuditLog {
  id: number;
  customerId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'IMPORT';
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedAt: string;
}

export interface CustomerImportResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}

export interface CustomerListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  industry?: string;
  country?: string;
  sort?: string;
}

export const CUSTOMER_STATUSES = ['ACTIVE', 'INACTIVE', 'PROSPECT', 'CHURNED'] as const;

export const CUSTOMER_INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Telecommunications',
  'Other',
] as const;

export const CUSTOMER_COUNTRIES = [
  'Tunisia',
  'France',
  'Germany',
  'United States',
  'United Kingdom',
  'Other',
] as const;
