import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ThemeToggleComponent } from '../../../../shared/components/ui/theme-toggle.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ThemeToggleComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header class="flex items-center justify-between px-6 py-5 sm:px-10">
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">TN</div>
          <span class="font-bold text-slate-900 dark:text-white">TOPNET CRM</span>
        </div>
        <app-theme-toggle />
      </header>

      <div class="flex flex-1 items-center justify-center px-6 pb-10">
        <div class="w-full max-w-md animate-fade-up">
          <a routerLink="/login" class="mb-6 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline dark:text-brand-400">
            ← Back to sign in
          </a>

          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Reset your password</h2>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your work email and we'll send you instructions to reset your password.
          </p>

          @if (success()) {
            <div class="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300" role="status">
              {{ success() }}
            </div>
          }

          @if (error()) {
            <div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300" role="alert">
              {{ error() }}
            </div>
          }

          @if (!success()) {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-5">
              <div>
                <label for="reset-email" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Work email</label>
                <input id="reset-email" type="email" formControlName="email" class="app-input" placeholder="name@company.com" autocomplete="email" />
              </div>
              <button
                type="submit"
                [disabled]="form.invalid || loading()"
                class="app-btn-primary w-full py-3"
              >
                @if (loading()) {
                  <span class="flex items-center justify-center gap-2">
                    <span class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                    Sending...
                  </span>
                } @else {
                  Send reset instructions
                }
              </button>
            </form>
          }
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const remembered = this.auth.getRememberedEmail();
    if (remembered) {
      this.form.patchValue({ email: remembered });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.forgotPassword(this.form.controls.email.value).subscribe({
      next: (res) => {
        this.success.set(res.message);
        this.loading.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Unable to process request. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
