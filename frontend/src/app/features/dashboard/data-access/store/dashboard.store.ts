import { Injectable, computed, inject, signal } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { ChartSegment, DashboardStats } from '../models/dashboard.model';

const CHART_COLORS: Record<string, string> = {
  OPEN: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  RESOLVED: '#10b981',
  CLOSED: '#64748b',
  LOW: '#94a3b8',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  CRITICAL: '#ef4444',
};

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly dashboardService = inject(DashboardService);

  private readonly _stats = signal<DashboardStats | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _notificationsOpen = signal(false);

  readonly stats = this._stats.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly notificationsOpen = this._notificationsOpen.asReadonly();

  readonly unreadNotifications = computed(() =>
    (this._stats()?.notifications ?? []).filter((n: { read: boolean }) => !n.read).length
  );

  readonly notifications = computed(() => this._stats()?.notifications ?? []);

  readonly statusChart = computed(() => this.toChartSegments(this._stats()?.ticketsByStatus ?? {}));
  readonly priorityChart = computed(() => this.toChartSegments(this._stats()?.ticketsByPriority ?? {}));

  load(): void {
    if (this._loading()) return;
    this._loading.set(true);
    this._error.set(null);

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this._stats.set(data);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err?.error?.message ?? 'Failed to load dashboard.');
        this._loading.set(false);
      },
    });
  }

  toggleNotifications(): void {
    this._notificationsOpen.update((v) => !v);
  }

  closeNotifications(): void {
    this._notificationsOpen.set(false);
  }

  private toChartSegments(data: Record<string, number>): ChartSegment[] {
    const total = Object.values(data).reduce((sum, v) => sum + v, 0) || 1;
    return Object.entries(data).map(([label, value]) => ({
      label: label.replace(/_/g, ' '),
      value,
      color: CHART_COLORS[label] ?? '#6366f1',
      percentage: Math.round((value / total) * 100),
    }));
  }
}
