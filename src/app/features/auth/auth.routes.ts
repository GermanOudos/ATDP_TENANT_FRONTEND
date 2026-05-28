import { Routes } from '@angular/router';
import { loginRedirectGuard } from '@core/guards/login-redirect.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    canActivate: [loginRedirectGuard],
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
];
