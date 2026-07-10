import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { PageResponse } from '../../../../core/models/page.model';
import {
  Customer,
  CustomerAuditLog,
  CustomerImportResult,
  CustomerListParams,
  CustomerRequest,
} from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly api = inject(ApiService);

  list(params: CustomerListParams): Observable<PageResponse<Customer>> {
    return this.api.get<PageResponse<Customer>>('/customers', {
      page: params.page,
      size: params.size,
      search: params.search,
      status: params.status,
      industry: params.industry,
      country: params.country,
      sort: params.sort,
    });
  }

  getById(id: number): Observable<Customer> {
    return this.api.get<Customer>(`/customers/${id}`);
  }

  getAuditLogs(id: number): Observable<CustomerAuditLog[]> {
    return this.api.get<CustomerAuditLog[]>(`/customers/${id}/audit-logs`);
  }

  create(request: CustomerRequest): Observable<Customer> {
    return this.api.post<Customer>('/customers', request);
  }

  update(id: number, request: CustomerRequest): Observable<Customer> {
    return this.api.put<Customer>(`/customers/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/customers/${id}`);
  }

  exportCsv(params: Omit<CustomerListParams, 'page' | 'size' | 'sort'>): Observable<Blob> {
    return this.api
      .getBlob('/customers/export', {
        search: params.search,
        status: params.status,
        industry: params.industry,
        country: params.country,
      })
      .pipe(map((res) => res.body ?? new Blob()));
  }

  importCsv(file: File): Observable<CustomerImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFormData<CustomerImportResult>('/customers/import', formData);
  }
}
