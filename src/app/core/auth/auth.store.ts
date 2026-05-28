import { computed, inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthResponse, LoginRequest } from '@schemas/auth.schema';

interface AuthState {
  session: AuthResponse | null;
  isLoading: boolean;
  errorMessage: string | null;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({ session: null, isLoading: false, errorMessage: null }),
  withComputed(({ session }) => ({
    isAuthenticated: computed(() => session() !== null),
    currentUser: computed(() => session()),
    displayName: computed(() => session()?.fullName ?? session()?.username ?? ''),
    mustChangePassword: computed(() => session()?.mustChangePassword ?? false),
  })),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      injector = inject(Injector)
    ) => ({
      login: rxMethod<LoginRequest>(
        pipe(
          tap(() => patchState(store, { isLoading: true, errorMessage: null })),
          switchMap((credentials) =>
            authService.login(credentials).pipe(
              tapResponse({
                next: (session) => {
                  patchState(store, { session, isLoading: false, errorMessage: null });
                  const router = injector.get(Router);
                  if (session.mustChangePassword) {
                    router.navigate(['/change-password']);
                  } else {
                    router.navigate(['/dashboard']);
                  }
                },
                error: (error: unknown) => {
                  const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión.';
                  patchState(store, { isLoading: false, errorMessage: message });
                },
              })
            )
          )
        )
      ),
      logout: rxMethod<void>(
        pipe(
          switchMap(() =>
            authService.logout().pipe(
              tapResponse({
                next: () => {
                  patchState(store, { session: null });
                  const router = injector.get(Router);
                  router.navigate(['/login']);
                },
                error: () => {
                  patchState(store, { session: null });
                  const router = injector.get(Router);
                  router.navigate(['/login']);
                },
              })
            )
          )
        )
      ),
      setSession(session: AuthResponse): void {
        patchState(store, { session });
      },
      clearSession(): void {
        patchState(store, { session: null });
      },
      clearError(): void {
        patchState(store, { errorMessage: null });
      },
    })
  )
);
