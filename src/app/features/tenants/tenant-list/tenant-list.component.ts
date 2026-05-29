import { Component, inject, OnInit, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TuiButton } from '@taiga-ui/core';
import { TenantsStore } from '../tenants.store';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { TenantCreateFormComponent } from '../forms/tenant-create-form/tenant-create-form.component';
import { TenantDto, CreateTenantRequest } from '@schemas/tenant.schema';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    RouterLink,
    LucideAngularModule,
    TuiButton,
    PageHeaderComponent,
    StatusBadgeComponent,
    DateFormatPipe,
    PaginatedTableComponent,
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

    <app-paginated-table
      [isLoading]="store.isLoading()"
      [isEmpty]="store.items().length === 0"
      [totalRecords]="store.pagination().totalRecords"
      [page]="store.pagination().page"
      [pageSize]="store.pagination().pageSize"
      [totalPages]="store.pagination().totalPages"
      [hasPreviousPage]="store.hasPreviousPage()"
      [hasNextPage]="store.hasNextPage()"
      searchPlaceholder="Buscar tenant..."
      emptyMessage="No se encontraron tenants"
      entityLabel="tenants"
      (search)="onSearch($event)"
      (pageSizeChange)="onPageSizeChange($event)"
      (pageChange)="onPageChange($event)"
    >
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
              <lucide-icon
                name="key-round"
                [class]="tenant.hasApiCredentials ? 'w-4 h-4 text-green-500' : 'w-4 h-4 text-slate-300'"
              />
            </td>
            <td class="px-4 py-3">
              <lucide-icon
                name="shield-check"
                [class]="tenant.tenantSecretIsActive ? 'w-4 h-4 text-green-500' : 'w-4 h-4 text-slate-300'"
              />
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
    </app-paginated-table>
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

  onSearch(term: string): void {
    this.store.setSearch(term);
    this.store.loadAll(this.store.paginationParams());
  }

  onPageSizeChange(size: number): void {
    this.store.setPageSize(size);
    this.store.loadAll(this.store.paginationParams());
  }

  onPageChange(page: number): void {
    this.store.setPage(page);
    this.store.loadAll(this.store.paginationParams());
  }

  onCreateTenant(dto: CreateTenantRequest): void {
    const creator =
      this.authStore.currentUser()?.username ??
      this.authStore.displayName() ??
      'system';
    this.store.createTenant({ ...dto, createdBy: creator, creator });
  }

  getStatus(tenant: TenantDto): 'active' | 'inactive' | 'deleted' {
    if (tenant.isDeleted) return 'deleted';
    if (!tenant.isActive) return 'inactive';
    return 'active';
  }
}
