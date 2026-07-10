import { Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div
      class="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated dark:border-slate-800 dark:bg-slate-900"
      [style.animation-delay]="delay()"
    >
      <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-110" [style.background]="accent()"></div>

      <div class="relative flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ label() }}</p>
          <p class="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{{ value() }}</p>
          @if (hint()) {
            <p class="mt-1 text-xs text-slate-400">{{ hint() }}</p>
          }
        </div>
        <div
          class="flex h-11 w-11 items-center justify-center rounded-xl text-lg ring-1 ring-inset"
          [style.background]="accent() + '18'"
          [style.color]="accent()"
          [style.borderColor]="accent() + '33'"
        >
          {{ icon() }}
        </div>
      </div>

      @if (trend()) {
        <div class="relative mt-4 flex items-center gap-1.5 text-xs font-medium" [class]="trendPositive() ? 'text-emerald-600' : 'text-slate-500'">
          <span>{{ trend() }}</span>
        </div>
      }
    </div>
  `,
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input('📊');
  readonly hint = input<string>();
  readonly trend = input<string>();
  readonly trendPositive = input(true);
  readonly accent = input('#2563eb');
  readonly delay = input('0ms');
}
