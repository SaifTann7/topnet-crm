import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-12" [class.min-h-[200px]]="fullHeight()">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 dark:border-brand-800 dark:border-t-brand-400"></div>
      @if (message()) {
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ message() }}</p>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  readonly message = input('Loading...');
  readonly fullHeight = input(true);
}
