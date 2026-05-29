import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { UserDto, CreateUserRequest, UpdateUserRequest } from '@schemas/user.schema';
import { PaginatedResponse, PaginationParams } from '@schemas/api-response.schema';
import { UsersService } from './users.service';
import { ToastService } from '@core/services/toast.service';

interface UsersState {
  items: UserDto[];
  selectedUser: UserDto | null;
  pagination: { page: number; pageSize: number; totalRecords: number; totalPages: number; searchTerm: string };
  isLoading: boolean;
  isSubmitting: boolean;
}

const initialState: UsersState = {
  items: [],
  selectedUser: null,
  pagination: { page: 1, pageSize: 10, totalRecords: 0, totalPages: 0, searchTerm: '' },
  isLoading: false,
  isSubmitting: false,
};

export const UsersStore = signalStore(
  withState<UsersState>(initialState),
  withComputed(({ items, pagination }) => ({
    activeCount: computed(() => items().filter((u) => u.isActive && !u.isDeleted).length),
    hasPreviousPage: computed(() => pagination().page > 1),
    hasNextPage: computed(() => pagination().page < pagination().totalPages),
    paginationParams: computed<PaginationParams>(() => ({
      page: pagination().page,
      pageSize: pagination().pageSize,
      searchTerm: pagination().searchTerm,
    })),
  })),
  withMethods((store, service = inject(UsersService), toast = inject(ToastService)) => ({
    loadAll: rxMethod<PaginationParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((params) =>
          service.getAll(params).pipe(
            tapResponse({
              next: (res: PaginatedResponse<UserDto>) => {
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
    loadById: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) =>
          service.getById(id).pipe(
            tapResponse({
              next: (user) => patchState(store, { selectedUser: user, isLoading: false }),
              error: () => patchState(store, { isLoading: false }),
            })
          )
        )
      )
    ),
    createUser: rxMethod<CreateUserRequest>(
      pipe(
        tap(() => patchState(store, { isSubmitting: true })),
        switchMap((dto) =>
          service.create(dto).pipe(
            tapResponse({
              next: (user) => {
                toast.success('Usuario creado correctamente');
                patchState(store, {
                  items: [user, ...store.items()],
                  isSubmitting: false,
                });
              },
              error: () => patchState(store, { isSubmitting: false }),
            })
          )
        )
      )
    ),
    updateUser: rxMethod<{ id: number; dto: UpdateUserRequest }>(
      pipe(
        tap(() => patchState(store, { isSubmitting: true })),
        switchMap(({ id, dto }) =>
          service.update(id, dto).pipe(
            tapResponse({
              next: (user) => {
                toast.success('Usuario actualizado correctamente');
                patchState(store, {
                  selectedUser: user,
                  items: store.items().map((u) => (u.id === user.id ? user : u)),
                  isSubmitting: false,
                });
              },
              error: () => patchState(store, { isSubmitting: false }),
            })
          )
        )
      )
    ),
    toggleActive: rxMethod<{ id: number; isActive: boolean }>(
      pipe(
        tap(() => patchState(store, { isSubmitting: true })),
        switchMap(({ id, isActive }) =>
          service.toggleActive(id, isActive).pipe(
            tapResponse({
              next: (user) => {
                toast.success(isActive ? 'Usuario habilitado' : 'Usuario inhabilitado');
                patchState(store, {
                  items: store.items().map((u) => (u.id === user.id ? user : u)),
                  isSubmitting: false,
                });
              },
              error: () => patchState(store, { isSubmitting: false }),
            })
          )
        )
      )
    ),

    deleteUser: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isSubmitting: true })),
        switchMap((id) =>
          service.remove(id).pipe(
            tapResponse({
              next: () => {
                toast.success('Usuario eliminado correctamente');
                patchState(store, { items: store.items().filter((u) => u.id !== id), isSubmitting: false });
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
  }))
);
