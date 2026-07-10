import { Component, input } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  template: `
    <div class="rounded-lg border px-4 py-3 text-sm" [class]="alertClass()">
      {{ message() }}
    </div>
  `,
})
export class AlertComponent {
  readonly message = input.required<string>();
  readonly type = input<'error' | 'success' | 'info' | 'warning'>('info');

  alertClass(): string {
    const map: Record<string, string> = {
      error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300',
      success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
      info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300',
      warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300',
    };
    return map[this.type()];
  }
}
