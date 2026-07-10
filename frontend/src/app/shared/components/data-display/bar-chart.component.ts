import { Component, input } from '@angular/core';
import { ChartSegment } from '../../../features/dashboard/data-access/models/dashboard.model';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `
    <div class="space-y-4">
      @for (segment of segments(); track segment.label) {
        <div class="animate-fade-up">
          <div class="mb-1.5 flex items-center justify-between text-sm">
            <span class="font-medium text-slate-600 dark:text-slate-300">{{ segment.label }}</span>
            <span class="tabular-nums text-slate-500">{{ segment.value }}</span>
          </div>
          <div class="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out"
              [style.width.%]="segment.percentage"
              [style.background]="segment.color"
            ></div>
          </div>
        </div>
      }
      @if (segments().length === 0) {
        <p class="py-8 text-center text-sm text-slate-400">No data available</p>
      }
    </div>
  `,
})
export class BarChartComponent {
  readonly segments = input.required<ChartSegment[]>();
}
