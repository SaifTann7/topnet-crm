import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="close.emit()"></div>
        <div class="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-elevated dark:border-slate-700 dark:bg-slate-900">
          <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">{{ title() }}</h2>
            <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" (click)="close.emit()">✕</button>
          </div>
          <div class="px-6 py-4">
            <ng-content />
          </div>
          @if (showFooter()) {
            <div class="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
              <ng-content select="[modal-footer]" />
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly showFooter = input(true);
  readonly close = output<void>();
}
