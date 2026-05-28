import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { RoleDto } from '@schemas/role.schema';
import { PaginatedResponse, PaginationParams } from '@schemas/api-response.schema';
import { RolesService } from './roles.service';
import { ToastService } from '@core/services/toast.service';

interface RolesState {
  items: RoleDto[];
  pagination: { page: number; pageSize: number; totalRecords: number; totalPages: number; searchTerm: string };
  isLoading: boolean;
  isSubmitting: boolean;
}

const initialState: RolesState = {
  items: [],
  pagination: { page: 1, pageSize: 10, totalRecords: 0, totalPages: 0, searchTerm: '' },
  isLoading: false,
  isSubmitting: false,
};

export const RolesStore = signalStore(
  withState<RolesState>(initialState),
  withComputed(({ pagination }) => ({
    hasPreviousPage: computed(() => pagination().page > 1),
    hasNextPage: computed(() => pagination().page < pagination().totalPages),
    paginationParams: computed<PaginationParams>(() => ({
      page: pagination().page,
      pageSize: pagination().pageSize,
      searchTerm: pagination().searchTerm,
    })),
  })),
  withMethods((store, service = inject(RolesService), toast = inject(ToastService)) => ({
    loadAll: rxMethod<PaginationParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((params) =>
          service.getAll(params).pipe(
            tapResponse({
              next: (res: PaginatedResponse<RoleDto>) => {
                patchState(store, {
                  items: res.data,
                  pagination: { ...store.pagination(), totalRecords: res.totalRecords, totalPages: res.totalPages },
                  isLoading: false,
                });
              },
              error: () => patchState(store, { isLoading: false }),
            })
          )
        )
      )
    ),
    deleteRole: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isSubmitting: true })),
        switchMap((id) =>
          service.remove(id).pipe(
            tapResponse({
              next: () => {
                toast.success('Rol eliminado correctamente');
                patchState(store, { items: store.items().filter((r) => r.idRole !== id), isSubmitting: false });
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
  }))
);
