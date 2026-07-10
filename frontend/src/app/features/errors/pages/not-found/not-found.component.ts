import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/ui/button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  template: `
    <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p class="text-7xl font-bold text-brand-600">404</p>
      <h1 class="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p class="mt-2 max-w-md text-slate-500">The page you are looking for doesn't exist or has been moved.</p>
      <a routerLink="/dashboard" class="mt-8"><app-button>Back to Dashboard</app-button></a>
    </div>
  `,
})
export class NotFoundComponent {}
