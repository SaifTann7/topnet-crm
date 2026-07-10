import { Component, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { DashboardStore } from '../../../features/dashboard/data-access/store/dashboard.store';
import { ThemeToggleComponent } from '../../../shared/components/ui/theme-toggle.component';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [RouterLink, ThemeToggleComponent],
  template: `
    <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
      <div class="flex h-16 items-center gap-4 px-4 sm:px-6">
        <button
          type="button"
          class="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          (click)="menuToggle.emit()"
          aria-label="Open menu"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div class="hidden min-w-0 flex-1 lg:block">
          <p class="truncate text-sm font-medium text-slate-900 dark:text-white">
            Welcome back, <span class="text-brand-600 dark:text-brand-400">{{ auth.user()?.firstName }}</span>
          </p>
          <p class="truncate text-xs text-slate-500">{{ pageTitle() }}</p>
        </div>

        <div class="relative ml-auto flex items-center gap-2 sm:gap-3">
          <div class="hidden sm:block">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="search"
                placeholder="Search..."
                class="w-44 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 xl:w-56 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <app-theme-toggle />

          <div class="relative">
            <button
              type="button"
              class="relative rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              (click)="store.toggleNotifications()"
              aria-label="Notifications"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              @if (store.unreadNotifications() > 0) {
                <span class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {{ store.unreadNotifications() }}
                </span>
              }
            </button>

            @if (store.notificationsOpen()) {
              <div class="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated dark:border-slate-700 dark:bg-slate-900">
                <div class="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                </div>
                <div class="max-h-80 overflow-y-auto">
                  @for (n of store.notifications(); track n.id) {
                    <div class="border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800">
                      <p class="text-sm font-medium text-slate-900 dark:text-white">{{ n.title }}</p>
                      <p class="mt-0.5 text-xs text-slate-500">{{ n.message }}</p>
                    </div>
                  } @empty {
                    <p class="px-4 py-8 text-center text-sm text-slate-400">No notifications</p>
                  }
                </div>
              </div>
            }
          </div>

          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-1.5 pr-3 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              (click)="profileOpen.set(!profileOpen())"
            >
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
                {{ initials() }}
              </div>
              <span class="hidden text-sm font-medium text-slate-700 md:inline dark:text-slate-200">{{ auth.fullName() }}</span>
            </button>

            @if (profileOpen()) {
              <div class="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated dark:border-slate-700 dark:bg-slate-900">
                <div class="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ auth.fullName() }}</p>
                  <p class="text-xs text-slate-500">{{ auth.user()?.email }}</p>
                </div>
                <a routerLink="/profile" class="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800" (click)="profileOpen.set(false)">My Profile</a>
                <a routerLink="/settings" class="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800" (click)="profileOpen.set(false)">Settings</a>
                <button class="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" (click)="auth.logout()">Sign out</button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
})
export class TopNavbarComponent {
  readonly auth = inject(AuthService);
  readonly store = inject(DashboardStore);

  readonly pageTitle = input('TOPNET CRM Dashboard');
  readonly menuToggle = output<void>();

  readonly profileOpen = signal(false);

  initials(): string {
    const u = this.auth.user();
    if (!u) return 'TN';
    return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase();
  }
}
