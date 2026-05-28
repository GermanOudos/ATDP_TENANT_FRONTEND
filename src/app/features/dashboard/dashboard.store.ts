import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { TenantDto } from '@schemas/tenant.schema';
import { TenantsService } from '@features/tenants/tenants.service';

interface DashboardState {
  tenants: TenantDto[];
  isLoading: boolean;
  lastRefreshed: string | null;
}

export const DashboardStore = signalStore(
  withState<DashboardState>({ tenants: [], isLoading: false, lastRefreshed: null }),
  withComputed(({ tenants }) => ({
    totalTenants: computed(() => tenants().filter((t) => !t.isDeleted).length),
    activeTenants: computed(() => tenants().filter((t) => t.isActive && !t.isDeleted).length),
    inactiveTenants: computed(() => tenants().filter((t) => !t.isActive && !t.isDeleted).length),
    deletedTenants: computed(() => tenants().filter((t) => t.isDeleted).length),
    tenantsWithApiCredentials: computed(() => tenants().filter((t) => t.hasApiCredentials).length),
    tenantsWithActiveSecret: computed(() => tenants().filter((t) => t.tenantSecretIsActive).length),
    tenantsWithTsaPrincipal: computed(() => tenants().filter((t) => t.tsaPrincipalConfigured).length),
    tenantsWithTsaContingency: computed(() => tenants().filter((t) => t.tsaContingencyConfigured).length),
    recentTenants: computed(() =>
      [...tenants()]
        .filter((t) => !t.isDeleted)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    ),
    apiCredentialsCoverage: computed(() => {
      const active = tenants().filter((t) => !t.isDeleted);
      if (!active.length) return 0;
      return Math.round((active.filter((t) => t.hasApiCredentials).length / active.length) * 100);
    }),
    tenantsByStatus: computed(() => {
      const active = tenants().filter((t) => t.isActive && !t.isDeleted).length;
      const inactive = tenants().filter((t) => !t.isActive && !t.isDeleted).length;
      const deleted = tenants().filter((t) => t.isDeleted).length;
      return [active, inactive, deleted];
    }),
    tenantsByMonth: computed(() => {
      const months: Record<string, number> = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months[key] = 0;
      }
      tenants()
        .filter((t) => !t.isDeleted)
        .forEach((t) => {
          const d = new Date(t.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (key in months) months[key]++;
        });
      return Object.entries(months).map(([month, count]) => ({ month, count }));
    }),
  })),
  withMethods((store, service = inject(TenantsService)) => ({
    loadData: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          service.getAll({ page: 1, pageSize: 100, includeDeleted: true }).pipe(
            tapResponse({
              next: (res) => {
                patchState(store, {
                  tenants: res.data,
                  isLoading: false,
                  lastRefreshed: new Date().toISOString(),
                });
              },
              error: () => patchState(store, { isLoading: false }),
            })
          )
        )
      )
    ),
  }))
);
