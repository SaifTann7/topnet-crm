import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/ui/button.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center dark:bg-slate-950">
      <p class="text-7xl font-bold text-red-500">401</p>
      <h1 class="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Unauthorized</h1>
      <p class="mt-2 max-w-md text-slate-500">Your session has expired or you are not authenticated.</p>
      <a routerLink="/login" class="mt-8"><app-button>Sign in again</app-button></a>
    </div>
  `,
})
export class UnauthorizedComponent {}
