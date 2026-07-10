import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { UserAdminService, UserDto } from '../../data-access/services/user-admin.service';
import { PageHeaderComponent } from '../../../../shared/components/ui/page-header.component';
import { CardComponent } from '../../../../shared/components/ui/card.component';
import { ThemeToggleComponent } from '../../../../shared/components/ui/theme-toggle.component';
import { BadgeComponent } from '../../../../shared/components/ui/badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/feedback/loading-spinner.component';
import { ButtonComponent } from '../../../../shared/components/ui/button.component';

@Component({
  selector: 'app-settings-home',
  standalone: true,
  imports: [
    PageHeaderComponent,
    CardComponent,
    ThemeToggleComponent,
    BadgeComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
  ],
  template: `
    <app-page-header title="Settings" description="Application preferences and administration" />

    <div class="grid gap-6 lg:grid-cols-2">
      <app-card title="Appearance" subtitle="Customize your workspace">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900 dark:text-white">Dark Mode</p>
            <p class="text-xs text-slate-500">Toggle between light and dark themes</p>
          </div>
          <app-theme-toggle />
        </div>
        <p class="mt-4 text-xs text-slate-400">Current theme: {{ theme.theme() }}</p>
      </app-card>

      <app-card title="Notifications" subtitle="Local preferences">
        <label class="flex items-center gap-3 text-sm">
          <input type="checkbox" [checked]="emailNotif()" (change)="toggleEmailNotif($event)" class="rounded border-slate-300" />
          Email notifications (local preference)
        </label>
        <label class="mt-3 flex items-center gap-3 text-sm">
          <input type="checkbox" [checked]="desktopNotif()" (change)="toggleDesktopNotif($event)" class="rounded border-slate-300" />
          Desktop alerts (local preference)
        </label>
      </app-card>
    </div>

    @if (isAdmin()) {
      <div class="mt-6">
        <app-card title="User Management" subtitle="Administration — requires ROLE_ADMIN or ROLE_MANAGER">
          @if (usersLoading()) {
            <app-loading-spinner [fullHeight]="false" message="Loading users..." />
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
                    <th class="py-2 pr-4">Name</th>
                    <th class="py-2 pr-4">Email</th>
                    <th class="py-2 pr-4">Roles</th>
                    <th class="py-2 pr-4">Status</th>
                    <th class="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of users(); track user.id) {
                    <tr class="border-b border-slate-100 dark:border-slate-800">
                      <td class="py-3 pr-4 font-medium">{{ user.firstName }} {{ user.lastName }}</td>
                      <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ user.email }}</td>
                      <td class="py-3 pr-4">
                        @for (role of user.roles; track role) {
                          <app-badge class="mr-1" [label]="role.replace('ROLE_', '')" tone="info" />
                        }
                      </td>
                      <td class="py-3 pr-4">
                        <app-badge [label]="user.active ? 'Active' : 'Inactive'" [tone]="user.active ? 'success' : 'default'" />
                      </td>
                      <td class="py-3 text-right">
                        @if (user.active) {
                          <app-button variant="danger" (click)="deactivate(user)">Deactivate</app-button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </app-card>
      </div>
    }
  `,
})
export class SettingsHomeComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly userAdmin = inject(UserAdminService);

  readonly users = signal<UserDto[]>([]);
  readonly usersLoading = signal(false);
  readonly emailNotif = signal(localStorage.getItem('topnet_email_notif') !== 'false');
  readonly desktopNotif = signal(localStorage.getItem('topnet_desktop_notif') === 'true');

  readonly isAdmin = computed(() =>
    this.auth.hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')
  );

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    this.usersLoading.set(true);
    this.userAdmin.list().subscribe({
      next: (res) => {
        this.users.set(res.content);
        this.usersLoading.set(false);
      },
      error: () => this.usersLoading.set(false),
    });
  }

  deactivate(user: UserDto): void {
    if (!confirm(`Deactivate user ${user.email}?`)) return;
    this.userAdmin.deactivate(user.id).subscribe({ next: () => this.loadUsers() });
  }

  toggleEmailNotif(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.emailNotif.set(checked);
    localStorage.setItem('topnet_email_notif', String(checked));
  }

  toggleDesktopNotif(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.desktopNotif.set(checked);
    localStorage.setItem('topnet_desktop_notif', String(checked));
  }
}
