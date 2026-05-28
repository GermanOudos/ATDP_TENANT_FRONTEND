import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { TenantDto } from '@schemas/tenant.schema';

@Component({
  selector: 'app-recent-tenants-list',
  standalone: true,
  imports: [RouterLink, DateFormatPipe, StatusBadgeComponent],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-5">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-700">Recientes</h3>
        <a routerLink="/tenants" class="text-xs text-blue-600 hover:underline">Ver todos</a>
      </div>
      <div class="space-y-3">
        @for (tenant of tenants(); track tenant.id) {
          <a
            [routerLink]="['/tenants', tenant.id]"
            class="-mx-1.5 flex items-center justify-between rounded-lg p-1.5 transition-colors hover:bg-slate-50"
          >
            <div>
              <p class="line-clamp-1 text-xs font-medium text-slate-800">{{ tenant.businessName }}</p>
              <p class="text-xs text-slate-400">{{ tenant.createdAt | dateFormat:'date' }}</p>
            </div>
            <app-status-badge [status]="getTenantStatus(tenant)" />
          </a>
        }
        @if (tenants().length === 0) {
          <p class="py-4 text-center text-xs text-slate-400">Sin tenants registrados</p>
        }
      </div>
    </div>
  `,
})
export class RecentTenantsListComponent {
  readonly tenants = input<TenantDto[]>([]);

  protected getTenantStatus(tenant: TenantDto): 'active' | 'inactive' | 'deleted' {
    if (tenant.isDeleted) return 'deleted';
    if (!tenant.isActive) return 'inactive';
    return 'active';
  }
}
