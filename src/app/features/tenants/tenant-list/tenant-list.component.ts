import { Component, inject, OnInit, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TuiButton } from '@taiga-ui/core';
import { TenantsStore } from '../tenants.store';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { TenantCreateFormComponent } from '../forms/tenant-create-form/tenant-create-form.component';
import { TenantDto, CreateTenantRequest } from '@schemas/tenant.schema';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    LucideAngularModule,
    TuiButton,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    DateFormatPipe,
    TenantCreateFormComponent,
  ],
  template: `
    <app-page-header title="Tenants" subtitle="Gestión de organizaciones registradas">
      <button tuiButton appearance="primary" size="m" (click)="showCreateForm = !showCreateForm">
        <lucide-icon name="plus" class="w-4 h-4 mr-1" />
        {{ showCreateForm ? 'Cerrar formulario' : 'Nuevo tenant' }}
      </button>
    </app-page-header>

    @if (showCreateForm) {
      <div class="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <app-tenant-create-form
          [serverError]="store.serverErrors().length ? store.serverErrors()[0] : null"
          [isSubmitting]="store.isSubmitting()"
          (created)="onCreateTenant($event)"
          (cancelled)="showCreateForm = false"
        />
      </div>
    }

    <!-- Search -->
    <div class="mb-4">
      <div class="flex items-center gap-2 max-w-sm">
        <div class="relative flex-1">
          <lucide-icon name="search" class="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" style="left: 0.75rem;" />
          <input
            #searchInput
            type="text"
            placeholder="Buscar tenant..."
            class="w-full py-2 pr-8 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            style="padding-left: 2.25rem;"
            (keydown.enter)="onSearch(searchInput.value)"
          />
          @if (searchInput.value) {
            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              (click)="clearSearch(searchInput)"
            >
              <lucide-icon name="x" class="w-4 h-4" />
            </button>
          }
        </div>
        <button tuiButton appearance="outline" size="m" (click)="onSearch(searchInput.value)">
          Buscar
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      @if (store.isLoading()) {
        <div class="flex items-center justify-center py-16">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (store.items().length === 0) {
        <app-empty-state message="No se encontraron tenants" />
      } @else {
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Identificación</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Razón social</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">API</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Secreto</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Creado</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (tenant of store.items(); track tenant.id) {
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 font-mono text-xs text-slate-700">{{ tenant.identificationNumber }}</td>
                <td class="px-4 py-3 font-medium text-slate-900">{{ tenant.businessName }}</td>
                <td class="px-4 py-3">
                  <app-status-badge [status]="getStatus(tenant)" />
                </td>
                <td class="px-4 py-3">
                  @if (tenant.hasApiCredentials) {
                    <lucide-icon name="key-round" class="w-4 h-4 text-green-500" />
                  } @else {
                    <lucide-icon name="key-round" class="w-4 h-4 text-slate-300" />
                  }
                </td>
                <td class="px-4 py-3">
                  @if (tenant.tenantSecretIsActive) {
                    <lucide-icon name="shield-check" class="w-4 h-4 text-green-500" />
                  } @else {
                    <lucide-icon name="shield-check" class="w-4 h-4 text-slate-300" />
                  }
                </td>
                <td class="px-4 py-3 text-slate-500">{{ tenant.createdAt | dateFormat:'date' }}</td>
                <td class="px-4 py-3">
                  <a
                    [routerLink]="[tenant.id]"
                    class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Ver
                    <lucide-icon name="chevron-right" class="w-3 h-3" />
                  </a>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <div class="flex items-center gap-3">
            <p class="text-xs text-slate-500">
              {{ store.pagination().totalRecords }} tenants en total
            </p>
            <div class="flex items-center gap-1.5">
              <label class="text-xs text-slate-500">Filas:</label>
              <select
                class="text-xs border border-slate-200 rounded px-1.5 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                [ngModel]="store.pagination().pageSize"
                (ngModelChange)="onPageSizeChange($event)"
              >
                <option [ngValue]="10">10</option>
                <option [ngValue]="20">20</option>
                <option [ngValue]="50">50</option>
                <option [ngValue]="100">100</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              tuiButton appearance="outline" size="xs"
              [disabled]="!store.hasPreviousPage()"
              (click)="store.setPage(store.pagination().page - 1); store.loadAll(store.paginationParams())"
            >
              <lucide-icon name="chevron-left" class="w-4 h-4" />
            </button>
            <span class="text-xs text-slate-600">
              Página {{ store.pagination().page }} de {{ store.pagination().totalPages }}
            </span>
            <button
              tuiButton appearance="outline" size="xs"
              [disabled]="!store.hasNextPage()"
              (click)="store.setPage(store.pagination().page + 1); store.loadAll(store.paginationParams())"
            >
              <lucide-icon name="chevron-right" class="w-4 h-4" />
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class TenantListComponent implements OnInit {
  protected readonly store = inject(TenantsStore);
  private readonly authStore = inject(AuthStore);
  protected showCreateForm = false;
  private wasSubmitting = false;

  constructor() {
    effect(() => {
      const isSubmitting = this.store.isSubmitting();
      const hasErrors = this.store.serverErrors().length > 0;
      if (this.wasSubmitting && !isSubmitting && !hasErrors) {
        this.showCreateForm = false;
      }
      this.wasSubmitting = isSubmitting;
    });
  }

  ngOnInit(): void {
    this.store.loadAll(this.store.paginationParams());
  }

  onSearch(value: string): void {
    this.store.setSearch(value.trim());
    this.store.loadAll(this.store.paginationParams());
  }

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.store.setSearch('');
    this.store.loadAll(this.store.paginationParams());
  }

  onPageSizeChange(size: number): void {
    this.store.setPageSize(size);
    this.store.loadAll(this.store.paginationParams());
  }

  onCreateTenant(dto: CreateTenantRequest): void {
    const creator =
      this.authStore.currentUser()?.username ??
      this.authStore.displayName() ??
      'system';

    this.store.createTenant({
      ...dto,
      createdBy: creator,
      creator,
    });
  }

  getStatus(tenant: TenantDto): 'active' | 'inactive' | 'deleted' {
    if (tenant.isDeleted) return 'deleted';
    if (!tenant.isActive) return 'inactive';
    return 'active';
  }
}
