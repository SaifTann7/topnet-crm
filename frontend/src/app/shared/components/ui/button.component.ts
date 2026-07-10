import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button [type]="type()" [disabled]="disabled() || loading()" [class]="buttonClass()">
      @if (loading()) {
        <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'danger'>('primary');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);

  buttonClass(): string {
    const variants: Record<string, string> = {
      primary: 'app-btn-primary',
      secondary: 'app-btn-secondary',
      danger: 'app-btn-danger',
    };
    return variants[this.variant()];
  }
}
