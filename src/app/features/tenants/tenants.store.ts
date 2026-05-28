import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  TenantDto,
  CreateTenantRequest,
  UpdateTenantRequest,
  GenerateSecretRequest,
  RevokeSecretRequest,
  SetApiCredentialsRequest,
  SetTsaConfigRequest,
} from '@schemas/tenant.schema';
import { PaginatedResponse, PaginationParams } from '@schemas/api-response.schema';
import { TenantsService } from './tenants.service';
import { ToastService } from '@core/services/toast.service';

interface TenantsState {
  items: TenantDto[];
  selectedTenant: TenantDto | null;
  pagination: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    searchTerm: string;
  };
  isLoading: boolean;
  isSubmitting: boolean;
  serverErrors: string[];
}

const initialState: TenantsState = {
  items: [],
  selectedTenant: null,
  pagination: { page: 1, pageSize: 10, totalRecords: 0, totalPages: 0, searchTerm: '' },
  isLoading: false,
  isSubmitting: false,
  serverErrors: [],
};

export const TenantsStore = signalStore(
  withState<TenantsState>(initialState),
  withComputed(({ items, pagination }) => ({
    activeCount: computed(() => items().filter((t) => t.isActive && !t.isDeleted).length),
    inactiveCount: computed(() => items().filter((t) => !t.isActive && !t.isDeleted).length),
    deletedCount: computed(() => items().filter((t) => t.isDeleted).length),
    withApiCredentials: computed(() => items().filter((t) => t.hasApiCredentials).length),
    withActiveSecret: computed(() => items().filter((t) => t.tenantSecretIsActive).length),
    hasPreviousPage: computed(() => pagination().page > 1),
    hasNextPage: computed(() => pagination().page < pagination().totalPages),
    paginationParams: computed<PaginationParams>(() => ({
      page: pagination().page,
      pageSize: pagination().pageSize,
      searchTerm: pagination().searchTerm,
    })),
  })),
  withMethods(
    (store, service = inject(TenantsService), toast = inject(ToastService)) => ({
      loadAll: rxMethod<PaginationParams>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((params) =>
            service.getAll(params).pipe(
              tapResponse({
                next: (res: PaginatedResponse<TenantDto>) => {
                  patchState(store, {
                    items: res.data,
                    pagination: {
                      ...store.pagination(),
                      totalRecords: res.totalRecords,
                      totalPages: res.totalPages,
                    },
                    isLoading: false,
                  });
                },
                error: () => patchState(store, { isLoading: false }),
              })
            )
          )
        )
      ),

      loadById: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((id) =>
            service.getById(id).pipe(
              tapResponse({
                next: (tenant) => patchState(store, { selectedTenant: tenant, isLoading: false }),
                error: () => patchState(store, { isLoading: false }),
              })
            )
          )
        )
      ),

      createTenant: rxMethod<CreateTenantRequest>(
        pipe(
          tap(() => patchState(store, { isSubmitting: true, serverErrors: [] })),
          switchMap((dto) =>
            service.create(dto).pipe(
              tapResponse({
                next: (tenant) => {
                  toast.success('Tenant creado correctamente');
                  patchState(store, {
                    items: [tenant, ...store.items()],
                    isSubmitting: false,
                    serverErrors: [],
                  });
                },
                error: (error: unknown) => {
                  const message =
                    error instanceof Error
                      ? error.message
                      : 'No se pudo crear el tenant. Intenta nuevamente.';

                  toast.error(message);
                  patchState(store, { isSubmitting: false, serverErrors: [message] });
                },
              })
            )
          )
        )
      ),

      updateTenant: rxMethod<{ id: number; dto: UpdateTenantRequest }>(
        pipe(
          tap(() => patchState(store, { isSubmitting: true })),
          switchMap(({ id, dto }) =>
            service.update(id, dto).pipe(
              tapResponse({
                next: (tenant) => {
                  toast.success('Tenant actualizado correctamente');
                  patchState(store, {
                    selectedTenant: tenant,
                    items: store.items().map((t) => (t.id === tenant.id ? tenant : t)),
                    isSubmitting: false,
                  });
                },
                error: () => patchState(store, { isSubmitting: false }),
              })
            )
          )
        )
      ),

      setApiCredentials: rxMethod<{ id: number; dto: SetApiCredentialsRequest }>(
        pipe(
          tap(() => patchState(store, { isSubmitting: true })),
          switchMap(({ id, dto }) =>
            service.setApiCredentials(id, dto).pipe(
              switchMap(() => service.getById(id)),
              tapResponse({
                next: (tenant) => {
                  toast.success('Credenciales API actualizadas correctamente');
                  patchState(store, {
                    selectedTenant: tenant,
                    items: store.items().map((t) => (t.id === tenant.id ? tenant : t)),
                    isSubmitting: false,
                  });
                },
                error: () => patchState(store, { isSubmitting: false }),
              })
            )
          )
        )
      ),

      generateSecret: rxMethod<{ id: number; dto: GenerateSecretRequest }>(
        pipe(
          tap(() => patchState(store, { isSubmitting: true })),
          switchMap(({ id, dto }) =>
            service.generateSecret(id, dto).pipe(
              switchMap(() => service.getById(id)),
              tapResponse({
                next: (tenant) => {
                  toast.success('Secreto generado correctamente');
                  patchState(store, {
                    selectedTenant: tenant,
                    items: store.items().map((t) => (t.id === tenant.id ? tenant : t)),
                    isSubmitting: false,
                  });
                },
                error: () => patchState(store, { isSubmitting: false }),
              })
            )
          )
        )
      ),

      revokeSecret: rxMethod<{ id: number; dto: RevokeSecretRequest }>(
        pipe(
          tap(() => patchState(store, { isSubmitting: true })),
          switchMap(({ id, dto }) =>
            service.revokeSecret(id, dto).pipe(
              switchMap(() => service.getById(id)),
              tapResponse({
                next: (tenant) => {
                  toast.warning('Secreto desactivado');
                  patchState(store, {
                    selectedTenant: tenant,
                    items: store.items().map((t) => (t.id === tenant.id ? tenant : t)),
                    isSubmitting: false,
                  });
                },
                error: () => patchState(store, { isSubmitting: false }),
              })
            )
          )
        )
      ),

      setTsaConfig: rxMethod<{ id: number; dto: SetTsaConfigRequest }>(
        pipe(
          tap(() => patchState(store, { isSubmitting: true })),
          switchMap(({ id, dto }) =>
            service.setTsaConfig(id, dto).pipe(
              switchMap(() => service.getById(id)),
              tapResponse({
                next: (tenant) => {
                  toast.success('Configuración TSA guardada');
                  patchState(store, {
                    selectedTenant: tenant,
                    items: store.items().map((t) => (t.id === tenant.id ? tenant : t)),
                    isSubmitting: false,
                  });
                },
                error: () => patchState(store, { isSubmitting: false }),
              })
            )
          )
        )
      ),

      toggleActive: rxMethod<{ id: number; activate: boolean }>(
        pipe(
          tap(() => patchState(store, { isSubmitting: true })),
          switchMap(({ id, activate }) =>
            (activate ? service.activate(id) : service.deactivate(id)).pipe(
              tapResponse({
                next: (tenant) => {
                  toast.success(activate ? 'Tenant habilitado' : 'Tenant inhabilitado');
                  patchState(store, {
                    selectedTenant: tenant,
                    items: store.items().map((t) => (t.id === tenant.id ? tenant : t)),
                    isSubmitting: false,
                  });
                },
                error: () => patchState(store, { isSubmitting: false }),
              })
            )
          )
        )
      ),

      deleteTenant: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isSubmitting: true })),
          switchMap((id) =>
            service.remove(id).pipe(
              tapResponse({
                next: () => {
                  toast.success('Tenant eliminado correctamente');
                  const current = store.selectedTenant();
                  patchState(store, {
                    items: store.items().filter((t) => t.id !== id),
                    selectedTenant: current?.id === id
                      ? { ...current, isDeleted: true, isActive: false }
                      : current,
                    isSubmitting: false,
                  });
                },
                error: () => patchState(store, { isSubmitting: false }),
              })
            )
          )
        )
      ),

      setPage(page: number): void {
        patchState(store, (s) => ({ pagination: { ...s.pagination, page } }));
      },

      setPageSize(pageSize: number): void {
        patchState(store, (s) => ({ pagination: { ...s.pagination, pageSize, page: 1 } }));
      },

      setSearch(searchTerm: string): void {
        patchState(store, (s) => ({ pagination: { ...s.pagination, searchTerm, page: 1 } }));
      },

      clearSelected(): void {
        patchState(store, { selectedTenant: null });
      },
    })
  )
);
