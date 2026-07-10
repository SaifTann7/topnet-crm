import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { TOKEN_KEY, REMEMBER_EMAIL_KEY } from '../../config/api.config';
import { AuthResponse, LoginRequest, UserSummary } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly _user = signal<UserSummary | null>(this.readUserFromStorage());
  private readonly _token = signal<string | null>(this.readTokenFromStorage());

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly fullName = computed(() => {
    const u = this._user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });
  readonly roles = computed(() => this._user()?.roles ?? []);

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', request).pipe(
      tap((response) => this.persistSession(response))
    );
  }

  loadCurrentUser(): Observable<UserSummary> {
    return this.api.get<UserSummary>('/auth/me').pipe(
      tap((user) => {
        this._user.set(user);
        localStorage.setItem('topnet_crm_user', JSON.stringify(user));
      })
    );
  }

  logout(redirectTo: string | false = '/login'): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('topnet_crm_user');
    if (redirectTo) {
      this.router.navigate([redirectTo]);
    }
  }

  hasAnyRole(...roles: string[]): boolean {
    const userRoles = this.roles();
    return roles.some((role) => userRoles.includes(role));
  }

  getToken(): string | null {
    return this._token();
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/forgot-password', { email });
  }

  getRememberedEmail(): string | null {
    return localStorage.getItem(REMEMBER_EMAIL_KEY);
  }

  setRememberedEmail(email: string | null): void {
    if (email) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }
  }

  private persistSession(response: AuthResponse): void {
    this._token.set(response.accessToken);
    this._user.set(response.user);
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem('topnet_crm_user', JSON.stringify(response.user));
  }

  private readTokenFromStorage(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUserFromStorage(): UserSummary | null {
    const raw = localStorage.getItem('topnet_crm_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserSummary;
    } catch {
      return null;
    }
  }
}
