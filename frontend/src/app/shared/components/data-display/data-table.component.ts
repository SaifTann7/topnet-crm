import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, input, output, TemplateRef } from '@angular/core';

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  cell?: (row: T) => string;
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-900/60">
            <tr>
              @for (col of columns(); track col.key) {
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  [class.cursor-pointer]="col.sortable"
                  [class.select-none]="col.sortable"
                  [class.hover:text-slate-700]="col.sortable"
                  (click)="col.sortable && onSort(col.key)"
                >
                  <span class="inline-flex items-center gap-1">
                    {{ col.header }}
                    @if (col.sortable) {
                      <span class="text-[10px] leading-none" [class.text-brand-600]="sortColumn() === col.key">
                        @if (sortColumn() !== col.key) { ↕ }
                        @else if (sortDirection() === 'asc') { ↑ }
                        @else { ↓ }
                      </span>
                    }
                  </span>
                </th>
              }
              @if (rowActions()) {
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
            @for (row of data(); track trackBy()(row)) {
              <tr class="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                @for (col of columns(); track col.key) {
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    @if (cellTemplate()) {
                      <ng-container *ngTemplateOutlet="cellTemplate()!; context: { $implicit: row, column: col }" />
                    } @else {
                      {{ col.cell ? col.cell(row) : $any(row)[col.key] }}
                    }
                  </td>
                }
                @if (rowActions()) {
                  <td class="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <ng-container *ngTemplateOutlet="rowActions()!; context: { $implicit: row }" />
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DataTableComponent<T extends object> {
  readonly columns = input.required<TableColumn<T>[]>();
  readonly data = input.required<T[]>();
  readonly sortColumn = input<string>('createdAt');
  readonly sortDirection = input<'asc' | 'desc'>('desc');
  readonly trackBy = input<(row: T) => string | number>((row) => (row as { id?: number }).id ?? 0);
  readonly sortChange = output<SortState>();
  readonly rowActions = contentChild<TemplateRef<{ $implicit: T }>>('rowActions');
  readonly cellTemplate = contentChild<TemplateRef<{ $implicit: T; column: TableColumn<T> }>>('cellTemplate');

  onSort(column: string): void {
    const direction =
      this.sortColumn() === column && this.sortDirection() === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ column, direction });
  }
}
