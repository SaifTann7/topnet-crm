import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { PasswordFieldComponent } from '../../../../shared/components/forms/password-field.component';
import { ThemeToggleComponent } from '../../../../shared/components/ui/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PasswordFieldComponent, ThemeToggleComponent],
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);

  readonly currentYear = new Date().getFullYear();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly shakeError = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  ngOnInit(): void {
    const remembered = this.auth.getRememberedEmail();
    if (remembered) {
      this.form.patchValue({ email: remembered, rememberMe: true });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    const { email, password, rememberMe } = this.form.getRawValue();
    this.auth.setRememberedEmail(rememberMe ? email : null);

    this.auth.login({ email, password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Invalid email or password. Please try again.');
        this.triggerShake();
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  private triggerShake(): void {
    this.shakeError.set(true);
    setTimeout(() => this.shakeError.set(false), 500);
  }
}
