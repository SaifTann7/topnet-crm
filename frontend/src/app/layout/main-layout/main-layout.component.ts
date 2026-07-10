import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { DashboardStore } from '../../features/dashboard/data-access/store/dashboard.store';
import { TopNavbarComponent } from '../components/top-navbar/top-navbar.component';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TopNavbarComponent],
  template: `
    <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <aside
        class="fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
      >
        <div class="flex h-16 items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-800">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-lg shadow-brand-600/30">TN</div>
          <div>
            <p class="text-sm font-bold tracking-tight text-slate-900 dark:text-white">TOPNET CRM</p>
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Enterprise</p>
          </div>
        </div>

        <nav class="flex-1 space-y-1 p-4">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-950/40 dark:text-brand-300"
              #rla="routerLinkActive"
              class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              (click)="sidebarOpen.set(false)"
            >
              <span class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                [class]="rla.isActive ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 dark:bg-slate-800 dark:group-hover:bg-slate-700'">
                <span [innerHTML]="item.icon"></span>
              </span>
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="border-t border-slate-200 p-4 dark:border-slate-800">
          <a routerLink="/profile" class="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">{{ initials() }}</div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">{{ auth.fullName() }}</p>
              <p class="truncate text-xs text-slate-500">View profile</p>
            </div>
          </a>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <app-top-navbar pageTitle="Enterprise Dashboard" (menuToggle)="sidebarOpen.set(true)" />
        <main class="flex-1 p-4 sm:p-6 lg:p-8">
          <div class="mx-auto w-full max-w-[1400px]">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly dashboardStore = inject(DashboardStore);
  readonly sidebarOpen = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Customers', path: '/customers', icon: '👥' },
    { label: 'Tickets', path: '/tickets', icon: '🎫' },
    { label: 'Profile', path: '/profile', icon: '👤' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  ngOnInit(): void {
    this.dashboardStore.load();
  }

  initials(): string {
    const u = this.auth.user();
    if (!u) return 'TN';
    return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase();
  }
}
