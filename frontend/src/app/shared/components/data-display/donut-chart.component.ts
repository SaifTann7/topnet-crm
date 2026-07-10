import { Component, computed, input } from '@angular/core';
import { ChartSegment } from '../../../features/dashboard/data-access/models/dashboard.model';

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  template: `
    <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
      <div class="relative h-44 w-44 shrink-0">
        <svg viewBox="0 0 42 42" class="h-full w-full -rotate-90">
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="currentColor" class="text-slate-100 dark:text-slate-800" stroke-width="4" />
          @for (arc of arcs(); track arc.label) {
            <circle
              cx="21" cy="21" r="15.9" fill="none"
              [attr.stroke]="arc.color"
              stroke-width="4"
              [attr.stroke-dasharray]="arc.dashArray"
              [attr.stroke-dashoffset]="arc.dashOffset"
              class="transition-all duration-700 ease-out"
            />
          }
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-2xl font-bold text-slate-900 dark:text-white">{{ total() }}</span>
          <span class="text-xs text-slate-500">Total</span>
        </div>
      </div>

      <div class="w-full space-y-2 sm:w-auto sm:min-w-[140px]">
        @for (segment of segments(); track segment.label) {
          <div class="flex items-center justify-between gap-4 text-sm">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full" [style.background]="segment.color"></span>
              <span class="text-slate-600 dark:text-slate-300">{{ segment.label }}</span>
            </div>
            <span class="font-semibold tabular-nums text-slate-900 dark:text-white">{{ segment.percentage }}%</span>
          </div>
        }
      </div>
    </div>
  `,
})
export class DonutChartComponent {
  readonly segments = input.required<ChartSegment[]>();

  readonly total = computed(() => this.segments().reduce((sum, s) => sum + s.value, 0));

  readonly arcs = computed(() => {
    const circumference = 100;
    let offset = 0;
    return this.segments().map((segment) => {
      const portion = (segment.value / (this.total() || 1)) * circumference;
      const arc = {
        label: segment.label,
        color: segment.color,
        dashArray: `${portion} ${circumference - portion}`,
        dashOffset: String(-offset),
      };
      offset += portion;
      return arc;
    });
  });
}
