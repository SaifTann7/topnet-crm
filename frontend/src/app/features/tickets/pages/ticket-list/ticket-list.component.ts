import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TicketService } from '../../data-access/services/ticket.service';
import { CustomerService } from '../../../customers/data-access/services/customer.service';
import { Customer } from '../../../customers/data-access/models/customer.model';
import {
  AssignableUser,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  Ticket,
  TicketComment,
  TicketPriority,
  TicketRequest,
  TicketStatistics,
  TicketStatus,
  TicketTimelineItem,
} from '../../data-access/models/ticket.model';
import { PageHeaderComponent } from '../../../../shared/components/ui/page-header.component';
import { ButtonComponent } from '../../../../shared/components/ui/button.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/feedback/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/feedback/empty-state.component';
import { BadgeComponent } from '../../../../shared/components/ui/badge.component';
import { ModalComponent } from '../../../../shared/components/ui/modal.component';
import { AlertComponent } from '../../../../shared/components/feedback/alert.component';
import { ConfirmDialogComponent } from '../../../../shared/components/feedback/confirm-dialog.component';
import { DataTableComponent, SortState, TableColumn } from '../../../../shared/components/data-display/data-table.component';
import { KpiCardComponent } from '../../../../shared/components/data-display/kpi-card.component';

type DetailTab = 'details' | 'timeline' | 'comments';

@Component({
  selector: 'app-ticket-list',
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
    KpiCardComponent,
  ],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss',
})
export class TicketListComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly customerService = inject(CustomerService);
  private readonly fb = inject(FormBuilder);

  readonly statuses = TICKET_STATUSES;
  readonly priorities = TICKET_PRIORITIES;

  readonly loading = signal(true);
  readonly statsLoading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly commenting = signal(false);
  readonly tickets = signal<Ticket[]>([]);
  readonly stats = signal<TicketStatistics | null>(null);
  readonly customerOptions = signal<Customer[]>([]);
  readonly assignableUsers = signal<AssignableUser[]>([]);

  readonly page = signal(0);
  readonly pageSize = signal(10);
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly search = signal('');
  readonly statusFilter = signal('');
  readonly priorityFilter = signal('');
  readonly customerFilter = signal('');
  readonly assigneeFilter = signal('');
  readonly unassignedOnly = signal(false);
  readonly sortColumn = signal('createdAt');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');

  readonly modalOpen = signal(false);
  readonly detailOpen = signal(false);
  readonly confirmOpen = signal(false);
  readonly editing = signal<Ticket | null>(null);
  readonly selected = signal<Ticket | null>(null);
  readonly deleteTarget = signal<Ticket | null>(null);
  readonly detailTab = signal<DetailTab>('details');

  readonly timeline = signal<TicketTimelineItem[]>([]);
  readonly comments = signal<TicketComment[]>([]);
  readonly detailLoading = signal(false);

  readonly formError = signal<string | null>(null);
  readonly commentError = signal<string | null>(null);
  readonly toast = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  readonly columns: TableColumn<Ticket>[] = [
    { key: 'ticketNumber', header: 'Ticket #', sortable: true },
    { key: 'subject', header: 'Subject', sortable: true },
    { key: 'customerName', header: 'Customer', sortable: true },
    { key: 'priority', header: 'Priority', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'assignedToName', header: 'Assigned To', sortable: true },
    { key: 'createdAt', header: 'Created', sortable: true, cell: (t) => this.formatDate(t.createdAt) },
  ];

  readonly form = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
    subject: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    priority: ['MEDIUM' as TicketPriority, Validators.required],
    assignedToId: [''],
  });

  readonly commentForm = this.fb.nonNullable.group({
    body: ['', [Validators.required, Validators.maxLength(5000)]],
  });

  ngOnInit(): void {
    this.loadStats();
    this.load();
    this.customerService.list({ page: 0, size: 200 }).subscribe((res) => this.customerOptions.set(res.content));
    this.ticketService.getAssignableUsers().subscribe((users) => this.assignableUsers.set(users));
  }

  loadStats(): void {
    this.statsLoading.set(true);
    this.ticketService.getStatistics().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.statsLoading.set(false);
      },
      error: () => this.statsLoading.set(false),
    });
  }

  load(): void {
    this.loading.set(true);
    const assignee = this.assigneeFilter();
    this.ticketService
      .list({
        page: this.page(),
        size: this.pageSize(),
        search: this.search() || undefined,
        status: (this.statusFilter() || undefined) as TicketStatus | undefined,
        priority: (this.priorityFilter() || undefined) as TicketPriority | undefined,
        customerId: this.customerFilter() ? Number(this.customerFilter()) : undefined,
        assignedToId: assignee && !this.unassignedOnly() ? Number(assignee) : undefined,
        unassigned: this.unassignedOnly() || undefined,
        sort: `${this.sortColumn()},${this.sortDirection()}`,
      })
      .subscribe({
        next: (res) => {
          this.tickets.set(res.content);
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

  onUnassignedToggle(event: Event): void {
    this.unassignedOnly.set((event.target as HTMLInputElement).checked);
    if (this.unassignedOnly()) this.assigneeFilter.set('');
    this.onFilterChange();
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
    this.priorityFilter.set('');
    this.customerFilter.set('');
    this.assigneeFilter.set('');
    this.unassignedOnly.set(false);
    this.page.set(0);
    this.load();
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({ priority: 'MEDIUM', assignedToId: '' });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(ticket: Ticket): void {
    this.editing.set(ticket);
    this.form.patchValue({
      customerId: String(ticket.customerId),
      subject: ticket.subject,
      description: ticket.description ?? '',
      priority: ticket.priority,
      assignedToId: ticket.assignedToId ? String(ticket.assignedToId) : '',
    });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  openDetail(ticket: Ticket): void {
    this.selected.set(ticket);
    this.detailOpen.set(true);
    this.detailTab.set('details');
    this.loadDetailData(ticket.id);
  }

  closeDetail(): void {
    this.detailOpen.set(false);
    this.selected.set(null);
  }

  setDetailTab(tab: DetailTab): void {
    this.detailTab.set(tab);
  }

  loadDetailData(id: number): void {
    this.detailLoading.set(true);
    this.ticketService.getTimeline(id).subscribe({
      next: (items) => this.timeline.set(items),
    });
    this.ticketService.getComments(id).subscribe({
      next: (items) => {
        this.comments.set(items);
        this.detailLoading.set(false);
      },
      error: () => this.detailLoading.set(false),
    });
  }

  refreshSelected(): void {
    const selected = this.selected();
    if (!selected) return;
    this.ticketService.getById(selected.id).subscribe({
      next: (ticket) => {
        this.selected.set(ticket);
        this.loadDetailData(ticket.id);
        this.load();
        this.loadStats();
      },
    });
  }

  fieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return null;
    if (control.errors['required']) return 'This field is required';
    if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} characters`;
    return 'Invalid value';
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);
    this.formError.set(null);
    const raw = this.form.getRawValue();
    const request: TicketRequest = {
      customerId: Number(raw.customerId),
      subject: raw.subject,
      description: raw.description || undefined,
      priority: raw.priority,
      assignedToId: raw.assignedToId ? Number(raw.assignedToId) : undefined,
    };
    const editing = this.editing();
    const op = editing
      ? this.ticketService.update(editing.id, request)
      : this.ticketService.create(request);

    op.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.showToast('success', editing ? 'Ticket updated.' : 'Ticket created.');
        this.load();
        this.loadStats();
      },
      error: (err) => {
        this.formError.set(err?.error?.message ?? 'Failed to save ticket.');
        this.saving.set(false);
      },
    });
  }

  updateStatus(ticket: Ticket, status: TicketStatus): void {
    this.ticketService.updateStatus(ticket.id, status).subscribe({
      next: (updated) => {
        if (this.selected()?.id === ticket.id) this.selected.set(updated);
        this.showToast('success', `Status updated to ${status}.`);
        this.load();
        this.loadStats();
        if (this.selected()?.id === ticket.id) this.loadDetailData(ticket.id);
      },
      error: () => this.showToast('error', 'Failed to update status.'),
    });
  }

  submitComment(): void {
    const selected = this.selected();
    if (!selected || this.commentForm.invalid) return;

    this.commenting.set(true);
    this.commentError.set(null);
    const body = this.commentForm.getRawValue().body;
    this.ticketService.addComment(selected.id, body).subscribe({
      next: () => {
        this.commentForm.reset();
        this.commenting.set(false);
        this.loadDetailData(selected.id);
        this.showToast('success', 'Comment added.');
      },
      error: (err) => {
        this.commentError.set(err?.error?.message ?? 'Failed to add comment.');
        this.commenting.set(false);
      },
    });
  }

  openDeleteConfirm(ticket: Ticket): void {
    this.deleteTarget.set(ticket);
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
    this.ticketService.delete(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.confirmOpen.set(false);
        if (this.selected()?.id === target.id) this.closeDetail();
        this.deleteTarget.set(null);
        this.showToast('success', `Ticket ${target.ticketNumber} deleted.`);
        this.load();
        this.loadStats();
      },
      error: () => {
        this.deleting.set(false);
        this.showToast('error', 'Failed to delete ticket.');
      },
    });
  }

  deleteConfirmMessage(): string {
    const t = this.deleteTarget();
    return t
      ? `Permanently delete ticket "${t.ticketNumber}"? This action cannot be undone.`
      : 'Delete this ticket?';
  }

  priorityTone(p: TicketPriority): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    const map: Record<TicketPriority, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      LOW: 'default',
      MEDIUM: 'info',
      HIGH: 'warning',
      CRITICAL: 'danger',
    };
    return map[p];
  }

  statusTone(s: TicketStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    const map: Record<TicketStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      OPEN: 'info',
      IN_PROGRESS: 'warning',
      RESOLVED: 'success',
      CLOSED: 'default',
    };
    return map[s];
  }

  activityIcon(type: string): string {
    const icons: Record<string, string> = {
      CREATED: '✦',
      STATUS_CHANGED: '↻',
      PRIORITY_CHANGED: '!',
      ASSIGNED: '👤',
      UNASSIGNED: '○',
      COMMENT_ADDED: '💬',
      RESOLVED: '✓',
      CLOSED: '■',
      DELETED: '✕',
      UPDATED: '✎',
    };
    return icons[type] ?? '•';
  }

  activityLabel(type: string): string {
    return type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  }

  trackById(ticket: Ticket): number {
    return ticket.id;
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
  }

  private showToast(type: 'success' | 'error', message: string): void {
    this.toast.set({ type, message });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
