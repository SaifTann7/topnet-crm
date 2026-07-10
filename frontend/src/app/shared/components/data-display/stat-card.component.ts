import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="app-card p-5">
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ label() }}</p>
      <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ value() }}</p>
      @if (hint()) {
        <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">{{ hint() }}</p>
      }
    </div>
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>();
}
