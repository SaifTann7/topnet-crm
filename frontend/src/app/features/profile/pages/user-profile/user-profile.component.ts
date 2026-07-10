import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../data-access/services/profile.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/components/ui/page-header.component';
import { CardComponent } from '../../../../shared/components/ui/card.component';
import { ButtonComponent } from '../../../../shared/components/ui/button.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/feedback/loading-spinner.component';
import { AlertComponent } from '../../../../shared/components/feedback/alert.component';
import { BadgeComponent } from '../../../../shared/components/ui/badge.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    LoadingSpinnerComponent,
    AlertComponent,
    BadgeComponent,
  ],
  template: `
    <app-page-header title="Profile" description="Manage your personal information and credentials" />

    @if (loading()) {
      <app-loading-spinner />
    } @else {
      <div class="grid gap-6 lg:grid-cols-2">
        <app-card title="Personal Information">
          @if (profileSuccess()) {
            <app-alert class="mb-4 block" message="Profile updated successfully." type="success" />
          }
          @if (profileError()) {
            <app-alert class="mb-4 block" [message]="profileError()!" type="error" />
          }
          <form [formGroup]="profileForm" class="space-y-4" (ngSubmit)="saveProfile()">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium">First Name</label>
                <input class="app-input" formControlName="firstName" />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium">Last Name</label>
                <input class="app-input" formControlName="lastName" />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium">Phone</label>
                <input class="app-input" formControlName="phone" />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium">Job Title</label>
                <input class="app-input" formControlName="jobTitle" />
              </div>
              <div class="sm:col-span-2">
                <label class="mb-1 block text-sm font-medium">Department</label>
                <input class="app-input" formControlName="department" />
              </div>
            </div>
            <app-button type="submit" [loading]="savingProfile()">Save Changes</app-button>
          </form>
        </app-card>

        <div class="space-y-6">
          <app-card title="Account Details">
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-slate-500">Email</span><span class="font-medium">{{ auth.user()?.email }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Roles</span>
                <div class="flex flex-wrap gap-1">
                  @for (role of auth.roles(); track role) {
                    <app-badge [label]="role.replace('ROLE_', '')" tone="info" />
                  }
                </div>
              </div>
            </div>
          </app-card>

          <app-card title="Change Password">
            @if (passwordSuccess()) {
              <app-alert class="mb-4 block" message="Password changed successfully." type="success" />
            }
            @if (passwordError()) {
              <app-alert class="mb-4 block" [message]="passwordError()!" type="error" />
            }
            <form [formGroup]="passwordForm" class="space-y-4" (ngSubmit)="changePassword()">
              <div>
                <label class="mb-1 block text-sm font-medium">Current Password</label>
                <input type="password" class="app-input" formControlName="currentPassword" />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium">New Password</label>
                <input type="password" class="app-input" formControlName="newPassword" />
              </div>
              <app-button type="submit" variant="secondary" [loading]="savingPassword()">Update Password</app-button>
            </form>
          </app-card>
        </div>
      </div>
    }
  `,
})
export class UserProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);
  readonly profileSuccess = signal(false);
  readonly profileError = signal<string | null>(null);
  readonly passwordSuccess = signal(false);
  readonly passwordError = signal<string | null>(null);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    jobTitle: [''],
    department: [''],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue(profile);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    this.profileSuccess.set(false);
    this.profileError.set(null);
    this.profileService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.profileSuccess.set(true);
        this.auth.loadCurrentUser().subscribe();
      },
      error: (err) => {
        this.profileError.set(err?.error?.message ?? 'Failed to update profile.');
        this.savingProfile.set(false);
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword.set(true);
    this.passwordSuccess.set(false);
    this.passwordError.set(null);
    this.profileService.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordSuccess.set(true);
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordError.set(err?.error?.message ?? 'Failed to change password.');
        this.savingPassword.set(false);
      },
    });
  }
}
