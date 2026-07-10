import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
      <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-800">📭</div>
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ title() }}</h3>
      <p class="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{{ description() }}</p>
      <div class="mt-6">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input('No data available.');
}
