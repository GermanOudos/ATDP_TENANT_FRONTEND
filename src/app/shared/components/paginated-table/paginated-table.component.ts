import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TuiButton } from '@taiga-ui/core';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-paginated-table',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, TuiButton, EmptyStateComponent],
  template: `
    <!-- Search -->
    <div class="mb-4">
      <div class="flex items-center gap-2 max-w-sm">
        <div class="relative flex-1">
          <lucide-icon
            name="search"
            class="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            style="left: 0.75rem;"
          />
          <input
            type="text"
            [placeholder]="searchPlaceholder()"
            [(ngModel)]="searchValue"
            class="w-full py-2 pr-8 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            style="padding-left: 2.25rem;"
            (keydown.enter)="onSearch()"
          />
          @if (searchValue) {
            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              (click)="onClear()"
            >
              <lucide-icon name="x" class="w-4 h-4" />
            </button>
          }
        </div>
        <button tuiButton appearance="outline" size="m" (click)="onSearch()">
          Buscar
        </button>
      </div>
    </div>

    <!-- Table card -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      @if (isLoading()) {
        <div class="flex items-center justify-center py-16">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (isEmpty()) {
        <app-empty-state [message]="emptyMessage()" />
      } @else {
        <table class="w-full text-sm">
          <ng-content select="thead" />
          <ng-content select="tbody" />
        </table>

        <!-- Pagination footer -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <div class="flex items-center gap-3">
            <p class="text-xs text-slate-500">
              {{ totalRecords() }} {{ entityLabel() }} en total
            </p>
            <div class="flex items-center gap-1.5">
              <label class="text-xs text-slate-500">Filas:</label>
              <select
                class="text-xs border border-slate-200 rounded px-1.5 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                [ngModel]="pageSize()"
                (ngModelChange)="pageSizeChange.emit($event)"
              >
                <option [ngValue]="10">10</option>
                <option [ngValue]="20">20</option>
                <option [ngValue]="50">50</option>
                <option [ngValue]="100">100</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              tuiButton appearance="outline" size="xs"
              [disabled]="!hasPreviousPage()"
              title="Primera página"
              (click)="pageChange.emit(1)"
            >
              <lucide-icon name="chevrons-left" class="w-4 h-4" />
            </button>
            <button
              tuiButton appearance="outline" size="xs"
              [disabled]="!hasPreviousPage()"
              title="Página anterior"
              (click)="pageChange.emit(page() - 1)"
            >
              <lucide-icon name="chevron-left" class="w-4 h-4" />
            </button>
            <span class="text-xs text-slate-600 px-2">
              Página {{ page() }} de {{ totalPages() }}
            </span>
            <button
              tuiButton appearance="outline" size="xs"
              [disabled]="!hasNextPage()"
              title="Página siguiente"
              (click)="pageChange.emit(page() + 1)"
            >
              <lucide-icon name="chevron-right" class="w-4 h-4" />
            </button>
            <button
              tuiButton appearance="outline" size="xs"
              [disabled]="!hasNextPage()"
              title="Última página"
              (click)="pageChange.emit(totalPages())"
            >
              <lucide-icon name="chevrons-right" class="w-4 h-4" />
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class PaginatedTableComponent {
  // Required inputs — state comes from the feature store
  readonly isLoading = input.required<boolean>();
  readonly isEmpty = input.required<boolean>();
  readonly totalRecords = input.required<number>();
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly hasPreviousPage = input.required<boolean>();
  readonly hasNextPage = input.required<boolean>();

  // Optional customization
  readonly emptyMessage = input<string>('Sin registros');
  readonly searchPlaceholder = input<string>('Buscar...');
  readonly entityLabel = input<string>('registros');

  // Outputs — feature components listen and update their store
  readonly search = output<string>();
  readonly pageSizeChange = output<number>();
  readonly pageChange = output<number>();

  protected searchValue = '';

  protected onSearch(): void {
    this.search.emit(this.searchValue.trim());
  }

  protected onClear(): void {
    this.searchValue = '';
    this.search.emit('');
  }
}
