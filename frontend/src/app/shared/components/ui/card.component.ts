import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="app-card" [class.p-0]="noPadding()">
      @if (title()) {
        <div class="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ title() }}</h3>
          @if (subtitle()) {
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ subtitle() }}</p>
          }
        </div>
      }
      <div [class.p-6]="!noPadding()">
        <ng-content />
      </div>
    </div>
  `,
})
export class CardComponent {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly noPadding = input(false);
}
