import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/ui/button.component';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center dark:bg-slate-950">
      <p class="text-7xl font-bold text-amber-500">403</p>
      <h1 class="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Access forbidden</h1>
      <p class="mt-2 max-w-md text-slate-500">You don't have permission to access this resource.</p>
      <div class="mt-8 flex gap-3">
        <a routerLink="/dashboard"><app-button>Dashboard</app-button></a>
        <a routerLink="/login"><app-button variant="secondary">Sign in</app-button></a>
      </div>
    </div>
  `,
})
export class ForbiddenComponent {}
