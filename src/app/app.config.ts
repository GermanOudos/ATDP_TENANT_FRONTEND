import { ApplicationConfig, APP_INITIALIZER, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTaiga } from '@taiga-ui/core';
import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CirclePause,
  CircleX,
  Clock,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutList,
  LoaderCircle,
  LogOut,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Settings2,
  ShieldCheck,
  SquareMenu,
  Trash2,
  User,
  Users,
  X,
  LucideAngularModule,
} from 'lucide-angular';
import { of, firstValueFrom, forkJoin } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';

import { routes } from './app.routes';
import { apiPrefixInterceptor } from '@core/interceptors/api-prefix.interceptor';
import { credentialsInterceptor } from '@core/interceptors/credentials.interceptor';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { AuthService } from '@core/auth/auth.service';
import { AuthStore } from '@core/auth/auth.store';
import { MetadataService } from '@core/services/metadata.service';
import { MetadataStore } from '@core/metadata/metadata.store';

const lucideIcons = {
  Layers,
  Plus,
  Pencil,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  LogOut,
  RefreshCw,
  Building2,
  KeyRound,
  ArrowLeft,
  Settings,
  Settings2,
  Ban,
  Server,
  Search,
  LayoutList,
  Trash2,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  // Aliases to support icon names used in templates.
  CheckCircle: CircleCheck,
  CircleCheck,
  Clock,
  PauseCircle: CirclePause,
  AlertCircle: CircleAlert,
  XCircle: CircleX,
  Loader2: LoaderCircle,
  MenuSquare: SquareMenu,
};

function initializeApp(
  authService: AuthService,
  authStore: InstanceType<typeof AuthStore>,
  metadataService: MetadataService,
  metadataStore: MetadataStore
) {
  return () =>
    firstValueFrom(
      forkJoin([
        authService.getMe().pipe(
          timeout(5000),
          tap((session) => { if (session) authStore.setSession(session); }),
          catchError(() => of(null))
        ),
        metadataService.getValidationRules().pipe(
          timeout(5000),
          tap((rules) => metadataStore.setRules(rules)),
          catchError(() => of(null))
        ),
      ])
    );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    provideTaiga({
      mode: 'light',
      apis: 'stable',
      fontScaling: true,
      scrollbars: 'custom',
    }),
    importProvidersFrom(LucideAngularModule.pick(lucideIcons)),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        apiPrefixInterceptor,
        credentialsInterceptor,
        loadingInterceptor,
        errorInterceptor,
      ])
    ),
    NG_EVENT_PLUGINS,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService, AuthStore, MetadataService, MetadataStore],
      multi: true,
    },
  ],
};
