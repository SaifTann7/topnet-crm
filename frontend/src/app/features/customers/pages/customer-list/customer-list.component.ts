import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CustomerService } from '../../data-access/services/customer.service';
import {
  CUSTOMER_COUNTRIES,
  CUSTOMER_INDUSTRIES,
  CUSTOMER_STATUSES,
  Customer,
  CustomerAuditLog,
  CustomerImportResult,
  CustomerRequest,
} from '../../data-access/models/customer.model';
import { PageHeaderComponent } from '../../../../shared/components/ui/page-header.component';
import { ButtonComponent } from '../../../../shared/components/ui/button.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/feedback/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/feedback/empty-state.component';
import { BadgeComponent } from '../../../../shared/components/ui/badge.component';
import { ModalComponent } from '../../../../shared/components/ui/modal.component';
import { AlertComponent } from '../../../../shared/components/feedback/alert.component';
import { ConfirmDialogComponent } from '../../../../shared/components/feedback/confirm-dialog.component';
import { DataTableComponent, SortState, TableColumn } from '../../../../shared/components/data-display/data-table.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    PageHeaderComponent,
    ButtonComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    BadgeComponent,
    ModalComponent,
    AlertComponent,
    ConfirmDialogComponent,
    DataTableComponent,
  ],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class CustomerListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly fb = inject(FormBuilder);

  readonly statuses = CUSTOMER_STATUSES;
  readonly industries = CUSTOMER_INDUSTRIES;
  readonly countries = CUSTOMER_COUNTRIES;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly importing = signal(false);
  readonly exporting = signal(false);
  readonly customers = signal<Customer[]>([]);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly search = signal('');
  readonly statusFilter = signal('');
  readonly industryFilter = signal('');
  readonly countryFilter = signal('');
  readonly sortColumn = signal('createdAt');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');

  readonly modalOpen = signal(false);
  readonly auditModalOpen = signal(false);
  readonly confirmOpen = signal(false);
  readonly editing = signal<Customer | null>(null);
  readonly deleteTarget = signal<Customer | null>(null);
  readonly auditCustomer = signal<Customer | null>(null);
  readonly auditLogs = signal<CustomerAuditLog[]>([]);
  readonly auditLoading = signal(false);

  readonly formError = signal<string | null>(null);
  readonly importResult = signal<CustomerImportResult | null>(null);
  readonly toast = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  readonly columns: TableColumn<Customer>[] = [
    { key: 'companyName', header: 'Company', sortable: true },
    { key: 'contactName', header: 'Contact', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Phone' },
    { key: 'city', header: 'City', sortable: true },
    { key: 'country', header: 'Country', sortable: true },
    { key: 'industry', header: 'Industry', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'createdAt', header: 'Created', sortable: true, cell: (r) => this.formatDate(r.createdAt) },
  ];

  readonly form = this.fb.nonNullable.group({
    companyName: ['', [Validators.required, Validators.maxLength(255)]],
    contactName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: ['', Validators.maxLength(30)],
    address: ['', Validators.maxLength(500)],
    city: ['', Validators.maxLength(100)],
    country: ['', Validators.maxLength(100)],
    status: ['ACTIVE', Validators.required],
    industry: ['', Validators.maxLength(100)],
    notes: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.customerService
      .list({
        page: this.page(),
        size: this.pageSize(),
        search: this.search() || undefined,
        status: this.statusFilter() || undefined,
        industry: this.industryFilter() || undefined,
        country: this.countryFilter() || undefined,
        sort: `${this.sortColumn()},${this.sortDirection()}`,
      })
      .subscribe({
        next: (res) => {
          this.customers.set(res.content);
          this.totalElements.set(res.totalElements);
          this.totalPages.set(res.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.page.set(0);
    this.load();
  }

  onFilterChange(): void {
    this.page.set(0);
    this.load();
  }

  onPageSizeChange(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.page.set(0);
    this.load();
  }

  onSort(state: SortState): void {
    this.sortColumn.set(state.column);
    this.sortDirection.set(state.direction);
    this.load();
  }

  changePage(page: number): void {
    this.page.set(page);
    this.load();
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set('');
    this.industryFilter.set('');
    this.countryFilter.set('');
    this.page.set(0);
    this.load();
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({ status: 'ACTIVE' });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(customer: Customer): void {
    this.editing.set(customer);
    this.form.patchValue(customer);
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  fieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return null;
    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Enter a valid email address';
    if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} characters`;
    return 'Invalid value';
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);
    this.formError.set(null);
    const request = this.form.getRawValue() as CustomerRequest;
    const editing = this.editing();
    const op = editing
      ? this.customerService.update(editing.id, request)
      : this.customerService.create(request);

    op.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.showToast('success', editing ? 'Customer updated successfully.' : 'Customer created successfully.');
        this.load();
      },
      error: (err) => {
        this.formError.set(err?.error?.message ?? 'Failed to save customer.');
        this.saving.set(false);
      },
    });
  }

  openDeleteConfirm(customer: Customer): void {
    this.deleteTarget.set(customer);
    this.confirmOpen.set(true);
  }

  cancelDelete(): void {
    this.confirmOpen.set(false);
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.deleting.set(true);
    this.customerService.delete(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.confirmOpen.set(false);
        this.deleteTarget.set(null);
        this.showToast('success', `Customer "${target.companyName}" was archived.`);
        this.load();
      },
      error: () => {
        this.deleting.set(false);
        this.showToast('error', 'Failed to delete customer.');
      },
    });
  }

  openAudit(customer: Customer): void {
    this.auditCustomer.set(customer);
    this.auditModalOpen.set(true);
    this.auditLoading.set(true);
    this.auditLogs.set([]);
    this.customerService.getAuditLogs(customer.id).subscribe({
      next: (logs) => {
        this.auditLogs.set(logs);
        this.auditLoading.set(false);
      },
      error: () => this.auditLoading.set(false),
    });
  }

  closeAudit(): void {
    this.auditModalOpen.set(false);
    this.auditCustomer.set(null);
  }

  exportCsv(): void {
    this.exporting.set(true);
    this.customerService
      .exportCsv({
        search: this.search() || undefined,
        status: this.statusFilter() || undefined,
        industry: this.industryFilter() || undefined,
        country: this.countryFilter() || undefined,
      })
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `topnet-customers-${new Date().toISOString().slice(0, 10)}.csv`;
          link.click();
          URL.revokeObjectURL(url);
          this.exporting.set(false);
          this.showToast('success', 'Customers exported to CSV.');
        },
        error: () => {
          this.exporting.set(false);
          this.showToast('error', 'Export failed.');
        },
      });
  }

  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.importing.set(true);
    this.importResult.set(null);
    this.customerService.importCsv(file).subscribe({
      next: (result) => {
        this.importing.set(false);
        this.importResult.set(result);
        input.value = '';
        this.load();
        this.showToast(
          'success',
          `Import complete: ${result.successCount} succeeded, ${result.failureCount} failed.`,
        );
      },
      error: (err) => {
        this.importing.set(false);
        input.value = '';
        this.showToast('error', err?.error?.message ?? 'Import failed.');
      },
    });
  }

  statusTone(status: string): 'success' | 'warning' | 'default' | 'danger' {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PROSPECT':
        return 'warning';
      case 'CHURNED':
        return 'danger';
      default:
        return 'default';
    }
  }

  auditActionLabel(action: string): string {
    return action.charAt(0) + action.slice(1).toLowerCase();
  }

  trackById(customer: Customer): number {
    return customer.id;
  }

  deleteConfirmMessage(): string {
    const name = this.deleteTarget()?.companyName ?? 'this customer';
    return `This will archive "${name}". The record is soft-deleted and kept in audit logs.`;
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
  }

  private showToast(type: 'success' | 'error', message: string): void {
    this.toast.set({ type, message });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
