import { Component, input } from '@angular/core';

export interface DataTableColumn {
  key: string;
  label: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  template: `
    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            @for (column of columns(); track column.key) {
              <th class="px-4 py-3 text-left font-semibold text-slate-600">
                {{ column.label }}
              </th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @if (rows().length === 0) {
            <tr>
              <td [attr.colspan]="columns().length" class="px-4 py-8 text-center text-slate-400">
                Sin registros
              </td>
            </tr>
          } @else {
            @for (row of rows(); track row[trackByKey()]) {
              <tr class="hover:bg-slate-50">
                @for (column of columns(); track column.key) {
                  <td class="px-4 py-3 text-slate-700">
                    {{ row[column.key] }}
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DataTableComponent {
  readonly columns = input.required<DataTableColumn[]>();
  readonly rows = input<Record<string, unknown>[]>([]);
  readonly trackByKey = input<string>('id');
}
