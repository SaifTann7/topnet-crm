import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { DashboardStore } from '../../data-access/store/dashboard.store';
import { KpiCardComponent } from '../../../../shared/components/data-display/kpi-card.component';
import { BarChartComponent } from '../../../../shared/components/data-display/bar-chart.component';
import { DonutChartComponent } from '../../../../shared/components/data-display/donut-chart.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/feedback/loading-spinner.component';
import { AlertComponent } from '../../../../shared/components/feedback/alert.component';
import { BadgeComponent } from '../../../../shared/components/ui/badge.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    RouterLink,
    KpiCardComponent,
    BarChartComponent,
    DonutChartComponent,
    LoadingSpinnerComponent,
    AlertComponent,
    BadgeComponent,
  ],
  styleUrl: './dashboard-home.component.scss',
  templateUrl: './dashboard-home.component.html',
})
export class DashboardHomeComponent implements OnInit {
  readonly store = inject(DashboardStore);
  readonly auth = inject(AuthService);

  readonly stats = this.store.stats;
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  readonly revenueFormatted = computed(() => {
    const rev = this.stats()?.estimatedRevenue ?? 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(rev);
  });

  ngOnInit(): void {
    if (!this.stats()) {
      this.store.load();
    }
  }

  statusTone(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      OPEN: 'info', IN_PROGRESS: 'warning', RESOLVED: 'success', CLOSED: 'default', ACTIVE: 'success', INACTIVE: 'default',
    };
    return map[status] ?? 'default';
  }

  priorityTone(p: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      LOW: 'default', MEDIUM: 'info', HIGH: 'warning', CRITICAL: 'danger',
    };
    return map[p] ?? 'default';
  }
}
