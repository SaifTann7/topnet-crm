import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../ui/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="cancel.emit()"></div>
        <div
          class="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-elevated dark:border-slate-700 dark:bg-slate-900"
          role="alertdialog"
          [attr.aria-labelledby]="'confirm-title'"
        >
          <div class="mb-4 flex items-start gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              [class]="tone() === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'"
            >
              @if (tone() === 'danger') {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              } @else {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            </div>
            <div>
              <h3 id="confirm-title" class="text-lg font-semibold text-slate-900 dark:text-white">{{ title() }}</h3>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">{{ message() }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <app-button variant="secondary" type="button" [disabled]="loading()" (click)="cancel.emit()">
              {{ cancelLabel() }}
            </app-button>
            <app-button
              [variant]="tone() === 'danger' ? 'danger' : 'primary'"
              type="button"
              [loading]="loading()"
              (click)="confirm.emit()"
            >
              {{ confirmLabel() }}
            </app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('Confirm action');
  readonly message = input('Are you sure you want to continue?');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly tone = input<'danger' | 'warning'>('warning');
  readonly loading = input(false);
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
