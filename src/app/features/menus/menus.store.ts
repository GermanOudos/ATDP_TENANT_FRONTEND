import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { MenuDto, MenuTreeNode } from '@schemas/menu.schema';
import { PaginatedResponse, PaginationParams } from '@schemas/api-response.schema';
import { MenusService } from './menus.service';
import { ToastService } from '@core/services/toast.service';
import { buildMenuTree } from './menus.util';

interface MenusState {
  items: MenuDto[];
  pagination: { page: number; pageSize: number; totalRecords: number; totalPages: number; searchTerm: string };
  isLoading: boolean;
  isSubmitting: boolean;
}

const initialState: MenusState = {
  items: [],
  pagination: { page: 1, pageSize: 100, totalRecords: 0, totalPages: 0, searchTerm: '' },
  isLoading: false,
  isSubmitting: false,
};

export const MenusStore = signalStore(
  withState<MenusState>(initialState),
  withComputed(({ items }) => ({
    menuTree: computed<MenuTreeNode[]>(() => buildMenuTree(items())),
    paginationParams: computed<PaginationParams>(() => ({
      page: 1,
      pageSize: 100,
    })),
  })),
  withMethods((store, service = inject(MenusService), toast = inject(ToastService)) => ({
    loadAll: rxMethod<PaginationParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((params) =>
          service.getAll(params).pipe(
            tapResponse({
              next: (res: PaginatedResponse<MenuDto>) => {
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
    deleteMenu: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isSubmitting: true })),
        switchMap((id) =>
          service.remove(id).pipe(
            tapResponse({
              next: () => {
                toast.success('Menú eliminado correctamente');
                patchState(store, { items: store.items().filter((m) => m.idMenu !== id), isSubmitting: false });
              },
              error: () => patchState(store, { isSubmitting: false }),
            })
          )
        )
      )
    ),
  }))
);
